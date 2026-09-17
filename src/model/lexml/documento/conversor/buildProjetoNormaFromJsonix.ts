import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isOmissis } from '../../../dispositivo/tipo';
import { Metadado, ParteInicial, TextoArticulado } from '../../../documento';
import { ClassificacaoDocumento } from '../../../documento/classificacao';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../hierarquia/hierarquiaUtil';
import { ProjetoNorma } from '../projetoNorma';
import PrivateQuill from '../../../../internal/quill/private-quill';
import { ANO_PROVISORIO, getAno, getTipo, getTipoDocumentoUrn } from '../urnUtil';

let ultimoDispositivoCriado: Dispositivo;

// Workaround para o problema de textos que possuam tags <b> ou <i> contendo <a> no meio
// O Quill faz um tratamento para que as tags <b> e <i> fiquem dentro da tag <a>
// Nesse caso, é necessário fazer esse ajuste antecipadamente para que o editor não trate a transformação como uma alteração
const ajustarTextosParaQuill = (projetoNorma: ProjetoNorma): void => {
  if (window.process.env.testMode) return;

  const fnAjustaFormatoQuill = (texto: string, container: any, quill: InstanceType<typeof PrivateQuill>): string => {
    const regexMatchTagsBoldOuItalicContendoTagAnchorDentro = /<(b|i)>(?:(?!(<\/\1>)).)*<a[^>]*>.*<\/a>.*<\/\1>/gi;
    if (texto?.match(regexMatchTagsBoldOuItalicContendoTagAnchorDentro)) {
      quill.setContents(quill.clipboard.convert(texto));
      return container.querySelector('.ql-editor p')!.innerHTML;
    }
    return texto;
  };

  const tempContainer = document.createElement('div');
  const tempQuill = new PrivateQuill(tempContainer, {});

  if (projetoNorma.ementa) {
    projetoNorma.ementa.texto = fnAjustaFormatoQuill(projetoNorma.ementa.texto, tempContainer, tempQuill);
  }

  if (projetoNorma.articulacao) {
    getDispositivoAndFilhosAsLista(projetoNorma.articulacao).forEach(d => {
      d.texto = fnAjustaFormatoQuill(d.texto, tempContainer, tempQuill);
    });
  }
};

export const buildProjetoNormaFromJsonix = (documentoLexml: any, preservarTexto = false): ProjetoNorma => {
  if (!documentoLexml?.value?.projetoNorma) {
    throw new Error('Não se trata de um documento lexml válido');
  }

  if (preservarTexto) documentoLexml = escaparTextoJsonix(documentoLexml);

  const projetoNorma: ProjetoNorma = {
    classificacao: documentoLexml.value?.projetoNorma.norma ? ClassificacaoDocumento.NORMA : ClassificacaoDocumento.PROJETO,
    tipo: getTipo(getUrn(documentoLexml)),
    ...getMetadado(documentoLexml),
    ...getParteInicial(documentoLexml, preservarTexto),
    ...getTextoArticulado(documentoLexml.value.projetoNorma.norma || documentoLexml.value.projetoNorma.projeto, buildTextoEpigrafeFromDocument(documentoLexml), preservarTexto),
  };

  if (projetoNorma.articulacao) {
    projetoNorma.articulacao.projetoNorma = projetoNorma;
    if (projetoNorma.ementa) {
      projetoNorma.ementa.pai = projetoNorma.articulacao;
    }
  }

  ajustarTextosParaQuill(projetoNorma);

  return projetoNorma;
};

/** No arquivo Jsonix, strings são texto literal; somente os objetos representam marcação. */
const escaparTextoJsonix = (valor: any): any => {
  if (Array.isArray(valor)) return valor.map(escaparTextoJsonix);
  if (!valor || typeof valor !== 'object') return valor;
  return Object.fromEntries(
    Object.entries(valor).map(([chave, conteudo]) => [
      chave,
      chave === 'content' && Array.isArray(conteudo)
        ? conteudo.map(item => (typeof item === 'string' ? item.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : escaparTextoJsonix(item)))
        : escaparTextoJsonix(conteudo),
    ])
  );
};

