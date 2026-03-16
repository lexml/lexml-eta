import { getDispositivoFromElemento, createElemento } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ReferenciaDispositivoParser } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { Articulacao, Dispositivo, Artigo } from '../../../model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../model/remissao';
import { converteNumeroArabicoParaRomano, converteNumeroArabicoParaLetra } from '../../../model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';

export const adicionaRemissaoInterna = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  const textoAtual = dispositivo?.texto;

  if (!dispositivo || !textoAtual) {
    state.ui.events = [];
    return state;
  }

  const remissoesEncontradas = detectarReferencias(textoAtual);

  if (remissoesEncontradas.length === 0) {
    state.ui.events = [];
    return state;
  }

  const remissoesParaCriar: { textoRef: string; dispositivoDestino: Dispositivo }[] = [];

  for (const ref of remissoesEncontradas) {
    const dispositivoDestino = buscarDispositivoPorReferencia(state.articulacao, ref.referencias);
    if (dispositivoDestino) {
      remissoesParaCriar.push({
        textoRef: ref.texto,
        dispositivoDestino,
      });
    }
  }

  if (remissoesParaCriar.length === 0) {
    state.ui.events = [];
    return state;
  }

  const novasRemissoes: RemissaoInternaValue[] = remissoesParaCriar.map(item => ({
    refId: gerarId(),
    targetLexmlId: item.dispositivoDestino.id,
    targetUuid: item.dispositivoDestino.uuid,
    targetRotulo: item.dispositivoDestino.rotulo,
    sourceUuid: dispositivo.uuid,
    sourceLexmlId: dispositivo.id,
    textoRef: item.textoRef,
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

interface ReferenciaEncontrada {
  texto: string;
  referencias: any[];
}

const detectarReferencias = (texto: string): ReferenciaEncontrada[] => {
  const referenciasEncontradas: ReferenciaEncontrada[] = [];

  // Padrões por nível - do mais específico para a remissão
  const P_ARTIGO = `(?:art\\.?\\s*|artigo\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
  const P_PARAGRAFO = `(?:§\\s*|par[aá]grafo\\s+|par\\.?\\s*)(?:[uú]nico|\\d+(?:-[a-z]+)?)(?:[º°])?`;
  const P_INCISO = `(?:inc\\.?\\s*|inciso\\s+)(?:[uú]nico|[MDCLXVI]+(?:-[a-z]+)?)`;
  const P_ALINEA = `(?:al[ií]\\.?\\s*|al[ií]nea\\s+)(?:[a-z]+(?:-[a-z]+)?)`;
  const P_ITEM = `(?:item\\s+)(?:[uú]nico|\\d+(?:-[a-z]+)?)`;
  const CONECTOR = `\\s+d[ao]\\s+`;

  // Regex composta: : "inciso II do § 2º do art. 16". (nível intermediário é opcional; artigo é obrigatório para evitar double match
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
      referenciasEncontradas.push({
        texto: textoReferencia,
        referencias: parser.referencias,
      });
    }
  }

  return referenciasEncontradas;
};

const buscarDispositivoPorReferencia = (articulacao: Articulacao | undefined, referencias: any[]): Dispositivo | null => {
  if (!articulacao) return null;

  let dispositivoAtual: Dispositivo | null = null;
  const refs = [...referencias].reverse(); // Inverter para processar do artigo até o nível mais baixo

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
    // Verificar se é artigo único
    if (numero && numero.toLowerCase() === 'único' && artigo.numero === '1') {
      return artigo;
    }
  }

  return null;
};

// Converte arábico para nativo (inciso: '2'→'ii', alínea: '1'→'a') para permitir comparação no ReferenciaDispositivoParser.
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
