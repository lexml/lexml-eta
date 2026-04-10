import {
  isDispositivoAlteracao,
  isUltimaAlteracao,
  getDispositivoCabecaAlteracao,
  isDispositivoCabecaAlteracao,
  isCaputComIrmaoUnico,
  isOmissisIrmaoUnico,
} from '../../hierarquia/hierarquiaUtil';
import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isOmissis } from '../../../dispositivo/tipo';
import { TEXTO_OMISSIS } from '../../conteudo/textoOmissis';
import { buildHref, buildId, buildIdAlteracao } from '../../util/idUtil';
import { isNorma, ProjetoNorma } from '../projetoNorma';
import { isValidText } from '../../../../util/string-util';
import { RemissaoInternaValue } from '../../../remissao';
import { removerSpanParchmentRemissao, substituirTextoRefForaDeLinks } from '../../../../util/html-util';

type Remissoes = Record<number, RemissaoInternaValue[]>;

export const buildJsonixFromProjetoNorma = (projetoNorma: ProjetoNorma, urn: string, remissoes?: Remissoes): any => {
  const resultado = montaCabecalho(urn);
  resultado.value.projetoNorma = montaProjetoNorma(projetoNorma, remissoes);
  return resultado;
};

export const buildJsonixArticulacaoFromProjetoNorma = (articulacaoProjetoNorma: Articulacao): any => {
  const articulacao = {
    TYPE_NAME: 'br_gov_lexml__1.Articulacao',
    lXhier: buildTree(articulacaoProjetoNorma, { articulacao: {} }),
  };

  return articulacao;
};

const montaCabecalho = (urn: string): any => {
  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'LexML',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}LexML',
      string: '{http://www.lexml.gov.br/1.0}LexML',
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.LexML',
      metadado: {
        TYPE_NAME: 'br_gov_lexml__1.Metadado',
        identificacao: {
          TYPE_NAME: 'br_gov_lexml__1.Identificacao',
          urn: urn,
        },
      },
    },
  };
};

const montaProjetoNorma = (projetoNorma: any, remissoes?: Remissoes): any => {
  const p = {
    TYPE_NAME: 'br_gov_lexml__1.ProjetoNorma',
  };

  p[isNorma(projetoNorma) ? 'norma' : 'projeto'] = {
    TYPE_NAME: 'br_gov_lexml__1.HierarchicalStructure',
    parteInicial: montaParteInicial(projetoNorma),
    articulacao: montaArticulacao(projetoNorma, remissoes),
  };

  return p;
};

const montaParteInicial = (projetoNorma: any): any => {
  return {
    TYPE_NAME: 'br_gov_lexml__1.ParteInicial',
    epigrafe: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      id: 'epigrafe',
      content: projetoNorma.epigrafe ? buildStructuredContent(projetoNorma.epigrafe, 'texto') : [],
    },
    ementa: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      id: 'ementa',
      content: projetoNorma.ementa ? buildStructuredContent(projetoNorma.ementa, 'texto') : [],
    },
    preambulo: {
      TYPE_NAME: 'br_gov_lexml__1.TextoType',
      id: 'preambulo',
      p: [
        {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: projetoNorma.preambulo ? buildStructuredContent(projetoNorma.preambulo, 'texto') : [],
        },
      ],
    },
  };
};

const montaArticulacao = (projetoNorma: any, remissoes?: Remissoes): any => {
  return {
    TYPE_NAME: 'br_gov_lexml__1.Articulacao',
    lXhier: buildTree(projetoNorma.articulacao, projetoNorma.articulacao, remissoes),
  };
};

const buildTree = (dispositivo: Dispositivo, obj: any, remissoes?: Remissoes): any => {
  let tree;
  if (isAgrupador(dispositivo)) {
    tree = obj.lXhier = [];
  } else {
    tree = obj.lXcontainersOmissis = [];
  }

  if (isArtigo(dispositivo)) {
    const node = buildNode((dispositivo as Artigo).caput!, remissoes);
    buildAlteracaoSeNecessario(dispositivo, node.value, remissoes);

    tree.push(node);

    buildFilhos(
      dispositivo.filhos?.filter(f => !isCaput(f.pai!)),
      tree,
      remissoes
    );

    buildTree((dispositivo as Artigo).caput!, node.value, remissoes);
  } else {
    buildFilhos(dispositivo.filhos, tree, remissoes);
  }

  if (obj.lXcontainersOmissis && obj.lXcontainersOmissis.length === 0) delete obj.lXcontainersOmissis;

  return tree;
};

