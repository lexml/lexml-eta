import { diffChars, diffWords } from 'diff';

export function containsTags(text: string): boolean {
  return /<.+>/g.test(text?.trim());
}

export function endsWithPunctuation(texto: string): boolean {
  return /[.,:]\s*$/.test(texto);
}

export function isValidHTML(html: string): boolean {
  const doc = document.createElement('div');
  doc.innerHTML = html;
  return doc.innerHTML === html;
}

export function isHTMLParagraph(html: string): boolean {
  return html.trim() !== '' && html.trim().startsWith('<p>') && html.trim().endsWith('</p>');
}

export function isValidHtmlParagraph(html: string): boolean {
  return isHTMLParagraph(html) && isValidHTML(html);
}

export function getTextoSemHtml(html: string): string {
  return removeEspacosDuplicados(html.replace(/(<([^>]+)>)/gi, '').trim());
}

export function getLastCharacter(texto: string): string {
  const soTexto = texto.replace(/(<([^>]+)>)/gi, '').trim();
  return soTexto.length > 0 ? soTexto.charAt(soTexto.length - 1) : '';
}

export function endsWithWord(texto: string, indicadores: string[]): boolean {
  return indicadores.map(word => new RegExp(addSpaceRegex(escapeRegex(word)) + '\\s*$').test(texto)).filter(r => r)[0] === true;
}

export function converteIndicadorParaTexto(indicadores: string[]): string {
  switch (indicadores[0].trim()) {
    case '.':
      return 'ponto';
    case ':':
      return 'dois pontos';
    case ';':
      return 'ponto e vírgula';
    case ',':
      return 'vírgula';
    default:
      return indicadores[0].trim();
  }
}

export function escapeRegex(str: string): string {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function addSpaceRegex(str: string): string {
  return str.replace(/\s+/g, '\\s+');
}

export function primeiraLetraMaiuscula(str: string): string {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function join(list: string[]): string {
  let str = '';
  list.forEach(s => {
    str += s;
  });
  return str;
}

export function removeEspacosDuplicados(str: string): string {
  return str.replace(/\s{2,}/g, ' ');
}

export function removeAllHtmlTags(texto: string): string {
  return texto.replace(/(<([^>]+)>)/gi, '');
}

export const removeAllHtmlTagsExcept = (texto: string, tags: string[]): string => {
  // const regex = new RegExp(`(<(?!${tags.join('|')})[^>]+>)`, 'gi');
  const regex = new RegExp(`<(?!(?:/?(${tags.join('|')})\\b))[^>]*>`, 'gi');
  return texto.replace(regex, '');
};

export class StringBuilder {
  private strs = new Array<string>();

  constructor(str?: string) {
    if (str) {
      this.append(str);
    }
  }

  append(str: string | undefined): void {
    if (str) {
      this.strs.push(str);
    }
  }

  toString(): string {
    return join(this.strs);
  }
}

export const REGEX_ACCENTS = /[\u0300-\u036f]/g;

export const removeTagEConteudo = (texto: string, tag: string): string => {
  return texto.replace(new RegExp(`<${tag}[^<]*(?:(?!</${tag}>)<[^<]*)*</${tag}>`, 'gi'), '');
};

export const removeTagStyle = (texto: string): string => removeTagEConteudo(texto, 'style');

export const removeTagScript = (texto: string): string => removeTagEConteudo(texto, 'script');

export const removeTagHead = (texto: string): string => removeTagEConteudo(texto, 'head');

export const getIniciais = (texto = ''): string => {
  return (
    texto
      .match(/\b[A-Z][a-z]*\b/g)
      ?.map(word => word.charAt(0))
      .filter((_, i, arr) => i === 0 || i === arr.length - 1)
      .join('') || ''
  );
};

export const textoDiffAsHtml = (texto1: string, texto2: string, typeDiff: 'diffChars' | 'diffWords'): string => {
  const fn = typeDiff === 'diffChars' ? diffChars : diffWords;
  const buildPartAdded = (str: string): string => `<ins>${str}</ins>`; //`<span class="texto-inserido">${str}</span>`;
  const buildPartRemoved = (str: string): string => `<del>${str}</del>`; //`<span classs="texto-removido">${str}</span>`;

  const diff = fn(texto1, texto2);
  return diff.map(part => (part.added ? buildPartAdded(part.value) : part.removed ? buildPartRemoved(part.value) : part.value)).join('');
};

export const substituiEspacosEntreTagsPorNbsp = (texto: string, tags?: string[]): string => {
  if (tags) {
    const regex = new RegExp(`(?<=<(${tags.join('|')})>) +(?=</\\1>)`, 'gi');
    return texto.replace(regex, texto => texto.replace(/ /g, '&nbsp;'));
  } else {
    return texto.replace(/ /g, '&nbsp;');
  }
};

export const substituiMultiplosEspacosPorNbsp = (texto: string): string => {
  return texto.replace(/ +/g, texto => texto.replace(/ /g, '&nbsp;'));
};
