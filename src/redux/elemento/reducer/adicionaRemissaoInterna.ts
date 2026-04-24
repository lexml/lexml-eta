import { getDispositivoFromElemento, createElemento, createElementoValidadoComExtras } from '../../../model/elemento/elementoUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ReferenciaDispositivoParser } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { Articulacao, Dispositivo, Artigo } from '../../../model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../model/remissao';
import { MENSAGEM_REMISSAO_INVALIDA } from '../../../model/remissao/remissao';
import { gerarRefId } from '../../../model/remissao/refId';
import { converteNumeroArabicoParaRomano, converteNumeroArabicoParaLetra } from '../../../model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { stripHtml } from '../../../util/html-util';
import { percorreHierarquiaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';

interface ReferenciaEncontrada {
  texto: string;
  dispositivoDestino: Dispositivo;
  inicio?: number; // posição de início no texto original (match.index)
}

// Padrões para dispositivo (número sempre em romano no texto)
const P_ARTIGO = `(?:art\\.?\\s*|artigo\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
const P_PARAGRAFO = `(?:§\\s*|par[aá]grafo\\s+|par\\.?\\s*)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
const P_INCISO = `(?:inc\\.?\\s*|inciso\\s+)(?:[uú]nico|[MDCLXVI]+(?:-[a-z]+)?)`;
const P_ALINEA = `(?:al[ií]\\.?\\s*|al[ií]nea\\s+)(?:[a-z]+(?:-[a-z]+)?)\\)?`;
const P_ITEM = `(?:item\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)`;
const CONECTOR = `\\s+d[ao]\\s+`;
const P_CAPUT = `caput`;

// Padrões para agrupadores (número em romano ou "único/única" no texto)
const P_NUM_AGRUPADOR = `(?:[uú]nic[ao]|[MDCLXVI]+(?:-[a-z]+)?)`;
const P_SUBSECAO = `(?:subse[çc][aã]o\\s+)${P_NUM_AGRUPADOR}`;
const P_SECAO = `(?:se[çc][aã]o\\s+)${P_NUM_AGRUPADOR}`;
const P_CAPITULO = `(?:cap[ií]tulo\\s+)${P_NUM_AGRUPADOR}`;
const P_TITULO = `(?:t[ií]tulo\\s+)${P_NUM_AGRUPADOR}`;
const P_LIVRO = `(?:livro\\s+)${P_NUM_AGRUPADOR}`;
const P_PARTE = `(?:parte\\s+)${P_NUM_AGRUPADOR}`;

// Alternação composta para qualquer agrupador (mais específico primeiro)
const P_QUALQUER_AGRUPADOR = `(?:${P_SUBSECAO}|${P_SECAO}|${P_CAPITULO}|${P_TITULO}|${P_LIVRO}|${P_PARTE})`;

// Regex compiladas uma única vez no escopo do módulo — resetar lastIndex antes de cada uso.
const REGEX_ABSOLUTA = new RegExp(
  `(?:${P_ITEM}${CONECTOR})?` + `(?:${P_ALINEA}${CONECTOR})?` + `(?:${P_INCISO}${CONECTOR})?` + `(?:(?:${P_CAPUT}|${P_PARAGRAFO})${CONECTOR})?` + `${P_ARTIGO}`,
  'gi'
);

const REGEX_AGRUPADOR = new RegExp(`${P_QUALQUER_AGRUPADOR}(?:${CONECTOR}${P_QUALQUER_AGRUPADOR})*`, 'gi');

const REGEX_CONTEXTUAL = new RegExp(
  `(` +
    // 1: termina em caput ou parágrafo (com item/alínea/inciso opcionais)
    `(?:(?:${P_ITEM}${CONECTOR})?(?:${P_ALINEA}${CONECTOR})?(?:${P_INCISO}${CONECTOR})?(?:${P_CAPUT}|${P_PARAGRAFO}))` +
    // 2: termina em inciso (com item/alínea opcionais)
    `|(?:(?:${P_ITEM}${CONECTOR})?(?:${P_ALINEA}${CONECTOR})?${P_INCISO})` +
    // 3: termina em alínea (com item opcional)
    `|(?:(?:${P_ITEM}${CONECTOR})?${P_ALINEA})` +
    // 4: apenas item
    `|(?:${P_ITEM})` +
    // 5: agrupador simples (ex: "Seção II deste Capítulo")
    `|(?:${P_QUALQUER_AGRUPADOR})` +
    `)\\s+d(?:este|esta|o\\s+presente|a\\s+presente)\\s+(artigo|par[aá]grafo|inciso|cap[ií]tulo|se[çc][aã]o|subse[çc][aã]o|t[ií]tulo|livro|parte)`,
  'gi'
);

export const adicionaRemissaoInterna = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const textoAtual = dispositivo?.texto;

  if (!dispositivo || !textoAtual) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const remissoesEncontradas = detectarReferencias(stripHtml(textoAtual), dispositivo, state.articulacao);

  // Preserva entradas inválidas existentes — só saem via REMOVER_REMISSAO_INVALIDA
  const oldInvalidas = (state.remissoes?.[dispositivo.uuid!] ?? []).filter((r: any) => r.valida === false);

  if (remissoesEncontradas.length === 0 && oldInvalidas.length === 0) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const oldEntries = state.remissoes?.[dispositivo.uuid!] ?? [];
  const oldByTarget = new Map<string, string>(oldEntries.map((r: any) => [r.targetLexmlId, r.refId]));

  const novasRemissoes: RemissaoInternaValue[] = remissoesEncontradas.map(item => ({
    refId: (item.dispositivoDestino.id && oldByTarget.get(item.dispositivoDestino.id)) ?? gerarRefId(),
    targetLexmlId: item.dispositivoDestino.id,
    targetUuid: item.dispositivoDestino.uuid,
    targetRotulo: item.dispositivoDestino.rotulo,
    sourceUuid: dispositivo.uuid,
    sourceLexmlId: dispositivo.id,
    textoRef: item.texto,
    inicio: item.inicio,
  }));

  const remissaoRegistry = { ...(state.remissoes || {}) };
  // Merge: novas detecções válidas + inválidas preservadas
  remissaoRegistry[dispositivo.uuid!] = [...novasRemissoes, ...oldInvalidas];

  const elemento = createElemento(dispositivo, true);
  const eventosUi = new Eventos();
  eventosUi.add(StateType.AtualizaRemissaoInterna, [elemento]);

  // Emite ElementoValidado com mensagem de remissão inválida quando há entradas preservadas
  if (oldInvalidas.length > 0) {
    const mensagemInvalida = {
      tipo: TipoMensagem.ERROR,
      descricao: MENSAGEM_REMISSAO_INVALIDA,
    };
    eventosUi.add(StateType.ElementoValidado, [createElementoValidadoComExtras(dispositivo, [mensagemInvalida])]);
  }

  return {
    ...state,
    remissoes: remissaoRegistry,
    ui: { ...state.ui, events: eventosUi.build() },
  };
};