const buildAlteracaoSeNecessario = (dispositivo: Dispositivo, node: any, remissoes?: Remissoes): void => {
  if (dispositivo.hasAlteracao()) {
    node['alteracao'] = {
      TYPE_NAME: 'br_gov_lexml__1.Alteracao',
      id: '',
      content: [],
    };

    if (dispositivo.alteracoes?.base) node.alteracao.base = dispositivo.alteracoes.base;
    node.alteracao.id = buildIdAlteracao((dispositivo as Artigo).caput!);

    dispositivo.alteracoes!.filhos?.forEach(filho => {
      const n = buildNode(filho, remissoes);

      node.alteracao.content.push(n);

      buildTree(filho, n.value, remissoes);
    });
  }
};

const buildFilhos = (filhos: Dispositivo[], tree: any, remissoes?: Remissoes): any => {
  filhos?.forEach(filho => {
    const node = buildNode(filho, remissoes);
    tree.push(node);

    buildTree(filho, node.value, remissoes);
  });
};

const buildNode = (dispositivo: Dispositivo, remissoes?: Remissoes): any => {
  const node = {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: dispositivo.tipo,
      prefix: '',
      key: `{http://www.lexml.gov.br/1.0}${dispositivo.tipo}`,
      string: `{http://www.lexml.gov.br/1.0}${dispositivo.tipo}`,
    },
    value: {
      TYPE_NAME: buildTypeName(dispositivo),
    },
  };

  buildDispositivo(dispositivo, node.value, remissoes);

  return node;
};

const buildTypeName = (dispositivo: Dispositivo): string => {
  if (dispositivo.tipo === 'Omissis') return 'br_gov_lexml__1.Omissis';
  else if (isAgrupador(dispositivo) && !isArticulacao(dispositivo)) return 'br_gov_lexml__1.Hierarchy';

  return 'br_gov_lexml__1.DispositivoType';
};

const buildDispositivo = (dispositivo: Dispositivo, value: any, remissoes?: Remissoes): void => {
  value['id'] = buildId(dispositivo);
  if (!isCaput(dispositivo) && !isOmissis(dispositivo)) {
    value.rotulo = dispositivo.rotulo;
  }

  if (isDispositivoAlteracao(dispositivo) && !isOmissis(dispositivo)) {
    if (
      dispositivo.tipo === 'Artigo' ||
      dispositivo.tipo === 'Caput' ||
      dispositivo.tipo === 'Inciso' ||
      dispositivo.tipo === 'Paragrafo' ||
      dispositivo.tipo === 'Alinea' ||
      dispositivo.tipo === 'Item'
    ) {
      // Para dispositivos em alteracoes, construir href completo incluindo todos os niveis
      let href = buildHref(dispositivo);

      if (!isArtigo(dispositivo) && dispositivo.pai) {
        // Construir href completo incluindo todos os niveis da hierarquia ate o Artigo
        const hrefArray: string[] = [];
        let temp: Dispositivo | undefined = dispositivo;
        let foundArtigo = false;

        // Percorrer a hierarquia de baixo para cima ate encontrar o Artigo
        while (temp) {
          if (isArtigo(temp)) {
            foundArtigo = true;
            const artigoHref = buildHref(temp);
            if (artigoHref) {
              hrefArray.unshift(artigoHref);
            }
            break;
          }

          const tempHref = buildHref(temp);
          if (tempHref) {
            hrefArray.unshift(tempHref);
          }
          temp = temp.pai;
        }

        if (foundArtigo && hrefArray.length > 0) {
          href = hrefArray.join('_');
        }
      }

      if (href) {
        value['href'] = href;
      }
    }
  }

  if (dispositivo.cabecaAlteracao || isDispositivoCabecaAlteracao(dispositivo)) {
    value['abreAspas'] = 's';
    value.rotulo = dispositivo.rotulo;
  } else if (isDispositivoAlteracao(dispositivo) && ((isCaput(dispositivo) && isCaputComIrmaoUnico(dispositivo)) || (isOmissis(dispositivo) && isOmissisIrmaoUnico(dispositivo)))) {
    value['fechaAspas'] = 's';
    const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);
    value['notaAlteracao'] = cabecaAlteracao.notaAlteracao || 'NR';
  } else {
    if (isDispositivoAlteracao(dispositivo)) {
      const dispositivoTemp = dispositivo;

      if (isDispositivoAlteracao(dispositivoTemp) && isUltimaAlteracao(dispositivoTemp)) {
        value['fechaAspas'] = 's';
        const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivoTemp);
        value['notaAlteracao'] = cabecaAlteracao.notaAlteracao || 'NR';
      }
    }
  }

  if (isValidText(dispositivo.tituloDispositivo)) {
    value.tituloDispositivo = {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      content: buildStructuredContent(dispositivo, 'tituloDispositivo', remissoes),
    };
  }

  if (dispositivo.tipo === 'Artigo') return;

  if (isAgrupador(dispositivo)) {
    value.nomeAgrupador = {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      content: buildStructuredContent(dispositivo, 'texto', remissoes),
    };
  } else if (!isArtigo(dispositivo) && !isOmissis(dispositivo)) {
    if (dispositivo.texto === TEXTO_OMISSIS) {
      value['textoOmitido'] = 's';
    } else {
      value['p'] = [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: buildStructuredContent(dispositivo, 'texto', remissoes) }];
    }
  }
};

