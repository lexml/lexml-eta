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

const ROMAN_VALS = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const ROMAN_SYMS = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

function toRoman(n: number): string {
  let result = '';
  for (let i = 0; i < ROMAN_VALS.length; i++) {
    while (n >= ROMAN_VALS[i]) {
      result += ROMAN_SYMS[i];
      n -= ROMAN_VALS[i];
    }
  }
  return result;
}

export function numeroParaExibicao(tipo: string, numArabic: string): string {
  if (numArabic === '1u') return 'único';
  const n = parseInt(numArabic, 10);
  if (ROMAN_TYPES.has(tipo)) return toRoman(n);
  if (LETTER_TYPES.has(tipo)) return String.fromCharCode(96 + n); // 1→'a', 2→'b'
  return numArabic;
}

export function parseLexmlId(id: string): SegmentoLexmlId[] {
  return id
    .split('_')
    .map(seg => {
      const match = seg.match(/^([a-z]+)(\d+[u]?)$/);
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