const detectarReferencias = (texto: string, dispositivo: Dispositivo, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const absolutas = detectarReferenciasAbsolutas(texto, articulacao);
  const agrupadores = detectarReferenciasAgrupadores(texto, articulacao);
  const contextuais = detectarReferenciasContextuais(texto, dispositivo, articulacao);
  return [...absolutas, ...agrupadores, ...contextuais];
};

// Captura referências absolutas encadeadas exigindo a âncora do artigo (ex: "§ 2º do art. 5º").
const detectarReferenciasAbsolutas = (texto: string, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const resultado: ReferenciaEncontrada[] = [];

  let match: RegExpExecArray | null;
  REGEX_ABSOLUTA.lastIndex = 0;
  while ((match = REGEX_ABSOLUTA.exec(texto)) !== null) {
    const textoReferencia = match[0];
    const parser = new ReferenciaDispositivoParser(textoReferencia);
    if (parser.valido && parser.referencias.length > 0) {
      const dispositivoDestino = buscarDispositivoPorReferencia(articulacao, parser.referencias);
      if (dispositivoDestino) {
        resultado.push({ texto: textoReferencia, dispositivoDestino, inicio: match.index });
      }
    }
  }

  return resultado;
};

// Mapeia palavra-chave normalizada -> tipo de dispositivo agrupador.
const MAPA_TEXTO_PARA_TIPO_AGRUPADOR: Record<string, string> = {
  subsecao: TipoDispositivo.subsecao.tipo,
  secao: TipoDispositivo.secao.tipo,
  capitulo: TipoDispositivo.capitulo.tipo,
  titulo: TipoDispositivo.titulo.tipo,
  livro: TipoDispositivo.livro.tipo,
  parte: TipoDispositivo.parte.tipo,
};