const retiraCaracteresDesnecessarios = (texto: string): any => {
  return texto?.replace(/[\n]/g, '').trim();
};

export const getUrn = (documento: any): string => {
  return documento?.value?.metadado?.identificacao?.urn;
};

/**
 * Lê os ids de remissões internas inválidas de `MetadadoProprietario/lexedit:Metadado`
 * (especificações 00 e 10) — tolerante a outros grupos do LexEdit ainda não implementados,
 * que simplesmente são ignorados.
 */
export const lerIdsRemissoesInvalidas = (documento: any): string[] => {
  const grupos: any[] = documento?.value?.metadado?.metadadoProprietario ?? [];
  const ids = new Set<string>();
  for (const grupo of grupos) {
    const refIds = grupo?.lexedit?.remissoesInternasInvalidas?.refIdsRemissoesInternas;
    if (Array.isArray(refIds)) refIds.forEach((id: string) => ids.add(id));
  }
  return Array.from(ids);
};

const getMetadado = (documento: any): Metadado => {
  return {
    urn: getUrn(documento),
  };
};

const getParteInicial = (documento: any, preservarTexto: boolean): ParteInicial => {
  const estrutura = documento?.value?.projetoNorma;
  const parteInicial = (estrutura?.norma ?? estrutura?.projeto)?.parteInicial;
  const epigrafe = parteInicial?.epigrafe ? buildContent(parteInicial.epigrafe.content) : buildTextoEpigrafe(getUrn(documento));
  const ementa = buildContent(parteInicial?.ementa?.content);
  const paragrafos = parteInicial?.preambulo?.p ?? [];
  const preambulo = paragrafos.length > 1 ? paragrafos.map(p => `<p>${buildContent(p.content)}</p>`).join('') : buildContent(paragrafos[0]?.content);

  return {
    epigrafe: retiraCaracteresDesnecessarios(epigrafe),
    ementa: buildDispositivoEmenta(retiraCaracteresDesnecessarios(ementa), epigrafe, preservarTexto),
    preambulo: retiraCaracteresDesnecessarios(preambulo),
  };
};

export const getTextoArticulado = (norma: any, textoArticulacao?: string, preservarTexto = false): TextoArticulado => {
  return {
    articulacao: buildArticulacao(norma.articulacao, textoArticulacao, preservarTexto),
  };
};

const buildDispositivoEmenta = (texto: string, textoArticulacao: string, preservarTexto: boolean): Dispositivo | undefined => {
  const dispositivo = criaDispositivo(createArticulacao(textoArticulacao), 'Ementa');
  dispositivo.pai = undefined;
  dispositivo.texto = preservarTexto ? texto : substituiAspasRetasPorCurvas(texto);
  dispositivo.rotulo = '';
  dispositivo.id = 'ementa';

  return dispositivo;
};

const buildTextoEpigrafeFromDocument = (documentoLexml: any): string => {
  const doc = documentoLexml.value.projetoNorma.norma || documentoLexml.value.projetoNorma.projeto;
  const textoEpigrafe = buildContent(doc.parteInicial?.epigrafe?.content);

  return textoEpigrafe ? textoEpigrafe : buildTextoEpigrafe(getUrn(documentoLexml));
};

const buildTextoEpigrafe = (urn: string): string => {
  const tipo = getTipoDocumentoUrn(urn);
  const ano = getAno(urn);
  return tipo ? `${tipo.descricao.toUpperCase()} Nº , DE ${ano === ANO_PROVISORIO ? '' : ano}` : '';
};

const buildArticulacao = (tree: any, textoArticulacao: string | undefined, preservarTexto: boolean): Articulacao => {
  const articulacao = createArticulacao(textoArticulacao);

  const filhos = tree.lXhier ? (tree.lXhier.lXhier ? tree.lXhier.lXhier : tree.lXhier) : tree;
  buildTree(articulacao, filhos, [], preservarTexto);

  return articulacao;
};

