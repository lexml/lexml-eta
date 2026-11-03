// Justificação: HTML do editor (`texto` do editor de texto rico) ↔ Justificacao/PartePrincipal do LexML (especificações 06 e 07).
// Decisões em openspec/changes/archive/2026-10-19-c01-salvar-abrir-justificacao/design.md (D4) e 2026-10-19-c02-salvar-abrir-notas-rodape/design.md; revisões de texto em 2026-10-22-c01-salvar-abrir-revisoes-texto-justificacao/design.md.
import { decodeHtml, encodeHtml } from '../../../../util/string-util';
import { formatDateTime, formatDateTimeToIso } from '../../../../util/date-util';
import { generateUUID } from '../../../../util/uuid';
import { Usuario } from '../../../revisao/usuario';
import type { RevisaoTextualLida } from '../documentoArticulado';

const NAMESPACE_LEXML = 'http://www.lexml.gov.br/1.0';

const elemento = (localPart: string, value: any): any => ({
  name: { namespaceURI: NAMESPACE_LEXML, localPart, prefix: '', key: `{${NAMESPACE_LEXML}}${localPart}`, string: `{${NAMESPACE_LEXML}}${localPart}` },
  value,
});

// Escapado como nos dispositivos: criarDocumentoArticulado decodifica todo `content` depois.
const escapar = (texto: string): string => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const INLINE: Record<string, string> = { STRONG: 'b', B: 'b', EM: 'i', I: 'i', U: 'u', SUP: 'sup', SUB: 'sub', SPAN: 'span', A: 'a' };

const classe = (el: Element, prefixo?: string): { clazz?: string } => {
  const clazz = [prefixo, el.getAttribute('class')?.trim()].filter(Boolean).join(' ');
  return clazz ? { clazz } : {};
};

// O editor grava a largura da coluna e da imagem em atributo e a da tabela em `style`; o LexML só aceita `style`.
const estiloDimensoes = (el: HTMLElement): { style?: string } => {
  const style = (['width', 'height'] as const)
    .map(a => [a, el.getAttribute(a) || el.style[a]])
    .filter(([, valor]) => valor)
    .map(([a, valor]) => `${a}: ${valor}`)
    .join('; ');
  return style ? { style } : {};
};

const comConteudo = (value: any, content: any[]): any => (content.length ? { ...value, content } : value);

const montaImagem = (img: HTMLElement): any =>
  elemento('img', {
    TYPE_NAME: 'br_gov_lexml__1.Img',
    src: img.getAttribute('src') ?? '',
    ...(img.getAttribute('alt') && { alt: img.getAttribute('alt') }),
    ...estiloDimensoes(img),
  });

/** Marca de revisão de texto encontrada ao gravar: `id` do `ins`/`del`, autor e data ISO com fuso. */
export interface RevisaoTextualMontada {
  id: string;
  usuario: Usuario;
  data: string;
}

// Estado da varredura que gera os `id` das marcas (design D1/D2).
interface VarreduraRevisoes {
  revisoes: RevisaoTextualMontada[];
  porIdRevisao: Map<string, number>;
  idsSubstitutos: Map<string, string>;
}

export const PREFIXO_ID_REVISAO_TEXTUAL = '_rt';

// O id gravado é `_rt<id-revisao>_<n>`; o id-revisao precisa caber num NCName.
const ID_REVISAO_VALIDO = /^[A-Za-z0-9_.-]+$/;

const idRevisaoEfetivo = (varredura: VarreduraRevisoes, idRevisao: string): string => {
  if (ID_REVISAO_VALIDO.test(idRevisao)) return idRevisao;
  if (!idRevisao) return generateUUID();
  if (!varredura.idsSubstitutos.has(idRevisao)) varredura.idsSubstitutos.set(idRevisao, generateUUID());
  return varredura.idsSubstitutos.get(idRevisao)!;
};

// Data da marca ("AAAA-MM-DD HH:mm:00 ", local); inválida vira o instante do salvamento.
const dataIsoDaMarca = (date: string | null): string => {
  const valor = (date ?? '').trim();
  const iso = formatDateTimeToIso(valor);
  return iso !== valor ? iso : formatDateTimeToIso(formatDateTime(new Date()));
};

// Marca que só tem o caractere de cursor do Quill não é revisão (design D7).
const ehMarcaVazia = (el: Element): boolean => !el.textContent?.replace(/\uFEFF/g, '') && !el.querySelector('img, lexml-eta-nota-rodape');