// extrair tipo e número (romano ou "único/única") de um segmento de agrupador
const REGEX_SEGMENTO_AGRUPADOR = /^(parte|livro|t[ií]tulo|cap[ií]tulo|se[çc][aã]o|subse[çc][aã]o)\s+([uú]nic[ao]|[MDCLXVI]+(?:-[a-z]+)?)$/i;

// Extrai tipo e número romano de um segmento textual de agrupador.
const parsearSegmentoAgrupador = (segmento: string): { tipo: string; numero: string } | null => {
  const m = REGEX_SEGMENTO_AGRUPADOR.exec(segmento.trim());
  if (!m) return null;
  const tipo = MAPA_TEXTO_PARA_TIPO_AGRUPADOR[normalizarKeyword(m[1])];
  return tipo ? { tipo, numero: m[2] } : null;
};

// Busca filho direto correspondente em tipo e número (romano ou "único/única").
const buscarFilhoAgrupador = (raiz: Dispositivo, tipo: string, numeroRomano: string): Dispositivo | null => {
  const filhos = raiz.filhos ?? [];

  // "Único/Única": válido apenas quando existe exatamente 1 filho do tipo com numero='1'.
  if (/[uú]nic[ao]/i.test(numeroRomano)) {
    const filhosMesmoTipo = filhos.filter(f => f.tipo === tipo);
    return filhosMesmoTipo.length === 1 && filhosMesmoTipo[0].numero === '1' ? filhosMesmoTipo[0] : null;
  }

  const numeroNorm = normalizarNumero(numeroRomano);
  return filhos.find(f => f.tipo === tipo && normalizarNumero(converteNumeroArabicoParaRomano(f.numero ?? '')) === numeroNorm) ?? null;
};

// Resolve cadeia ("Seção II do Capítulo I") quebrando por "do/da" e buscando do geral ao específico via articulacao.filhos.
const resolverCadeiaAgrupadores = (textoChain: string, articulacao: Articulacao): Dispositivo | null => {
  const segmentos = textoChain.split(/\s+d[ao]\s+/i);
  const segmentosReversed = [...segmentos].reverse();
  let atual: Dispositivo = articulacao;
  for (const seg of segmentosReversed) {
    const parsed = parsearSegmentoAgrupador(seg);
    if (!parsed) return null;
    const filho = buscarFilhoAgrupador(atual, parsed.tipo, parsed.numero);
    if (!filho) return null;
    atual = filho;
  }
  return atual === (articulacao as unknown as Dispositivo) ? null : atual;
};

// Detecta referências absolutas a agrupadores, incluindo cadeias (ex: "Seção II do Capítulo I").
const detectarReferenciasAgrupadores = (texto: string, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const resultado: ReferenciaEncontrada[] = [];
  let match: RegExpExecArray | null;
  REGEX_AGRUPADOR.lastIndex = 0;
  while ((match = REGEX_AGRUPADOR.exec(texto)) !== null) {
    const dispositivoDestino = resolverCadeiaAgrupadores(match[0], articulacao);
    if (dispositivoDestino) {
      resultado.push({ texto: match[0], dispositivoDestino, inicio: match.index });
    }
  }
  return resultado;
};

// Busca filho agrupador de um ancestral a partir do prefixo textual (ex: "Seção II").
const buscarAgrupadorFilhoPorPrefixo = (prefixText: string, ancestor: Dispositivo): Dispositivo | null => {
  const parsed = parsearSegmentoAgrupador(prefixText);
  if (!parsed) return null;
  return buscarFilhoAgrupador(ancestor, parsed.tipo, parsed.numero);
};

// Detecção de referências contextuais relativas (ex: "deste artigo", "deste parágrafo", "do caput").
const MAPA_CONTEXTUAL_PARA_TIPO: Record<string, string> = {
  artigo: TipoDispositivo.artigo.tipo, //         'Artigo'
  paragrafo: TipoDispositivo.paragrafo.tipo, // 'Paragrafo'
  inciso: TipoDispositivo.inciso.tipo, //       'Inciso'
  capitulo: TipoDispositivo.capitulo.tipo, //   'Capitulo'
  secao: TipoDispositivo.secao.tipo, //         'Secao'
  subsecao: TipoDispositivo.subsecao.tipo, //   'Subsecao'
  titulo: TipoDispositivo.titulo.tipo, //       'Titulo'
  livro: TipoDispositivo.livro.tipo, //         'Livro'
  parte: TipoDispositivo.parte.tipo, //         'Parte'
};

