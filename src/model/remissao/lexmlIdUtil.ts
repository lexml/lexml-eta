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
      return `alínea ${converteNumeroArabicoParaLetra(numero)})`;
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

// Mapeamento de nome do dispositivo (como aparece no texto) → prefixo do lexmlId
/* eslint-disable prettier/prettier */
const SUFIXO_PARA_TIPO: Record<string, string> = {
  artigo: 'art',
  parágrafo: 'par',
  inciso: 'inc',
  alínea: 'ali',
  item: 'ite',
  subseção: 'sub', // subseção antes de seção para evitar match parcial
  seção: 'sec',
  capítulo: 'cap',
  título: 'tit',
  livro: 'liv',
  parte: 'prt',
};
/* eslint-enable prettier/prettier */

const TIPOS_SUFIXO = Object.keys(SUFIXO_PARA_TIPO).join('|');

// Detecta sufixo contextual no FINAL do texto do link: deste <dispositivo> | do presente <dispositivo>
const REGEX_SUFIXO_CONTEXTUAL = new RegExp(`\\s+(d(?:est[ae]|o presente|a presente)\\s+(${TIPOS_SUFIXO}))$`, 'i');

export interface SufixoContextual {
  tipo: string; // prefixo lexmlId: 'art', 'par', 'cap', etc.
  texto: string; // texto original preservado: "deste parágrafo"
}

export function extrairSufixoContextual(texto: string): SufixoContextual | null {
  const match = texto.match(REGEX_SUFIXO_CONTEXTUAL);
  if (!match) return null;
  const nomeDispositivo = match[2].toLowerCase();
  const tipo = SUFIXO_PARA_TIPO[nomeDispositivo];
  if (!tipo) return null;
  return { tipo, texto: match[1] };
}

// Retorna os segmentos do lexmlId ABAIXO do nível do contexto.
// Ex: extrairParteRelativa('art6_par1_inc2', 'par') → 'inc2'
//     extrairParteRelativa('art6_par1_inc2', 'art') → 'par1_inc2'
// Retorna null se o nível de contexto não for encontrado no lexmlId.
export function extrairParteRelativa(lexmlId: string, nivelContexto: string): string | null {
  const segs = parseLexmlId(lexmlId);
  const idx = segs.findIndex(s => s.tipo === nivelContexto);
  if (idx < 0) return null;
  return segs
    .slice(idx + 1)
    .map(s => s.tipo + s.numero)
    .join('_');
}

function normalizarTexto(s: string): string {
  return s.replace(/[ºª)]/g, '').trim().toLowerCase();
}

// Retorna true se o texto é o canônico (ou variante trivial de capitalização/ordinal)
// de algum sufixo do lexmlId.
// Exemplos: "§ 1º" é canônico de "par1"; "Art. 3" é canônico de "art3".
// "inciso I do teste" não é canônico de nenhum sufixo de "art2_par1_inc1".
function isTextoCanonico(texto: string, lexmlId: string): boolean {
  if (texto.trim() === '') return true;
  const normalizado = normalizarTexto(texto);
  const segs = parseLexmlId(lexmlId);
  for (let i = 0; i < segs.length; i++) {
    const sufixoId = segs
      .slice(i)
      .map(s => s.tipo + s.numero)
      .join('_');
    if (normalizarTexto(lexmlIdParaTextoCanonico(sufixoId)) === normalizado) {
      return true;
    }
  }
  return false;
}

// Verifica se o texto é a forma canônica de algum dispositivo do tipo dado (com qualquer numeração).
// Usada para detectar drift: "inciso I" é canônico de 'inc1' mesmo que relAntiga tenha derivado para 'inc2'.
function isTextoCanonicoPorTipo(texto: string, tipo: string): boolean {
  if (texto.trim() === '') return true;
  const normalizado = normalizarTexto(texto);
  if (normalizarTexto(lexmlIdParaTextoCanonico(tipo + '1u')) === normalizado) return true;
  for (let n = 1; n <= 150; n++) {
    if (normalizarTexto(lexmlIdParaTextoCanonico(tipo + n)) === normalizado) return true;
  }
  return false;
}

// Troca X1 ↔ X1u para par e art, reconciliando ids gerados pelo editor com texto canônico
// que usa "parágrafo único" / "artigo único".
// buildHref só emite 'par1u' (quando informouParagrafoUnico=true) e nunca 'art1u'; o texto
// detectado pode usar "parágrafo único" ou "artigo único" enquanto o id tem par1/art1.
function swapPar1Variante(lexmlId: string): string {
  if (/(^|_)par1u(?=_|$)/.test(lexmlId)) return lexmlId.replace(/(^|_)par1u(?=_|$)/g, '$1par1');
  if (/(^|_)par1(?=_|$)/.test(lexmlId)) return lexmlId.replace(/(^|_)par1(?=_|$)/g, '$1par1u');
  if (/(^|_)art1u(?=_|$)/.test(lexmlId)) return lexmlId.replace(/(^|_)art1u(?=_|$)/g, '$1art1');
  if (/(^|_)art1(?=_|$)/.test(lexmlId)) return lexmlId.replace(/(^|_)art1(?=_|$)/g, '$1art1u');
  return lexmlId;
}

export function atualizarTextoRemissao(textoAtual: string, lexmlIdAntigo: string, lexmlIdNovo: string): string {
  if (lexmlIdAntigo === lexmlIdNovo) return textoAtual;

  const sufixo = extrairSufixoContextual(textoAtual);
  if (sufixo) {
    const relAntiga = extrairParteRelativa(lexmlIdAntigo, sufixo.tipo);
    const relNova = extrairParteRelativa(lexmlIdNovo, sufixo.tipo);

    if (relAntiga !== null && relNova !== null) {
      if (relAntiga === relNova) return textoAtual;

      if (relNova !== '') {
        const prefixo = textoAtual.slice(0, textoAtual.length - sufixo.texto.length - 1);
        const relAntigaSegs = parseLexmlId(relAntiga);
        const relAntigaVariante = swapPar1Variante(relAntiga);

        let prefixoCanonico = isTextoCanonico(prefixo, relAntiga);
        let relNovaParaGeracao = relNova;

        if (!prefixoCanonico) {
          if (relAntigaSegs.length === 1 && isTextoCanonicoPorTipo(prefixo, relAntigaSegs[0].tipo)) {
            prefixoCanonico = true;
          } else if (relAntigaVariante !== relAntiga && isTextoCanonico(prefixo, relAntigaVariante)) {
            prefixoCanonico = true;
            relNovaParaGeracao = swapPar1Variante(relNova);
          }
        }

        if (!prefixoCanonico) {
          return textoAtual;
        }
        return lexmlIdParaTextoCanonico(relNovaParaGeracao) + ' ' + sufixo.texto;
      }
    }
  }

  if (!isTextoCanonico(textoAtual, lexmlIdAntigo)) {
    // Tenta variante par1 ↔ par1u antes de preservar como texto customizado
    const varianteAntigo = swapPar1Variante(lexmlIdAntigo);
    if (varianteAntigo === lexmlIdAntigo || !isTextoCanonico(textoAtual, varianteAntigo)) {
      return textoAtual;
    }
  }

  return lexmlIdParaTextoCanonico(lexmlIdNovo);
}