const montaMarcaRevisao = (el: Element, varredura: VarreduraRevisoes): any => {
  const idRevisao = idRevisaoEfetivo(varredura, el.getAttribute('id-revisao') ?? '');
  const n = (varredura.porIdRevisao.get(idRevisao) ?? 0) + 1;
  varredura.porIdRevisao.set(idRevisao, n);
  const id = `${PREFIXO_ID_REVISAO_TEXTUAL}${idRevisao}_${n}`;
  varredura.revisoes.push({
    id,
    usuario: new Usuario(el.getAttribute('usuario') || undefined, el.getAttribute('id-usuario') || undefined, el.getAttribute('sigla-usuario') || undefined),
    data: dataIsoDaMarca(el.getAttribute('date')),
  });
  return elemento(el.tagName.toLowerCase(), comConteudo({ TYPE_NAME: 'br_gov_lexml__1.GenInline', id }, montaInline(el.childNodes, varredura)));
};

// Sem varredura (texto da nota de rodapé), `ins`/`del` ficam só com o conteúdo.
const montaInline = (nos: NodeListOf<ChildNode> | ChildNode[], varredura?: VarreduraRevisoes): any[] =>
  Array.from(nos).flatMap((no): any[] => {
    if (no.nodeType === Node.TEXT_NODE) return no.textContent ? [escapar(no.textContent)] : [];
    if (no.nodeType !== Node.ELEMENT_NODE) return [];
    const el = no as Element;
    if (el.tagName === 'BR') return [];
    if (el.tagName === 'IMG') return [montaImagem(el as HTMLElement)];
    if (el.tagName === 'LEXML-ETA-NOTA-RODAPE') return [montaNotaRodape(el)];
    if ((el.tagName === 'INS' || el.tagName === 'DEL') && varredura && !ehMarcaVazia(el)) return [montaMarcaRevisao(el, varredura)];
    const tag = INLINE[el.tagName];
    if (!tag) return montaInline(el.childNodes, varredura);
    const value: any = { TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(el) };
    if (tag === 'a') {
      if (el.getAttribute('href')) value.href = el.getAttribute('href');
      if (el.getAttribute('target')) value.target = el.getAttribute('target');
    }
    return [elemento(tag, comConteudo(value, montaInline(el.childNodes, varredura)))];
  });

