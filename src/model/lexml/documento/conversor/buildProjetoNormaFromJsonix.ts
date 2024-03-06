import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isOmissis } from '../../../dispositivo/tipo';
import { Metadado, ParteInicial, TextoArticulado } from '../../../documento';
import { ClassificacaoDocumento } from '../../../documento/classificacao';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../hierarquia/hierarquiaUtil';
import { DispositivoOriginal } from '../../situacao/dispositivoOriginal';
import { ProjetoNorma } from '../projetoNorma';
import { getTipo } from '../urnUtil';
import { isArtigo } from './../../../dispositivo/tipo';

export let isEmendamento = false;
let ultimoDispositivoCriado: Dispositivo;

// Workaround para o problema de textos que possuam tags <b> ou <i> contendo <a> no meio
// O Quill faz um tratamento para que as tags <b> e <i> fiquem dentro da tag <a>
// Nesse caso, é necessário fazer esse ajuste antecipadamente para que o editor não trate a transformação como uma alteração
const ajustarTextosParaQuill = (projetoNorma: ProjetoNorma): void => {
  if (window.process.env.testMode) return;

  const fnAjustaFormatoQuill = (texto: string, container: any, quill: Quill): string => {
    const regexMatchTagsBoldOuItalicContendoTagAnchorDentro = /<(b|i)>(?:(?!(<\/\1>)).)*<a[^>]*>.*<\/a>.*<\/\1>/gi;
    if (texto?.match(regexMatchTagsBoldOuItalicContendoTagAnchorDentro)) {
      quill.setContents(quill.clipboard.convert(texto));
      return container.querySelector('.ql-editor p')!.innerHTML;
    }
    return texto;
  };

  const tempContainer = document.createElement('div');
  const tempQuill = new Quill(tempContainer, {});

  if (projetoNorma.ementa) {
    projetoNorma.ementa.texto = fnAjustaFormatoQuill(projetoNorma.ementa.texto, tempContainer, tempQuill);
  }

  if (projetoNorma.articulacao) {
    getDispositivoAndFilhosAsLista(projetoNorma.articulacao).forEach(d => {
      d.texto = fnAjustaFormatoQuill(d.texto, tempContainer, tempQuill);
    });
  }
};

export const buildProjetoNormaFromJsonix = (documentoLexml: any, emendamento = false): ProjetoNorma => {
  isEmendamento = emendamento;

  if (!documentoLexml?.value?.projetoNorma) {
    throw new Error('Não se trata de um documento lexml válido');
  }

  const projetoNorma: ProjetoNorma = {
    classificacao: documentoLexml.value?.projetoNorma.norma ? ClassificacaoDocumento.NORMA : ClassificacaoDocumento.PROJETO,
    tipo: getTipo(getUrn(documentoLexml)),
    ...getMetadado(documentoLexml),
    ...getParteInicial(documentoLexml),
    ...getTextoArticulado(documentoLexml.value.projetoNorma.norma || documentoLexml.value.projetoNorma.projeto),
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

const retiraCaracteresDesnecessarios = (texto: string): any => {
  return texto?.replace(/[\n]/g, '').trim();
};

export const getUrn = (documento: any): string => {
  return documento?.value?.metadado?.identificacao?.urn;
};

const getMetadado = (documento: any): Metadado => {
  return {
    urn: getUrn(documento),
  };
};

const getParteInicial = (documento: any): ParteInicial => {
  const parteInicial = documento?.value?.projetoNorma?.norma?.parteInicial;
  const epigrafe = parteInicial?.epigrafe?.content[0] ?? '';
  const ementa = buildContent(parteInicial?.ementa.content);
  const preambulo = parteInicial?.preambulo?.p?.length ? parteInicial?.preambulo?.p[0].content[0] : '';

  return {
    epigrafe: retiraCaracteresDesnecessarios(epigrafe),
    ementa: buildDispositivoEmenta(retiraCaracteresDesnecessarios(ementa)),
    preambulo: retiraCaracteresDesnecessarios(preambulo),
  };
};

export const getTextoArticulado = (norma: any): TextoArticulado => {
  return {
    articulacao: buildArticulacao(norma.articulacao),
  };
};

const buildDispositivoEmenta = (texto?: string): Dispositivo | undefined => {
  if (!texto) {
    return;
  }

  const dispositivo = criaDispositivo(createArticulacao(), 'Ementa');
  dispositivo.pai = undefined;
  dispositivo.texto = substituiAspasRetasPorCurvas(texto);
  dispositivo.rotulo = '';
  dispositivo.id = 'ementa';
  if (isEmendamento) {
    dispositivo.situacao = new DispositivoOriginal();
  }

  return dispositivo;
};

const buildArticulacao = (tree: any): Articulacao => {
  const articulacao = createArticulacao();

  buildTree(articulacao, tree.lXhier, []);

  return articulacao;
};

const buildTree = (pai: Dispositivo, filhos: any, cabecasAlteracao: Dispositivo[]): void => {
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

      pai.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el));

      (pai as Artigo).caput!.href = el.value?.href;
      (pai as Artigo).caput!.id = el.value?.id;
      buildAlteracao(pai, el.value?.alteracao, cabecasAlteracao);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao);
    } else if (el.name?.localPart === 'alteracao') {
      buildAlteracao(pai, el, cabecasAlteracao);
      buildTree((pai as Artigo).caput!, el.value?.lXcontainersOmissis, cabecasAlteracao);
    } else {
      if (el.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(el);
      } else {
        // Impede que sejam criados filhos em artigos que já possuam alterações
        if (!pai.alteracoes) {
          dispositivo = buildDispositivo(pai, el, cabecasAlteracao);
          buildTree(dispositivo, el.value?.lXhier ?? el.value?.lXcontainersOmissis, cabecasAlteracao);
        }
      }
    }
  });
};

