// Justificação: HTML do editor (`texto` do editor de texto rico) ↔ Justificacao/PartePrincipal do LexML (especificação 06).
// Mapeamento e decisões em openspec/changes/2026-10-19-c01-salvar-abrir-justificacao/design.md (D4).

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

const montaInline = (nos: NodeListOf<ChildNode> | ChildNode[]): any[] =>
  Array.from(nos).flatMap((no): any[] => {
    if (no.nodeType === Node.TEXT_NODE) return no.textContent ? [escapar(no.textContent)] : [];
    if (no.nodeType !== Node.ELEMENT_NODE) return [];
    const el = no as Element;
    if (el.tagName === 'BR') return [];
    if (el.tagName === 'IMG') return [montaImagem(el as HTMLElement)];
    const tag = INLINE[el.tagName];
    if (!tag) return montaInline(el.childNodes);
    const value: any = { TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(el) };
    if (tag === 'a') {
      if (el.getAttribute('href')) value.href = el.getAttribute('href');
      if (el.getAttribute('target')) value.target = el.getAttribute('target');
    }
    return [elemento(tag, comConteudo(value, montaInline(el.childNodes)))];
  });

const montaParagrafo = (el: Element): any => elemento('p', comConteudo({ TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(el) }, montaInline(el.childNodes)));

const montaLista = (el: Element): any =>
  elemento(el.tagName.toLowerCase(), {
    TYPE_NAME: 'br_gov_lexml__1.HTMLlist',
    li: Array.from(el.children)
      .filter(li => li.tagName === 'LI')
      .map(li => comConteudo({ TYPE_NAME: 'br_gov_lexml__1.Li', ...classe(li) }, montaInline(li.childNodes))),
  });

// `td`/`th` só aceitam conteúdo inline: cada parágrafo vira `span` com a classe `p`.
const montaCelula = (celula: HTMLTableCellElement): any => {
  const content = Array.from(celula.childNodes).flatMap(no =>
    no.nodeType === Node.ELEMENT_NODE && (no as Element).tagName === 'P'
      ? [elemento('span', comConteudo({ TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(no as Element, 'p') }, montaInline(no.childNodes)))]
      : montaInline([no])
  );
  const value: any = { TYPE_NAME: 'br_gov_lexml__1.GenInline', ...classe(celula), ...estiloDimensoes(celula) };
  // 1 é o padrão do XSD; omitir evita diferença com o que o Quill devolve ao reabrir.
  if (celula.colSpan > 1) value.colspan = celula.colSpan;
  if (celula.rowSpan > 1) value.rowspan = celula.rowSpan;
  return elemento(celula.tagName.toLowerCase(), comConteudo(value, content));
};

const montaTabela = (tabela: HTMLTableElement, sequencial: number): any => {
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
        .map(montaCelula),
    })),
  });
};

const temConteudo = (raiz: Element): boolean => !!raiz.textContent?.trim() || !!raiz.querySelector('img');

/** Devolve `Justificacao` no formato do conversor jsonix-lexml 2.0.0, ou undefined se não houver conteúdo. */
export const montaJustificacao = (html: string | undefined): any | undefined => {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';
  const raiz = template.content;
  // Notas de rodapé e revisões ainda não são gravadas (#993, #994); `ins` fica só com o texto.
  raiz.querySelectorAll('del, lexml-eta-nota-rodape').forEach(el => el.remove());
  const container = document.createElement('div');
  container.append(raiz);
  if (!temConteudo(container)) return undefined;

  let tabelas = 0;
  const blocos = Array.from(container.childNodes).flatMap((no): any[] => {
    if (no.nodeType === Node.TEXT_NODE) return no.textContent?.trim() ? [elemento('p', { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [escapar(no.textContent)] })] : [];
    if (no.nodeType !== Node.ELEMENT_NODE) return [];
    const el = no as Element;
    if (el.tagName === 'TABLE') return [montaTabela(el as HTMLTableElement, ++tabelas)];
    if (el.tagName === 'UL' || el.tagName === 'OL') return [montaLista(el)];
    // No Quill a imagem é bloco; no LexML `img` é inline.
    if (el.tagName === 'IMG') return [elemento('p', { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [montaImagem(el as HTMLElement)] })];
    return [montaParagrafo(el)];
  });

  return {
    TYPE_NAME: 'br_gov_lexml__1.OpenStructure',
    partePrincipal: { TYPE_NAME: 'br_gov_lexml__1.PartePrincipal', agrupamentoHierarquicoOrDivOrAgrupamento: blocos },
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

const criaInline = (content: any[] | undefined): Node[] =>
  (content ?? []).flatMap((item): Node[] => {
    if (typeof item === 'string') return [document.createTextNode(item)];
    const tag = nomeLocal(item);
    if (tag === 'img') return [criaImagem(item.value)];
    // Inline desconhecido (Remissao, NotaDeRodape, ins, del...): só o texto.
    if (!tag || !TAGS_INLINE.has(tag)) return criaInline(item?.value?.content);
    const el = document.createElement(tag);
    aplicaAtributos(el, item.value);
    if (tag === 'a') {
      if (item.value?.href) el.setAttribute('href', item.value.href);
      if (item.value?.target) el.setAttribute('target', item.value.target);
    }
    el.append(...criaInline(item.value?.content));
    return [el];
  });

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

/** HTML para o editor da justificação a partir de todas as `Justificacao` do documento; '' quando não há. Nunca lança erro. */
export const lerJustificacao = (documento: any): string => {
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
  return container.innerHTML;
};