// Remove acentos para padronizar as chaves de busca no mapa (ex: "seção" → "secao").
const normalizarKeyword = (keyword: string): string =>
  keyword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Sobe a hierarquia (.pai) para encontrar o ancestral mais próximo do tipo desejado.
export const buscarAncestralPorTipo = (dispositivo: Dispositivo, tipo: string): Dispositivo | null => {
  let atual = dispositivo.pai;
  while (atual) {
    if (atual.tipo === tipo) return atual;
    atual = atual.pai;
  }
  return null;
};

const numeroParaSinteseParagrafo = (numero: string): string => (numero === '1u' || numero.toLowerCase() === 'único' ? 'parágrafo único' : `§ ${numero}`);

// Monta a referência do ancestorInicial até o artigo para o Parser; retorna null se não houver artigo
const construirSinteseAteArtigo = (prefixText: string, ancestorInicial: Dispositivo): string | null => {
  const partes: string[] = [];
  let atual: Dispositivo | undefined = ancestorInicial;

  while (atual) {
    if (atual.tipo === TipoDispositivo.artigo.tipo) {
      partes.push(`art. ${atual.numero}`);
      break;
    }
    if (atual.tipo === TipoDispositivo.paragrafo.tipo) {
      partes.push(numeroParaSinteseParagrafo(atual.numero || ''));
    } else if (atual.tipo === TipoDispositivo.inciso.tipo) {
      partes.push(`inciso ${converteNumeroArabicoParaRomano(atual.numero || '')}`);
    }
    atual = atual.pai;
  }

  if (partes.length === 0) return null;

  const prefixNorm = prefixText.trim().replace(/\s*\)\s*$/, '');
  return `${prefixNorm} do ${partes.join(' do ')}`;
};

const detectarReferenciasContextuais = (texto: string, dispositivo: Dispositivo, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const resultado: ReferenciaEncontrada[] = [];

  let match: RegExpExecArray | null;
  REGEX_CONTEXTUAL.lastIndex = 0;

  while ((match = REGEX_CONTEXTUAL.exec(texto)) !== null) {
    const textoCompleto = match[0];
    const prefixText = match[1]?.trim() ?? '';
    const qualifierKeyword = match[2] ?? '';

    if (!prefixText || !qualifierKeyword) continue;

    const tipoAncestral = MAPA_CONTEXTUAL_PARA_TIPO[normalizarKeyword(qualifierKeyword)];
    if (!tipoAncestral) continue;

    const ancestor = buscarAncestralPorTipo(dispositivo, tipoAncestral);
    if (!ancestor) continue;

    // "caput deste artigo" → return artigo.caput diretamente, sem sintese.
    if (prefixText.toLowerCase() === P_CAPUT) {
      const artigo = tipoAncestral === TipoDispositivo.artigo.tipo ? ancestor : buscarAncestralPorTipo(ancestor, TipoDispositivo.artigo.tipo);
      if (artigo) {
        const caput = (artigo as Artigo).caput;
        if (caput) {
          resultado.push({ texto: textoCompleto, dispositivoDestino: caput, inicio: match.index });
        }
      }
      continue;
    }

    // Sintetiza a referência absoluta e delega ao parser (ex: "§ 2º" + art3 → "§ 2º do art. 3")
    const textSintetizado = construirSinteseAteArtigo(prefixText, ancestor);
    if (!textSintetizado) {
      // Contexto de agrupador: busca o filho direto do ancestral pelo prefixo (ex: "Seção II deste Capítulo")
      const agrupadorDestino = buscarAgrupadorFilhoPorPrefixo(prefixText, ancestor);
      if (agrupadorDestino) {
        resultado.push({ texto: textoCompleto, dispositivoDestino: agrupadorDestino, inicio: match.index });
      }
      continue;
    }

    const parser = new ReferenciaDispositivoParser(textSintetizado);
    if (!parser.valido || parser.referencias.length === 0) continue;

    const dispositivoDestino = buscarDispositivoPorReferencia(articulacao, parser.referencias);
    if (dispositivoDestino) {
      resultado.push({ texto: textoCompleto, dispositivoDestino, inicio: match.index });
    }
  }

  return resultado;
};

