import { getDispositivoFromElemento, createElemento } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ReferenciaDispositivoParser } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { Articulacao, Dispositivo, Artigo } from '../../../model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../model/remissao';
import { converteNumeroArabicoParaRomano, converteNumeroArabicoParaLetra } from '../../../model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';

interface ReferenciaEncontrada {
  texto: string;
  dispositivoDestino: Dispositivo;
}

const P_ARTIGO = `(?:art\\.?\\s*|artigo\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
const P_PARAGRAFO = `(?:§\\s*|par[aá]grafo\\s+|par\\.?\\s*)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
const P_INCISO = `(?:inc\\.?\\s*|inciso\\s+)(?:[uú]nico|[MDCLXVI]+(?:-[a-z]+)?)`;
const P_ALINEA = `(?:al[ií]\\.?\\s*|al[ií]nea\\s+)(?:[a-z]+(?:-[a-z]+)?)`;
const P_ITEM = `(?:item\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)`;
const CONECTOR = `\\s+d[ao]\\s+`;
const P_CAPUT = `caput`;

export const adicionaRemissaoInterna = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const textoAtual = dispositivo?.texto;

  if (!dispositivo || !textoAtual) {
    state.ui.events = [];
    return state;
  }

  const remissoesEncontradas = detectarReferencias(textoAtual, dispositivo, state.articulacao);

  if (remissoesEncontradas.length === 0) {
    state.ui.events = [];
    return state;
  }

  const novasRemissoes: RemissaoInternaValue[] = remissoesEncontradas.map(item => ({
    refId: gerarId(),
    targetLexmlId: item.dispositivoDestino.id,
    targetUuid: item.dispositivoDestino.uuid,
    targetRotulo: item.dispositivoDestino.rotulo,
    sourceUuid: dispositivo.uuid,
    sourceLexmlId: dispositivo.id,
    textoRef: item.texto,
  }));

  const remissaoRegistry = { ...(state.remissoes || {}) };
  remissaoRegistry[dispositivo.uuid!] = novasRemissoes;

  const elemento = createElemento(dispositivo, true);
  const eventosUi = new Eventos();
  eventosUi.add(StateType.AtualizaRemissaoInterna, [elemento]);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: eventosUi.build(),
      alertas: state.ui?.alertas,
      message: state.ui?.message,
      paginacao: state.ui?.paginacao,
    },
    emRevisao: state.emRevisao,
    usuario: state.usuario,
    revisoes: state.revisoes,
    numEventosPassadosAntesDaRevisao: state.numEventosPassadosAntesDaRevisao,
    mensagensCritical: state.mensagensCritical,
    remissoes: remissaoRegistry,
  };
};

const detectarReferencias = (texto: string, dispositivo: Dispositivo, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const absolutas = detectarReferenciasAbsolutas(texto, articulacao);
  const contextuais = detectarReferenciasContextuais(texto, dispositivo, articulacao);
  return [...absolutas, ...contextuais];
};

// Captura referências absolutas encadeadas exigindo a âncora do artigo (ex: "§ 2º do art. 5º").
const detectarReferenciasAbsolutas = (texto: string, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const resultado: ReferenciaEncontrada[] = [];

  const regexComposta = new RegExp(
    `(?:${P_ITEM}${CONECTOR})?` + `(?:${P_ALINEA}${CONECTOR})?` + `(?:${P_INCISO}${CONECTOR})?` + `(?:${P_PARAGRAFO}${CONECTOR})?` + `${P_ARTIGO}`,
    'gi'
  );

  let match: RegExpExecArray | null;
  regexComposta.lastIndex = 0;
  while ((match = regexComposta.exec(texto)) !== null) {
    const textoReferencia = match[0];
    const parser = new ReferenciaDispositivoParser(textoReferencia);
    if (parser.valido && parser.referencias.length > 0) {
      const dispositivoDestino = buscarDispositivoPorReferencia(articulacao, parser.referencias);
      if (dispositivoDestino) {
        resultado.push({ texto: textoReferencia, dispositivoDestino });
      }
    }
  }

  return resultado;
};

// Detecção de referências contextuais relativas (ex: "deste artigo", "deste parágrafo", "do caput").
const MAPA_CONTEXTUAL_PARA_TIPO: Record<string, string> = {
  artigo: TipoDispositivo.artigo.tipo, //         'Artigo'
  paragrafo: TipoDispositivo.paragrafo.tipo, // 'Paragrafo'
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
    }
    atual = atual.pai;
  }

  if (partes.length === 0) return null;

  return `${prefixText.trim()} do ${partes.join(' do ')}`;
};

const detectarReferenciasContextuais = (texto: string, dispositivo: Dispositivo, articulacao: Articulacao): ReferenciaEncontrada[] => {
  const resultado: ReferenciaEncontrada[] = [];

  /**
   * Captura referências contextuais divididas em Grupo 1 (Cadeia) e Grupo 2 (Alvo).
   * - O Grupo 1 mapeia as combinações válidas de hierarquia (ex: item até inciso).
   * - O Grupo 2 define o termo âncora ("artigo", "capítulo").
   * - O qualificador lida com os pronomes ("deste", "da presente", etc).
   */
  const regexContextual = new RegExp(
    `(` +
      // 1: termina em caput ou parágrafo (com item/alínea/inciso opcionais)
      `(?:(?:${P_ITEM}${CONECTOR})?(?:${P_ALINEA}${CONECTOR})?(?:${P_INCISO}${CONECTOR})?(?:${P_CAPUT}|${P_PARAGRAFO}))` +
      // 2: termina em inciso (com item/alínea opcionais)
      `|(?:(?:${P_ITEM}${CONECTOR})?(?:${P_ALINEA}${CONECTOR})?${P_INCISO})` +
      // 3: termina em alínea (com item opcional)
      `|(?:(?:${P_ITEM}${CONECTOR})?${P_ALINEA})` +
      // 4: apenas item
      `|(?:${P_ITEM})` +
      `)\\s+d(?:este|esta|o\\s+presente|a\\s+presente)\\s+(artigo|par[aá]grafo|cap[ií]tulo|se[çc][aã]o|subse[çc][aã]o|t[ií]tulo|livro|parte)`,
    'gi'
  );

  let match: RegExpExecArray | null;
  regexContextual.lastIndex = 0;

  while ((match = regexContextual.exec(texto)) !== null) {
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
          resultado.push({ texto: textoCompleto, dispositivoDestino: caput });
        }
      }
      continue;
    }

    // Sintetiza a referência absoluta e delega ao parser (ex: "§ 2º" + art3 → "§ 2º do art. 3")
    const textSintetizado = construirSinteseAteArtigo(prefixText, ancestor);
    if (!textSintetizado) continue;

    const parser = new ReferenciaDispositivoParser(textSintetizado);
    if (!parser.valido || parser.referencias.length === 0) continue;

    const dispositivoDestino = buscarDispositivoPorReferencia(articulacao, parser.referencias);
    if (dispositivoDestino) {
      resultado.push({ texto: textoCompleto, dispositivoDestino });
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

const gerarId = (): string => {
  return 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