interface ParsedElement {
  type: 'text' | 'element';
  content: string | ParsedElement[];
  tag?: string;
  attributes?: Record<string, string>;
}

const parseHTMLTags = (html: string): ParsedElement[] => {
  const result: ParsedElement[] = [];

  // Regex para capturar tags de formatação com seu conteúdo
  // Suporta: b, i, u, sub, sup, strong, em
  const inlineTagRegex = /<(b|strong|i|em|u|sub|sup)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;

  while ((match = inlineTagRegex.exec(html)) !== null) {
    // Texto antes da tag
    if (match.index > lastIndex) {
      const textBefore = html.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        result.push({ type: 'text', content: textBefore });
      }
    }

    const tag = match[1];
    const normalizedTag = tag === 'strong' ? 'b' : tag === 'em' ? 'i' : tag;
    const innerContent = match[3];

    // Processar o conteúdo dentro da tag recursivamente
    const innerParsed = parseHTMLTags(innerContent);
    result.push({
      type: 'element',
      tag: normalizedTag,
      content: innerParsed,
    });

    lastIndex = inlineTagRegex.lastIndex;
  }

  // Texto restante após todas as tags inline
  if (lastIndex < html.length) {
    const remainingText = html.substring(lastIndex);
    if (remainingText.trim()) {
      // Processar links no texto restante
      const linkProcessed = parseContentWithLinks(remainingText);
      result.push(...linkProcessed);
    }
  } else if (result.length === 0) {
    // Não encontramos tags inline, processar apenas links
    return parseContentWithLinks(html);
  }

  return result;
};