const buscarDispositivoPorReferencia = (articulacao: Articulacao | undefined, referencias: any[]): Dispositivo | null => {
  if (!articulacao) return null;

  let dispositivoAtual: Dispositivo | null = null;
  const refs = [...referencias].reverse();

  for (const ref of refs) {
    const tipo = ref.tipo?.tipo;
    const numero = ref.numero;

    if (!dispositivoAtual) {
      dispositivoAtual = buscarArtigo(articulacao, numero);
    } else {
      dispositivoAtual = buscarFilhoPorTipoENumero(dispositivoAtual, tipo, numero);
    }

    if (!dispositivoAtual) {
      return null;
    }
  }

  return dispositivoAtual;
};

const buscarArtigo = (articulacao: Articulacao, numero: string): Dispositivo | null => {
  if (!articulacao || !articulacao.artigos) {
    return null;
  }

  const numeroNormalizado = normalizarNumero(numero);

  for (const artigo of articulacao.artigos) {
    if (normalizarNumero(artigo.numero) === numeroNormalizado) {
      return artigo;
    }
    if (numero && numero.toLowerCase() === 'único' && artigo.numero === '1') {
      return artigo;
    }
  }

  return null;
};

// Converte o número do modelo para o formato do parser (ex: inciso '1' → 'i') viabilizando a comparação.
const normalizarNumeroParaTipo = (tipo: string, numero: string | undefined): string => {
  if (!numero) return '';
  if (tipo === TipoDispositivo.inciso.tipo) {
    return normalizarNumero(converteNumeroArabicoParaRomano(numero));
  }
  if (tipo === TipoDispositivo.alinea.tipo) {
    return normalizarNumero(converteNumeroArabicoParaLetra(numero));
  }
  return normalizarNumero(numero);
};

const buscarFilhoPorTipoENumero = (dispositivo: Dispositivo, tipo: string, numero: string): Dispositivo | null => {
  if (!dispositivo) {
    return null;
  }

  const numeroNormalizado = normalizarNumero(numero);

  const bate = (filho: Dispositivo): boolean => filho.tipo === tipo && normalizarNumeroParaTipo(tipo, filho.numero) === numeroNormalizado;

  const artigo = dispositivo as Artigo;
  if (tipo === TipoDispositivo.inciso.tipo && artigo?.caput) {
    const filhosCaput = artigo.caput.filhos || [];
    const encontrado = filhosCaput.find(bate);
    if (encontrado) return encontrado;
  }

  const filhos = dispositivo.filhos || [];
  const encontradoFilho = filhos.find(bate);
  if (encontradoFilho) return encontradoFilho;

  if (tipo === TipoDispositivo.paragrafo.tipo && numero && numero.toLowerCase() === 'único') {
    return filhos.find(f => f.tipo === tipo) ?? null;
  }

  return null;
};

const normalizarNumero = (numero: string | undefined): string => {
  if (!numero) return '';
  return numero.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Garante que o registry de remissões está completo para todos os dispositivos com texto.
 * Dispositivos não editados na sessão atual não têm entradas no registry;
 */
export const completarRegistroRemissoes = (articulacao: Articulacao, registroExistente: Record<number, RemissaoInternaValue[]>): Record<number, RemissaoInternaValue[]> => {
  if (!articulacao) return registroExistente;

  const registroCompleto = { ...registroExistente };

  percorreHierarquiaDispositivos(articulacao as unknown as Dispositivo, dispositivo => {
    if (!dispositivo.texto || dispositivo.uuid === undefined) return;
    if (registroCompleto[dispositivo.uuid] !== undefined) return;

    const remissoesEncontradas = detectarReferencias(stripHtml(dispositivo.texto), dispositivo, articulacao);
    if (remissoesEncontradas.length > 0) {
      registroCompleto[dispositivo.uuid] = remissoesEncontradas.map(item => ({
        refId: gerarRefId(),
        targetLexmlId: item.dispositivoDestino.id,
        targetUuid: item.dispositivoDestino.uuid,
        targetRotulo: item.dispositivoDestino.rotulo,
        sourceUuid: dispositivo.uuid,
        sourceLexmlId: dispositivo.id,
        textoRef: item.texto,
        inicio: item.inicio,
      }));
    }
  });

  return registroCompleto;
};
