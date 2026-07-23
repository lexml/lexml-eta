import { Dispositivo } from '../dispositivo/dispositivo';
import { isArticulacao, isCaput } from '../dispositivo/tipo';
import { buildHref, buildId } from '../lexml/util/idUtil';
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

// Recalcula o texto canônico absoluto direto do grafo de objetos: buildId lê .pai/.numero/.tipo
// ao vivo, então isso nunca depende de um id "antigo"/"novo" pré-computado passado por evento.
//
// Caso especial caput: buildId(caput) gera um segmento "cpt" sem dígito (ex.: "art1_cpt"), que
// parseLexmlId descarta silenciosamente (a regex de segmento exige ao menos um dígito) — sem este
// tratamento, o texto gerado seria só "art. 1º", perdendo a palavra "caput".
export function textoCanonicoDoDispositivo(dispositivo: Dispositivo): string {
  if (isCaput(dispositivo) && dispositivo.pai) {
    return `caput do ${textoCanonicoDoDispositivo(dispositivo.pai)}`;
  }
  return lexmlIdParaTextoCanonico(buildId(dispositivo));
}

// D4 do plano de simplificação: gera só o segmento LOCAL do dispositivo (ex.: "inciso I"), sem
// nenhuma cadeia de ancestrais — usado para referências "enxutas" (sem qualificador, ex.: "inciso I"
// sozinho, sem "do art. X"), que nunca devem ganhar uma cadeia que não tinham originalmente ao
// renumerar; só o próprio segmento local é corrigido, se a posição do dispositivo dentro do seu pai
// imediato mudar de fato.
export function textoCanonicoLocal(dispositivo: Dispositivo): string {
  if (isCaput(dispositivo)) return 'caput';
  const href = buildHref(dispositivo);
  const seg = href ? parseLexmlId(href)[0] : undefined;
  return seg ? segmentoParaTexto(seg.tipo, seg.numero) : dispositivo.rotulo?.trim() ?? '';
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

const REGEX_QUALIFICADOR_EXPLICITO = /\bd[ao]\b/i;

// D4 do plano de simplificação: distingue uma referência ABSOLUTA (sem sufixo "deste/desta") já
// escrita com uma cadeia de qualificadores explícita (ex.: "inciso II do art. 2", "item 1 da alínea
// b)") de uma forma "enxuta" (ex.: "inciso I" sozinho, sem "do art. X"). Referências enxutas nunca
// devem ganhar uma cadeia que não tinham originalmente ao renumerar — ver textoCanonicoLocal.
export function possuiQualificadorExplicito(texto: string): boolean {
  return REGEX_QUALIFICADOR_EXPLICITO.test(texto);
}

// Prefixo do lexmlId (o mesmo retornado por extrairSufixoContextual) → tipo do TipoDispositivo,
// para localizar o ancestral correspondente na árvore de objetos.
const PREFIXO_PARA_TIPO_DISPOSITIVO: Record<string, string> = {
  art: 'Artigo',
  par: 'Paragrafo',
  inc: 'Inciso',
  ali: 'Alinea',
  ite: 'Item',
  cap: 'Capitulo',
  sec: 'Secao',
  sub: 'Subsecao',
  tit: 'Titulo',
  liv: 'Livro',
  prt: 'Parte',
};

function buscarAncestralPorTipo(dispositivo: Dispositivo, tipo: string): Dispositivo | null {
  let atual = dispositivo.pai;
  while (atual) {
    if (atual.tipo === tipo) return atual;
    atual = atual.pai;
  }
  return null;
}

// Decide, de forma estrutural (subindo .pai — sem regex sobre id), se uma frase contextual
// ("deste artigo"/"desta seção") ainda se sustenta: origem e destino precisam compartilhar o MESMO
// ancestral do tipo indicado pelo prefixo (D5: o mesmo que extrairSufixoContextual retorna em `tipo`).
export function compartilhamAncestralDoTipo(origem: Dispositivo, destino: Dispositivo, tipoPrefixo: string): boolean {
  const tipoDispositivo = PREFIXO_PARA_TIPO_DISPOSITIVO[tipoPrefixo];
  if (!tipoDispositivo) return false;

  const ancestralOrigem = buscarAncestralPorTipo(origem, tipoDispositivo);
  const ancestralDestino = buscarAncestralPorTipo(destino, tipoDispositivo);

  return !!ancestralOrigem && ancestralOrigem === ancestralDestino;
}

const TIPO_DISPOSITIVO_PARA_PREFIXO: Record<string, string> = Object.fromEntries(Object.entries(PREFIXO_PARA_TIPO_DISPOSITIVO).map(([prefixo, tipo]) => [tipo, prefixo]));

// Gera o texto canônico de `dispositivo`, mas parando (excluindo) o ancestral do tipo indicado pelo
// prefixo — usado para reconstruir só a parte relativa de uma referência contextual (ex.: "inciso II"
// sem "do art. 5º", pra reanexar depois o sufixo "deste artigo" literal, ver D5).
// Análogo ao antigo extrairParteRelativa, mas caminhando a árvore de objetos em vez de uma string de id.
export function textoCanonicoRelativoATipo(dispositivo: Dispositivo, tipoPrefixoParar: string): string {
  if (isCaput(dispositivo)) return 'caput';

  const href = buildHref(dispositivo);
  const seg = href ? parseLexmlId(href)[0] : undefined;
  const textoNivel = seg ? segmentoParaTexto(seg.tipo, seg.numero) : dispositivo.rotulo?.trim() ?? '';

  const tipoDispositivoParar = PREFIXO_PARA_TIPO_DISPOSITIVO[tipoPrefixoParar];
  const pai = dispositivo.pai;

  // Caput é transparente para fins de parada: um dispositivo filho direto do caput de um artigo já
  // está "no artigo" — sem isso, pedir para parar em 'art' geraria "inciso I do caput" em vez de
  // simplesmente "inciso I" quando o dispositivo é filho direto do caput (sem parágrafo no meio).
  const paiEfetivamenteNoTipoParar = !!pai && (pai.tipo === tipoDispositivoParar || (isCaput(pai) && pai.pai?.tipo === tipoDispositivoParar));

  if (!pai || paiEfetivamenteNoTipoParar || isArticulacao(pai)) {
    return textoNivel;
  }

  const prefixoPai = TIPO_DISPOSITIVO_PARA_PREFIXO[pai.tipo];
  const conector = (prefixoPai && CONECTOR[prefixoPai]) ?? 'do';

  return `${textoNivel} ${conector} ${textoCanonicoRelativoATipo(pai, tipoPrefixoParar)}`;
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

// Fase 3 do plano de simplificação: substitui isTextoCanonico/isTextoCanonicoPorTipo (heurística que
// tentava adivinhar, por regex, se o texto "parece" canônico para um id) por uma comparação de
// igualdade contra o último texto que o próprio sistema gravou (textoRef). Mais preciso: pega
// exatamente "isso é o que nós geramos da última vez?" em vez de "isso parece uma referência válida?"
// (o que falha, por exemplo, quando o usuário troca "§ 2º" por "§ 5º" à mão — ambos "parecem"
// canônicos, mas só um bate com o que o sistema gerou).
//
// NÃO substitui isTextoReconhecivel — esse gate continua protegendo texto arbitrário/livre (ex.:
// remissão manual com texto "o dispositivo mencionado acima"), que nunca teve um textoRef canônico
// para começar. Ver nota D6 no plano.
export function foiEditadoManualmente(textoAtual: string, textoRefGravado: string | undefined): boolean {
  if (textoRefGravado === undefined) return true;
  return textoAtual.trim() !== textoRefGravado.trim();
}

// Complementa foiEditadoManualmente: cobre o caso em que o usuário restaura manualmente o texto
// para a forma canônica esperada do alvo ANTES da renumeração corrente (lexmlIdAntigo), mesmo que
// isso não bata com o textoRef gravado (que fica congelado desde a última divergência registrada).
// Sem isso, uma vez marcada revisao:true, a entrada nunca mais sairia desse estado sozinha — mesmo
// que o texto já esteja de volta ao padrão canônico correto.
export function isTextoCanonicoParaId(textoAtual: string, lexmlIdAntigo: string): boolean {
  const sufixo = extrairSufixoContextual(textoAtual);
  if (!sufixo) return isTextoCanonico(textoAtual, lexmlIdAntigo);

  const relAntiga = extrairParteRelativa(lexmlIdAntigo, sufixo.tipo);
  if (relAntiga === null) return false;

  const prefixo = textoAtual.slice(0, textoAtual.length - sufixo.texto.length - 1);
  return isTextoCanonico(prefixo, relAntiga);
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

const ROMANO = '(?:[uú]nic[ao]|[MDCLXVI]+)';
const NUM = `(?:[uú]nic[ao]|\\d+(?:-[a-z]+)?º?)`;

const REGEX_TEXTO_RECONHECIVEL = new RegExp(
  `^(?:` +
    `art\\.?\\s*${NUM}` + // art. 1º, art 2, art.único
    `|artigo\\s+${NUM}` + // artigo 2, artigo único
    `|§\\s*${NUM}` + // § 1º, § único
    `|par\\.\\s*${NUM}` + // par. 1
    `|parágrafo\\s+${NUM}` + // parágrafo 1
    `|inciso\\s+${ROMANO}` + // inciso II
    `|inc\\.\\s*${ROMANO}` + // inc. III
    `|alínea\\s+[a-z]\\)?` + // alínea a)
    `|alí\\.\\s*[a-z]\\)?` + // alí. b)
    `|item\\s+${NUM}` + // item 3
    `|caput` + // caput
    `|capítulo\\s+${ROMANO}` + // Capítulo I
    `|seção\\s+${ROMANO}` + // Seção II
    `|subseção\\s+${ROMANO}` + // Subseção única
    `|título\\s+${ROMANO}` + // Título III
    `|livro\\s+${ROMANO}` + // Livro I
    `|parte\\s+${ROMANO}` + // Parte única
    `)`,
  'i'
);

// Retorna true se o texto é uma referência reconhecível a um dispositivo legal
// (forma canônica ou variante trivial). Textos livres como "o artigo primeiro"
// retornam false e devem ser marcados para revisão após renumeração.
export function isTextoReconhecivel(texto: string): boolean {
  const trimmed = texto.trim();
  if (!trimmed) return false;

  const sufixo = extrairSufixoContextual(trimmed);
  const nucleo = sufixo ? trimmed.slice(0, trimmed.length - sufixo.texto.length).trim() : trimmed;

  return REGEX_TEXTO_RECONHECIVEL.test(nucleo);
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

  return lexmlIdParaTextoCanonico(lexmlIdNovo);
}
