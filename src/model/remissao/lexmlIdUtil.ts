import { converteNumeroArabicoParaLetra, converteNumeroArabicoParaRomano } from '../lexml/numeracao/numeracaoUtil';

export interface SegmentoLexmlId {
  tipo: string; // 'art', 'par', 'inc', 'ali', 'ite', 'cpt', 'cap', 'sec', 'sub', 'tit', 'liv', 'prt'
  numero: string; // '7', '3', '4', '1u', etc.
}

export interface DiffLexmlId {
  tipo: string;
  numeroAntigo: string;
  numeroNovo: string;
  exibicaoNova: string; // já convertido para Roman/letra/Arabic conforme tipo
}

const ROMAN_TYPES = new Set(['inc', 'cap', 'sec', 'sub', 'tit', 'liv', 'prt']);
const LETTER_TYPES = new Set(['ali']);

// Conector (preposição) usado ANTES de cada tipo quando aparece após outro segmento
const CONECTOR: Record<string, string> = {
  art: 'do',
  par: 'do',
  inc: 'do',
  ali: 'da',
  ite: 'do',
  cpt: 'do',
  cap: 'do',
  sec: 'da',
  sub: 'da',
  tit: 'do',
  liv: 'do',
  prt: 'da',
};

const UNICO: Record<string, string> = {
  art: 'artigo único',
  par: 'parágrafo único',
  inc: 'inciso único',
  ali: 'alínea única',
  ite: 'item único',
  cap: 'Capítulo único',
  sec: 'Seção única',
  sub: 'Subseção única',
  tit: 'Título único',
  liv: 'Livro único',
  prt: 'Parte única',
};

export function numeroParaExibicao(tipo: string, numArabic: string): string {
  if (numArabic === '1u') return 'único';
  if (ROMAN_TYPES.has(tipo)) return converteNumeroArabicoParaRomano(numArabic);
  if (LETTER_TYPES.has(tipo)) return converteNumeroArabicoParaLetra(numArabic);
  return numArabic;
}

export function parseLexmlId(id: string): SegmentoLexmlId[] {
  return id
    .split('_')
    .map(seg => {
      const match = seg.match(/^([a-z]+)(\d+(?:-[a-z]+)?[u]?)$/);
      if (!match) return null;
      return { tipo: match[1], numero: match[2] };
    })
    .filter((s): s is SegmentoLexmlId => s !== null);
}

export function diffLexmlId(antigo: string, novo: string): DiffLexmlId | null {
  if (antigo === novo) return null;

  const segsAntigo = parseLexmlId(antigo);
  const segsNovo = parseLexmlId(novo);

  if (segsAntigo.length !== segsNovo.length) return null;

  const diffs: Array<{ tipo: string; numeroAntigo: string; numeroNovo: string }> = [];

  for (let i = 0; i < segsAntigo.length; i++) {
    const a = segsAntigo[i];
    const n = segsNovo[i];
    if (a.tipo !== n.tipo) return null; // structural change — cannot diff
    if (a.numero !== n.numero) {
      diffs.push({ tipo: a.tipo, numeroAntigo: a.numero, numeroNovo: n.numero });
    }
  }

  if (diffs.length !== 1) return null;

  const diff = diffs[0];
  return {
    tipo: diff.tipo,
    numeroAntigo: diff.numeroAntigo,
    numeroNovo: diff.numeroNovo,
    exibicaoNova: numeroParaExibicao(diff.tipo, diff.numeroNovo),
  };
}

function segmentoParaTexto(tipo: string, numero: string): string {
  if (numero === '1u') {
    return UNICO[tipo] ?? `${tipo} único`;
  }

  const n = parseInt(numero, 10);

  switch (tipo) {
    case 'art':
      return n < 10 ? `art. ${n}º` : `art. ${n}`;
    case 'par':
      return n < 10 ? `§ ${n}º` : `§ ${n}`;
    case 'inc':
      return `inciso ${converteNumeroArabicoParaRomano(numero)}`;
    case 'ali':
      return `alínea ${converteNumeroArabicoParaLetra(numero)}`;
    case 'ite':
      return `item ${numero}`;
    case 'cpt':
      return 'caput';
    case 'cap':
      return `Capítulo ${converteNumeroArabicoParaRomano(numero)}`;
    case 'sec':
      return `Seção ${converteNumeroArabicoParaRomano(numero)}`;
    case 'sub':
      return `Subseção ${converteNumeroArabicoParaRomano(numero)}`;
    case 'tit':
      return `Título ${converteNumeroArabicoParaRomano(numero)}`;
    case 'liv':
      return `Livro ${converteNumeroArabicoParaRomano(numero)}`;
    case 'prt':
      return `Parte ${converteNumeroArabicoParaRomano(numero)}`;
    default:
      return numero;
  }
}

export function lexmlIdParaTextoCanonico(lexmlId: string): string {
  const segs = parseLexmlId(lexmlId);
  if (segs.length === 0) return lexmlId;

  const reversed = [...segs].reverse();
  let result = '';

  for (let i = 0; i < reversed.length; i++) {
    const seg = reversed[i];
    result += segmentoParaTexto(seg.tipo, seg.numero);
    if (i < reversed.length - 1) {
      const nextSeg = reversed[i + 1];
      result += ' ' + (CONECTOR[nextSeg.tipo] ?? 'do') + ' ';
    }
  }

  return result;
}

export function atualizarTextoRemissao(textoAtual: string, lexmlIdAntigo: string, lexmlIdNovo: string): string {
  if (lexmlIdAntigo === lexmlIdNovo) return textoAtual;
  return lexmlIdParaTextoCanonico(lexmlIdNovo);
}