const buildAlteracao = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[]): void => {
  if (el) {
    createAlteracao(pai);
    pai.alteracoes!.id = el.id;
    pai.alteracoes!.base = el.base;
    if (isEmendamento) {
      pai.alteracoes!.situacao = new DispositivoOriginal();
    }
    el.content?.forEach((c: any) => {
      if (c.name?.localPart === 'p') {
        adicionaTextoAoUltimoDispositivoCriado(c);
      } else {
        const d = buildDispositivo(pai.alteracoes!, c, cabecasAlteracao);
        d.isDispositivoAlteracao = true;
        d.rotulo = c.value?.rotulo;
        buildTree(d!, c.value?.lXhier ?? c.value?.lXcontainersOmissis, cabecasAlteracao);
      }
    });
  }
};

const adicionaTextoAoUltimoDispositivoCriado = (el: any): void => {
  ultimoDispositivoCriado.texto = (ultimoDispositivoCriado.texto + ' ' + retiraCaracteresDesnecessarios(buildContent(el.value?.content))).replace(/\s+/g, ' ');
};

const buildDispositivo = (pai: Dispositivo, el: any, cabecasAlteracao: Dispositivo[]): Dispositivo => {
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
  if (isEmendamento) {
    dispositivo.situacao = new DispositivoOriginal();
    if (isArtigo(dispositivo)) {
      (dispositivo as Artigo).caput!.situacao = new DispositivoOriginal();
    }
  }
  dispositivo.texto = el.value?.textoOmitido ? TEXTO_OMISSIS : retiraCaracteresDesnecessarios(buildContentDispositivo(el));

  ultimoDispositivoCriado = dispositivo;
  return dispositivo;
};

// const montaReferencia = (value: any): string => {
//   return `<a href="${value.href}"> ${value.content[0]} </a>`;
// };

const buildContentDispositivo = (el: any): string => {
  let texto = '';
  if (el.value?.nomeAgrupador) {
    return el.value.nomeAgrupador.content[0] ?? '';
  } else {
    el.value?.p
      ?.map((p: any) => p)
      ?.map((a: any) => a.content)
      .forEach((content: any) => (texto += buildContent(content)));
  }
  return substituiAspasRetasPorCurvas(texto);
};

const substituiAspasRetasPorCurvas = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const elements = div.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const innerHTML = elements[i].innerHTML;
    if (innerHTML.indexOf('"') !== -1) {
      const newInnerHTML = innerHTML.replace(/"(?=\w|$)/g, '&#8220;').replace(/(?=[\w,.?!\-")]|^)"/g, '&#8221;');
      elements[i].innerHTML = newInnerHTML;
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
      let elementTexto = element;
      elementTexto = elementTexto.replace(/"(?=\w|$)/g, '&#8220;');
      elementTexto = elementTexto.replace(/(?=[\w,.?!\-")]|^)"/g, '&#8221;');
      texto += elementTexto;
    }
  });
  return texto;
};

const montaTag = (name: any, value: any): string => {
  const localPart = name.localPart;
  if (localPart === 'span' && value.href) {
    return `<a href="${value.href}">${buildContent(value.content)}</a>`;
  }
  if (localPart === 'b' || localPart === 'i' || localPart === 'sub' || localPart === 'sup') {
    return `<${localPart}>${buildContent(value.content)}</${localPart}>`;
  }
  return '';
};