const parseContentWithLinks = (html: string): ParsedElement[] => {
  const result: ParsedElement[] = [];
  const linkRegex = /(<a\b[^>]*>)([\s\S]*?)<\/a>/gi;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = html.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        result.push({ type: 'text', content: textBefore });
      }
    }

    const openingTag = match[1];
    const content = match[2];

    // Remissão interna: detectar pelo atributo data-lexml-ref
    const dataLexmlRefMatch = openingTag.match(/data-lexml-ref=(["'])([^"']+)\1/i);
    if (dataLexmlRefMatch) {
      result.push({
        type: 'element',
        tag: 'Remissao',
        attributes: { href: dataLexmlRefMatch[2] },
        content,
      });
    } else {
      // Link externo: extrair href normalizando aspas curvas
      const hrefMatch = openingTag.match(/href=(["'])(.*?)\1/i);
      let href = hrefMatch ? hrefMatch[2] : '';
      href = href.replace(/^[\u201C\u201D\u2018\u2019"'"]|[\u201C\u201D\u2018\u2019"'"]$/g, '');
      result.push({
        type: 'element',
        tag: 'span',
        attributes: { href },
        content,
      });
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < html.length) {
    const remainingText = html.substring(lastIndex);
    if (remainingText.trim()) {
      result.push({ type: 'text', content: remainingText });
    }
  } else if (result.length === 0) {
    result.push({ type: 'text', content: html });
  }

  return result;
};

const buildInlineElement = (tag: string, content: any[], href?: string): any => {
  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: tag,
      prefix: '',
      key: `{http://www.lexml.gov.br/1.0}${tag}`,
      string: `{http://www.lexml.gov.br/1.0}${tag}`,
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      ...(href && { href }),
      content,
    },
  };
};

const buildStructuredContentWithInlineElements = (html: string): any[] => {
  const result: any[] = [];
  const parsed = parseHTMLTags(html);

  const convertParsedElement = (item: ParsedElement): any => {
    if (item.type === 'text') {
      return item.content;
    } else if (item.type === 'element') {
      if (item.tag === 'span' || item.tag === 'Remissao') {
        return buildInlineElement(item.tag, [item.content], item.attributes?.href);
      } else {
        // Tags de formatação (b, i, u, sub, sup)
        let innerContent: any[];
        if (typeof item.content === 'string') {
          innerContent = [item.content];
        } else if (Array.isArray(item.content)) {
          // Recursivamente converter cada elemento
          innerContent = item.content.map((innerItem: ParsedElement) => convertParsedElement(innerItem));
        } else {
          innerContent = [];
        }
        return buildInlineElement(item.tag!, innerContent);
      }
    }
    return item.content;
  };

  for (const item of parsed) {
    const converted = convertParsedElement(item);
    result.push(converted);
  }

  return result.length > 0 ? result : [html];
};

const buildStructuredContentWithLinks = (conteudo: string): any[] => {
  const regex = /<a[^>]+href="(.*?)"[^>]*>(.*?)<\/a>/gi;
  const result: any[] = [];

  const ocorrencias = conteudo.match(regex);
  if (!ocorrencias) {
    const fim = conteudo.indexOf('” (NR)');
    result.push(conteudo.substring(0, fim === -1 ? undefined : fim));
  } else if (!conteudo.startsWith(ocorrencias[0])) {
    result.push(conteudo.substring(0, conteudo.indexOf(ocorrencias![0])));
  }

  ocorrencias?.forEach((m, i) => {
    const http = m.match(regex) ? m : '';

    result.push(buildRemissaoOuSpan(http ?? ''));

    const from = conteudo.indexOf(m) + m.length;

    if (from < conteudo.length) {
      const to = ocorrencias[i + 1] ? conteudo.indexOf(ocorrencias[i + 1]) : conteudo.length;
      let textSegment = conteudo.substring(from, to);

      // Substitui tags strong/em por b/i apenas textualmente
      textSegment = textSegment
        .replace(/<strong([^>]*)>/gi, '<b$1>')
        .replace(/<\/strong>/gi, '</b>')
        .replace(/<em([^>]*)>/gi, '<i$1>')
        .replace(/<\/em>/gi, '</i>');

      result.push(textSegment);
    }
  });

  return result;
};

/**
 * Injeta tags <a data-lexml-ref> no texto do dispositivo para entradas do registry
 * que ainda não estejam representadas como link (caso típico: remissões auto-detectadas
 * renderizadas via 'silent' no Quill, que não atualizam dispositivo.texto no Redux).
 */
const injetarLinksRemissaoNoTexto = (texto: string, entries: RemissaoInternaValue[]): string => {
  if (!texto) return texto;
  const faltando = entries.filter(e => e.valida !== false && e.textoRef && e.targetLexmlId && !texto.includes(`data-lexml-ref="${e.targetLexmlId}"`));
  if (faltando.length === 0) return texto;

  // Ordena descendentemente pelo início para que injeções posteriores não desloquem índices anteriores
  const ordenados = [...faltando].sort((a, b) => (b.inicio ?? 0) - (a.inicio ?? 0));

  let resultado = texto;
  for (const entry of ordenados) {
    const link = `<a href="${entry.targetLexmlId}" data-lexml-ref="${entry.targetLexmlId}" class="lexml-remissao-interna" target="_self">${entry.textoRef}</a>`;
    // texto simples — inicio aponta diretamente para a posição no texto
    if (entry.inicio !== undefined && resultado.substring(entry.inicio, entry.inicio + entry.textoRef!.length) === entry.textoRef) {
      resultado = resultado.substring(0, entry.inicio) + link + resultado.substring(entry.inicio + entry.textoRef!.length);
      continue;
    }
    // HTML com links existentes — substituir fora dos <a> existentes
    resultado = substituirTextoRefForaDeLinks(resultado, entry.textoRef!, entry.targetLexmlId!);
  }
  return resultado;
};

const buildStructuredContent = (dispositivo: Dispositivo, campo: string, remissoes?: Remissoes): any[] => {
  let raw = dispositivo[campo];
  if (!raw && raw !== '') {
    return [dispositivo];
  }

  // Injeta links de remissão interna que ainda não estão no texto (ex: auto-detectadas via 'silent')
  if (campo === 'texto' && remissoes && dispositivo.uuid !== undefined) {
    const entries = remissoes[dispositivo.uuid];
    if (entries?.length) {
      raw = injetarLinksRemissaoNoTexto(raw, entries);
    }
  }

  // Normaliza spans do Parchment Attributor antes de qualquer análise
  const conteudo = removerSpanParchmentRemissao(raw);

  // Verifica se há links
  const hasLinks = /<a[^>]+href=/.test(conteudo);

  if (hasLinks) {
    // Verifica se há tags inline envolvendo os links
    const hasInlineTagWrappingLinks = /^<(b|i|u|sub|sup|strong|em)[^>]*>[\s\S]*?<a[^>]+href=[\s\S]*?<\/\1>/.test(conteudo);

    if (hasInlineTagWrappingLinks) {
      // Nova implementação para tags inline envolvendo links
      return buildStructuredContentWithInlineElements(conteudo);
    }

    // Comportamento original para links (com substituição textual de strong/em)
    return buildStructuredContentWithLinks(conteudo);
  }

  // Verifica se há tags HTML inline (sem links)
  const hasInlineTags = /<(b|i|u|sub|sup|strong|em)[^>]*>/.test(conteudo);
  if (hasInlineTags) {
    return buildStructuredContentWithInlineElements(conteudo);
  }

  // Sem tags HTML, retorna o conteúdo como está
  const fim = conteudo.indexOf('” (NR)');
  return [conteudo.substring(0, fim === -1 ? undefined : fim)];
};

const buildSpan = (m: string): any => {
  const resultHref = m.match(/href="(.*?)"*>/i);
  const href = resultHref && resultHref[1] ? resultHref[1] : '';

  const contentHref = m.match(/<a[^>]+href=".*?"[^>]*>(.*?)<\/a>/);
  const content = contentHref && contentHref[1] ? [contentHref[1]?.trim()] : [''];

  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'span',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}span',
      string: '{http://www.lexml.gov.br/1.0}span',
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      href,
      content,
    },
  };
};

const buildRemissao = (m: string, lexmlRef: string): any => {
  const contentMatch = m.match(/<a[^>]*>(.*?)<\/a>/i);
  const content = contentMatch ? [contentMatch[1]?.trim()] : [''];

  return {
    name: {
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'Remissao',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}Remissao',
      string: '{http://www.lexml.gov.br/1.0}Remissao',
    },
    value: {
      TYPE_NAME: 'br_gov_lexml__1.GenInline',
      href: lexmlRef,
      content,
    },
  };
};

const buildRemissaoOuSpan = (m: string): any => {
  const dataLexmlRefMatch = m.match(/data-lexml-ref="([^"]+)"/i);
  if (dataLexmlRefMatch) {
    return buildRemissao(m, dataLexmlRefMatch[1]);
  }
  return buildSpan(m);
};