// Junta textos vizinhos, como o conversor faz ao ler o XML.
const juntaTextos = (content: any[]): any[] =>
  content.reduce((acc: any[], item) => {
    if (typeof item === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += item;
    else acc.push(item);
    return acc;
  }, []);

// `NotaDeRodape` só aceita inline: os parágrafos do texto da nota são unidos por espaço (especificação 07). Número e id não são gravados.
const montaNotaRodape = (el: Element): any => {
  const template = document.createElement('template');
  template.innerHTML = decodeHtml(el.getAttribute('texto') ?? '');
  const paragrafos = Array.from(template.content.childNodes)
    .map(no => (no.nodeType === Node.ELEMENT_NODE && (no as Element).tagName === 'P' ? montaInline(no.childNodes) : montaInline([no])))
    .filter(content => content.length);
  const content = juntaTextos(paragrafos.flatMap((p, i) => (i ? [' ', ...p] : p)));
  if (typeof content[0] === 'string') content[0] = content[0].trimStart();
  if (typeof content[content.length - 1] === 'string') content[content.length - 1] = content[content.length - 1].trimEnd();
  return elemento(
    'NotaDeRodape',
    comConteudo(
      { TYPE_NAME: 'br_gov_lexml__1.GenInline' },
      content.filter(c => c !== '')
    )
  );
};

const montaParagrafo = (el: Element, varredura: VarreduraRevisoes): any =>
  elemento('p', comConteudo({ TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(el) }, montaInline(el.childNodes, varredura)));

const montaLista = (el: Element, varredura: VarreduraRevisoes): any =>
  elemento(el.tagName.toLowerCase(), {
    TYPE_NAME: 'br_gov_lexml__1.HTMLlist',
    li: Array.from(el.children)
      .filter(li => li.tagName === 'LI')
      .map(li => comConteudo({ TYPE_NAME: 'br_gov_lexml__1.Li', ...classe(li) }, montaInline(li.childNodes, varredura))),
  });

// `td`/`th` só aceitam conteúdo inline: cada parágrafo vira `span` com a classe `p`.
const montaCelula = (celula: HTMLTableCellElement, varredura: VarreduraRevisoes): any => {
  const content = Array.from(celula.childNodes).flatMap(no =>
    no.nodeType === Node.ELEMENT_NODE && (no as Element).tagName === 'P'
      ? [elemento('span', comConteudo({ TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(no as Element, 'p') }, montaInline(no.childNodes, varredura)))]
      : montaInline([no], varredura)
  );
  const value: any = { TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(celula), ...estiloDimensoes(celula) };
  // 1 é o padrão do XSD; omitir evita diferença com o que o Quill devolve ao reabrir.
  if (celula.colSpan > 1) value.colspan = celula.colSpan;
  if (celula.rowSpan > 1) value.rowspan = celula.rowSpan;
  return elemento(celula.tagName.toLowerCase(), comConteudo(value, content));
};

const montaTabela = (tabela: HTMLTableElement, sequencial: number, varredura: VarreduraRevisoes): any => {
  const border = Number.parseInt(tabela.getAttribute('border') ?? '', 10);
  return elemento('table', {
    TYPE_NAME: 'br_gov_lexml__1.Table',
    // Só para atender ao XSD (`id` obrigatório); não é lido ao abrir.
    id: `_tabela${sequencial}`,
    ...classe(tabela),
    ...estiloDimensoes(tabela),
    ...(Number.isInteger(border) && { border }),
    tr: Array.from(tabela.rows).map(tr => ({
      TYPE_NAME: 'br_gov_lexml__1.Tr',
      tableCellElement: Array.from(tr.cells)
        .filter(celula => !celula.hasAttribute('merge_id'))
        .map(celula => montaCelula(celula, varredura)),
    })),
  });
};

const temConteudo = (raiz: Element): boolean => !!raiz.textContent?.trim() || !!raiz.querySelector('img');

/** `Justificacao` no formato do conversor jsonix-lexml 2.1.0 e as marcas de revisão de texto, da mesma varredura (design D2). */
export interface JustificacaoMontada {
  /** undefined se não houver conteúdo. */
  justificacao?: any;
  revisoes: RevisaoTextualMontada[];
}

export const montaJustificacao = (html: string | undefined): JustificacaoMontada => {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';
  const container = document.createElement('div');
  container.append(template.content);
  if (!temConteudo(container)) return { revisoes: [] };

  const varredura: VarreduraRevisoes = { revisoes: [], porIdRevisao: new Map(), idsSubstitutos: new Map() };
  let tabelas = 0;
  const blocos = Array.from(container.childNodes).flatMap((no): any[] => {
    if (no.nodeType === Node.TEXT_NODE) return no.textContent?.trim() ? [elemento('p', { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [escapar(no.textContent)] })] : [];
    if (no.nodeType !== Node.ELEMENT_NODE) return [];
    const el = no as Element;
    if (el.tagName === 'TABLE') return [montaTabela(el as HTMLTableElement, ++tabelas, varredura)];
    if (el.tagName === 'UL' || el.tagName === 'OL') return [montaLista(el, varredura)];
    // No Quill a imagem é bloco; no LexML `img` é inline.
    if (el.tagName === 'IMG') return [elemento('p', { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [montaImagem(el as HTMLElement)] })];
    return [montaParagrafo(el, varredura)];
  });

  return {
    justificacao: {
      TYPE_NAME: 'br_gov_lexml__1.OpenStructure',
      partePrincipal: { TYPE_NAME: 'br_gov_lexml__1.PartePrincipal', agrupamentoHierarquicoOrDivOrAgrupamento: blocos },
    },
    revisoes: varredura.revisoes,
  };
};

const nomeLocal = (item: any): string | undefined => item?.name?.localPart;

// Texto de qualquer trecho do Jsonix, para o que o editor não sabe exibir.
const textoDe = (valor: any): string => {
  if (typeof valor === 'string') return valor;
  if (Array.isArray(valor)) return valor.map(textoDe).join('');
  if (!valor || typeof valor !== 'object') return '';
  if (valor.name && valor.value) return textoDe(valor.value);
  return Object.entries(valor)
    .filter(([chave]) => chave !== 'TYPE_NAME' && chave !== 'name')
    .map(([, v]) => (typeof v === 'object' ? textoDe(v) : ''))
    .join('');
};

// `setContent` não reconverte o recuo, e `ajustaHtmlToEditor` estragaria `ql-text-indent-*` (design D5).
const classeDoEditor = (clazz: string): string => clazz.replace(/(^|\s)indent-(\d+)(?=\s|$)/g, '$1ql-indent-$2');

// Largura e altura voltam a ser atributo, como o editor grava na coluna e na imagem; na tabela ficam em `style`.
const aplicaAtributos = (el: Element, value: any, dimensoesEmAtributo = true): void => {
  if (value?.clazz) el.setAttribute('class', classeDoEditor(value.clazz));
  if (!dimensoesEmAtributo) {
    if (value?.style) el.setAttribute('style', value.style);
    return;
  }
  const restante = String(value?.style ?? '')
    .split(';')
    .map(d => d.trim())
    .filter(declaracao => {
      const [, prop, valor] = /^(width|height)\s*:\s*(.+)$/.exec(declaracao) ?? [];
      if (prop) el.setAttribute(prop, valor.trim());
      return !prop && declaracao;
    });
  if (restante.length) el.setAttribute('style', restante.join('; '));
};

const criaImagem = (value: any): HTMLElement => {
  const img = document.createElement('img');
  img.setAttribute('src', value?.src ?? '');
  if (value?.alt) img.setAttribute('alt', value.alt);
  aplicaAtributos(img, value);
  return img;
};

const TAGS_INLINE = new Set(['b', 'i', 'u', 'sup', 'sub', 'span', 'a']);

// Nota no formato do editor; `texto` é o HTML do modal, codificado. Id e número são definidos em lerJustificacao.
// O texto da nota não tem revisão: `ins`/`del` ali ficam só com o conteúdo.
const criaNotaRodape = (value: any): HTMLElement => {
  const p = document.createElement('p');
  p.append(...criaInline(value?.content, false));
  const el = document.createElement('lexml-eta-nota-rodape');
  el.setAttribute('class', 'lexml-eta-nota-rodape');
  el.setAttribute('contenteditable', 'false');
  el.setAttribute('texto', encodeHtml(p.outerHTML));
  return el;
};

// `ins`/`del` levam o `id` gravado até lerJustificacao aplicar os atributos do editor.
const criaInline = (content: any[] | undefined, comRevisoes = true): Node[] =>
  (content ?? []).flatMap((item): Node[] => {
    if (typeof item === 'string') return [document.createTextNode(item)];
    const tag = nomeLocal(item);
    if (tag === 'img') return [criaImagem(item.value)];
    if (tag === 'NotaDeRodape') return [criaNotaRodape(item.value)];
    if ((tag === 'ins' || tag === 'del') && comRevisoes) {
      const marca = document.createElement(tag);
      marca.setAttribute(ATRIBUTO_ID_GRAVADO, typeof item.value?.id === 'string' ? item.value.id : '');
      marca.append(...criaInline(item.value?.content));
      return [marca];
    }
    // Inline desconhecido (Remissao...): só o texto.
    if (!tag || !TAGS_INLINE.has(tag)) return criaInline(item?.value?.content, comRevisoes);
    const el = document.createElement(tag);
    aplicaAtributos(el, item.value);
    if (tag === 'a') {
      if (item.value?.href) el.setAttribute('href', item.value.href);
      if (item.value?.target) el.setAttribute('target', item.value.target);
    }
    el.append(...criaInline(item.value?.content, comRevisoes));
    return [el];
  });

const ATRIBUTO_ID_GRAVADO = 'data-id-gravado';

// `_rt<id-revisao>_<n>` → `<id-revisao>`; `_rt<id>` sem sufixo usa o resto (exemplo da especificação 09).
const idRevisaoDoIdGravado = (id: string): string | undefined => {
  if (!id.startsWith(PREFIXO_ID_REVISAO_TEXTUAL)) return undefined;
  const resto = id.slice(PREFIXO_ID_REVISAO_TEXTUAL.length).replace(/_\d+$/, '');
  return resto || undefined;
};

// Atributos de InsBlot/DelBlot (`moduloRevisao.ts`); sem RevisaoTextual, a marca é de "Anônimo" com a data da abertura.
const aplicaAtributosRevisao = (marca: Element, revisoes: Record<string, RevisaoTextualLida>): void => {
  const id = marca.getAttribute(ATRIBUTO_ID_GRAVADO) ?? '';
  marca.removeAttribute(ATRIBUTO_ID_GRAVADO);
  const lida = revisoes[id];
  const usuario = lida?.usuario ?? new Usuario();
  marca.setAttribute('usuario', usuario.nome);
  // O editor grava a data local seguida de um espaço.
  marca.setAttribute('date', `${lida?.dataHora ?? formatDateTime(new Date())} `);
  marca.setAttribute('id-revisao', idRevisaoDoIdGravado(id) ?? generateUUID());
  if (usuario.id !== undefined && usuario.id !== null && usuario.id !== '') marca.setAttribute('id-usuario', String(usuario.id));
  if (usuario.sigla) marca.setAttribute('sigla-usuario', usuario.sigla);
};

const criaComFilhos = (tag: string, value: any, filhos: Node[]): HTMLElement => {
  const el = document.createElement(tag);
  aplicaAtributos(el, value);
  el.append(...filhos);
  return el;
};

const ehParagrafoDeCelula = (item: any): boolean => nomeLocal(item) === 'span' && String(item.value?.clazz ?? '').split(/\s+/)[0] === 'p';

const criaCelula = (item: any): HTMLElement => {
  const celula = criaComFilhos(nomeLocal(item) === 'th' ? 'th' : 'td', item.value, []);
  if (item.value?.colspan) celula.setAttribute('colspan', String(item.value.colspan));
  if (item.value?.rowspan) celula.setAttribute('rowspan', String(item.value.rowspan));
  // `span` com a classe `p` volta a ser parágrafo; o restante é agrupado num parágrafo, como o Quill espera.
  let solto: any[] = [];
  const fechaSolto = (): void => {
    if (solto.length) celula.append(criaComFilhos('p', undefined, criaInline(solto)));
    solto = [];
  };
  for (const filho of item.value?.content ?? []) {
    if (!ehParagrafoDeCelula(filho)) {
      solto.push(filho);
      continue;
    }
    fechaSolto();
    const clazz = String(filho.value.clazz).split(/\s+/).slice(1).join(' ');
    celula.append(criaComFilhos('p', { ...filho.value, clazz }, criaInline(filho.value.content)));
  }
  fechaSolto();
  if (!celula.childNodes.length) celula.append(document.createElement('p'));
  return celula;
};

const criaTabela = (value: any): HTMLElement => {
  const tabela = document.createElement('table');
  aplicaAtributos(tabela, value, false);
  if (Number.isInteger(value?.border)) tabela.setAttribute('border', String(value.border));
  for (const tr of value?.tr ?? []) {
    tabela.append(criaComFilhos('tr', tr, (tr?.tableCellElement ?? []).map(criaCelula)));
  }
  return tabela;
};

const criaBloco = (item: any): Node[] => {
  const tag = nomeLocal(item);
  const value = item?.value;
  if (tag === 'p') {
    const [unico, ...outros] = value?.content ?? [];
    // Parágrafo que só tem imagem: no Quill a imagem é bloco.
    if (!outros.length && nomeLocal(unico) === 'img') return [criaImagem(unico.value)];
    return [criaComFilhos('p', value, criaInline(value?.content))];
  }
  if (tag === 'ul' || tag === 'ol')
    return [
      criaComFilhos(
        tag,
        undefined,
        (value?.li ?? []).map((li: any) => criaComFilhos('li', li, criaInline(li?.content)))
      ),
    ];
  if (tag === 'table') return [criaTabela(value)];
  // Bloco que o editor não grava (div, Agrupamento...): só o texto.
  const texto = textoDe(value);
  return texto.trim() ? [criaComFilhos('p', undefined, [document.createTextNode(texto)])] : [];
};

/**
 * HTML para o editor da justificação a partir de todas as `Justificacao` do documento; '' quando não há. Nunca lança erro.
 * `revisoesTextuais` (de lerMetadadoLexEdit) dá autor e data aos `ins`/`del`.
 */
export const lerJustificacao = (documento: any, revisoesTextuais: Record<string, RevisaoTextualLida> = {}): string => {
  const justificacoes = documento?.value?.projetoNorma?.justificacao;
  const container = document.createElement('div');
  for (const justificacao of Array.isArray(justificacoes) ? justificacoes : []) {
    for (const item of justificacao?.partePrincipal?.agrupamentoHierarquicoOrDivOrAgrupamento ?? []) {
      try {
        container.append(...criaBloco(item));
      } catch {
        const texto = textoDe(item);
        if (texto.trim()) container.append(criaComFilhos('p', undefined, [document.createTextNode(texto)]));
      }
    }
  }
  // Numeração pela ordem do texto (especificação 07); o id só vale na sessão.
  const prefixoId = `nr${Date.now()}`;
  container.querySelectorAll('lexml-eta-nota-rodape').forEach((nota, i) => {
    nota.setAttribute('id-lexml-eta-nota-rodape', `${prefixoId}${i + 1}`);
    nota.setAttribute('numero', String(i + 1));
    nota.textContent = String(i + 1);
  });
  container.querySelectorAll(`ins[${ATRIBUTO_ID_GRAVADO}], del[${ATRIBUTO_ID_GRAVADO}]`).forEach(marca => aplicaAtributosRevisao(marca, revisoesTextuais));
  return container.innerHTML;
};