const buildTree = (pai: Dispositivo, filhos: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): void => {
  if (!pai || !filhos) {
    return;
  }

  filhos?.forEach((el: any) => {
    let dispositivo;
    const notaAlteracao = el.value?.notaAlteracao;

    if (el.value?.fechaAspas) {
      const cabecaAlteracao = cabecasAlteracao.pop();
      if (cabecaAlteracao) {
        cabecaAlteracao.notaAlteracao = el.value?.notaAlteracao;
      }
    }

    if (el.name?.localPart === 'Caput') {
      if (el.value?.abreAspas === 's') {
        cabecasAlteracao.push(dispositivo);
        dispositivo.rotulo = el.value?.rotulo;
        dispositivo.cabecaAlteracao = true;
        dispositivo.notaAlteracao = notaAlteracao;
      } else if (el.value?.rotulo) {
        dispositivo.rotulo = el.value.rotulo;
        dispositivo.createNumeroFromRotulo(dispositivo.rotulo);
      }

      pai.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el, preservarTexto));

      (pai as Artigo).caput!.href = el.value?.href;
      (pai as Artigo).caput!.id = el.value?.id;
      buildAlteracao(pai, el.value?.alteracao, cabecasAlteracao, preservarTexto);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
    } else if (el.name?.localPart === 'alteracao') {
      buildAlteracao(pai, el, cabecasAlteracao, preservarTexto);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
    } else {
      if (el.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(el);
      } else {
        // Impede que sejam criados filhos em artigos que já possuam alterações
        if (!pai.alteracoes) {
          dispositivo = buildDispositivo(pai, el, cabecasAlteracao, preservarTexto);
          buildTree(dispositivo, el.value?.lXhier ?? el.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
        }
      }
    }
  });
};

const buildAlteracao = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): void => {
  if (el) {
    createAlteracao(pai);
    pai.alteracoes!.id = el.id;
    pai.alteracoes!.base = el.base;
    el.content?.forEach((c: any) => {
      if (c.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(c);
      } else {
        const d = buildDispositivo(pai.alteracoes!, c, cabecasAlteracao, preservarTexto);
        d.isDispositivoAlteracao = true;
        d.rotulo = c.value?.rotulo;
        buildTree(d!, c.value?.lXhier ?? c.value?.lXcontainersOmissis, cabecasAlteracao, preservarTexto);
      }
    });
  }
};

const adicionaTextoAoUltimoDispositivoCriado = (el: any): void => {
  ultimoDispositivoCriado.texto = (ultimoDispositivoCriado.texto + ' ' + retiraCaracteresDesnecessarios(buildContent(el.value?.content))).replace(/\s+/g, ' ');
};

const buildDispositivo = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[], preservarTexto: boolean): Dispositivo => {
  const dispositivo = criaDispositivo(pai, el.name?.localPart);

  const notaAlteracao = el.value?.notaAlteracao;

  if (el.value?.fechaAspas) {
    const cabecaAlteracao = cabecasAlteracao.pop();
    if (cabecaAlteracao) {
      cabecaAlteracao.notaAlteracao = el.value?.notaAlteracao;
    }
  }

  if (!isOmissis(dispositivo)) {
    if (el.value?.abreAspas === 's') {
      cabecasAlteracao.push(dispositivo);
      dispositivo.rotulo = el.value?.rotulo;
      dispositivo.cabecaAlteracao = true;
      dispositivo.notaAlteracao = notaAlteracao;
    } else {
      dispositivo.rotulo = el.value?.rotulo;
    }
    dispositivo.createNumeroFromRotulo(dispositivo.rotulo!);
  }

  dispositivo.href = el.value?.href;
  dispositivo.id = el.value?.id;
  dispositivo.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el, preservarTexto));
  dispositivo.tituloDispositivo = buildContent(el.value?.tituloDispositivo?.content);

  ultimoDispositivoCriado = dispositivo;
  return dispositivo;
};

const buildContentDispositivo = (el: any, preservarTexto: boolean): string => {
  let texto = '';
  if (el.value?.nomeAgrupador) {
    return getTextoSemHtml(el.value.nomeAgrupador.content);
  } else {
    el.value?.p
      ?.map((p: any) => p)
      ?.map((a: any) => a.content)
      .forEach((content: any) => (texto += buildContent(content)));
  }
  return preservarTexto ? texto : substituiAspasRetasPorCurvas(texto);
};

const getTextoSemHtml = (c: any): string => {
  let ret = '';
  c.forEach(ci => {
    if (ci.value) {
      ret += getTextoSemHtml(ci.value.content);
    } else {
      ret += ci ?? '';
    }
    ret += ' ';
  });
  return ret.trim();
};

const substituiAspasRetasPorCurvas = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.indexOf('"') !== -1) {
      // Fecha se a aspa reta for precedida por letra/d\u00EDgito/pontua\u00E7\u00E3o (ou outra aspa curva j\u00E1 aberta); abre nos demais casos.
      node.textContent = node.textContent.replace(/"/g, (_match, offset: number, str: string) => {
        const anterior = str[offset - 1];
        const isFechamento = anterior !== undefined && /[\w,.?!)\-\u201C]/.test(anterior);
        return isFechamento ? '\u201D' : '\u201C';
      });
    }
  }
  return div.innerHTML.replace(/&nbsp;/g, ' ');
};

export const buildContent = (content: any): string => {
  let texto = '';
  content?.forEach((element: any) => {
    if (element.value) {
      texto += montaTag(element.name, element.value);
    } else {
      texto += element;
    }
  });
  return texto;
};

const montaTag = (name: any, value: any): string => {
  const localPart = name.localPart;
  //TODO Tentar montar com span.
  if (localPart === 'Remissao' && value.href) {
    const href = value.href as string;
    if (href.startsWith('urn:lex:')) {
      // Remissão externa: href = "urn:lex:...!fragmento" ou "urn:lex:..."
      const sepIdx = href.indexOf('!');
      const urn = sepIdx >= 0 ? href.substring(0, sepIdx) : href;
      const fragmento = sepIdx >= 0 ? href.substring(sepIdx + 1) : '';
      const attrFragmento = fragmento ? ` data-fragmento="${fragmento}"` : '';
      return `<a data-urn="${urn}"${attrFragmento} class="lexml-remissao-externa" href="#" target="_self">${buildContent(value.content)}</a>`;
    }
    const lexmlId = href;
    const atributoRiId = value.id ? ` data-ri-id="${value.id}"` : '';
    return `<a href="${lexmlId}" data-lexml-ref="${lexmlId}"${atributoRiId} class="lexml-remissao-interna" target="_self">${buildContent(value.content)}</a>`;
  }
  if (localPart === 'span' && value.href) {
    const spanHref = value.href as string;
    if (spanHref.startsWith('urn:lex:')) {
      // GenInline com URN: tratar como remissão externa (mesmo caminho que Remissao)
      const sepIdx = spanHref.indexOf('!');
      const urn = sepIdx >= 0 ? spanHref.substring(0, sepIdx) : spanHref;
      const fragmento = sepIdx >= 0 ? spanHref.substring(sepIdx + 1) : '';
      const attrFragmento = fragmento ? ` data-fragmento="${fragmento}"` : '';
      return `<a data-urn="${urn}"${attrFragmento} class="lexml-remissao-externa" href="#" target="_self">${buildContent(value.content)}</a>`;
    }
    return `<a href="${spanHref}">${buildContent(value.content)}</a>`;
  }
  if (['b', 'i', 'u', 'sub', 'sup', 'span'].includes(localPart)) {
    return `<${localPart}>${buildContent(value.content)}</${localPart}>`;
  }
  return '';
};
