import { getDispositivoFromElemento, createElemento } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { ReferenciaDispositivoParser } from '../../../model/lexml/numeracao/parserReferenciaDispositivo';
import { Articulacao, Dispositivo, Artigo } from '../../../model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../model/remissao';

export const atualizaRemissaoInterna = (state: any, action: any): State => {
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
  const remissoesDoDispositivo = remissaoRegistry[dispositivo.uuid!] || [];
  remissaoRegistry[dispositivo.uuid!] = [...remissoesDoDispositivo, ...novasRemissoes];

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

  const padroes = [
    { regex: /(art\.?\s*|artigo\s+)([uú]nico|\d+(?:-[a-z]+)?)(?:º)?/gi, tipo: 'artigo' },
    { regex: /(§\s*|par[aá]grafo\s+|par\.?\s*)([uú]nico|\d+(?:-[a-z]+)?)(?:º)?/gi, tipo: 'paragrafo' },
    { regex: /(inc\.?\s*|inciso\s+)([uú]nico|[MDCLXVI]+(?:-[a-z]+)?)/gi, tipo: 'inciso' },
    { regex: /(al[ií]\.?\s*|al[ií]nea\s+)([a-z]+(?:-[a-z]+)?)/gi, tipo: 'alinea' },
    { regex: /(item\s+)([uú]nico|\d+(?:-[a-z]+)?)/gi, tipo: 'item' },
  ];

  for (const padrao of padroes) {
    let match;
    padrao.regex.lastIndex = 0;
    while ((match = padrao.regex.exec(texto)) !== null) {
      const textoReferencia = match[0];
      const parser = new ReferenciaDispositivoParser(textoReferencia);

      if (parser.valido && parser.referencias.length > 0) {
        referenciasEncontradas.push({
          texto: textoReferencia,
          referencias: parser.referencias,
        });
      }
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

const buscarFilhoPorTipoENumero = (dispositivo: Dispositivo, tipo: string, numero: string): Dispositivo | null => {
  if (!dispositivo) {
    return null;
  }

  const numeroNormalizado = normalizarNumero(numero);

  const artigo = dispositivo as Artigo;
  if (tipo === 'Inciso' && artigo?.caput) {
    const filhosCaput = artigo.caput.filhos || [];
    for (const filho of filhosCaput) {
      if (filho.tipo === tipo && normalizarNumero(filho.numero) === numeroNormalizado) {
        return filho;
      }
    }
  }

  const filhos = dispositivo.filhos || [];
  for (const filho of filhos) {
    if (filho.tipo === tipo && normalizarNumero(filho.numero) === numeroNormalizado) {
      return filho;
    }
  }

  if (tipo === 'Paragrafo' && numero && numero.toLowerCase() === 'único') {
    for (const filho of filhos) {
      if (filho.tipo === tipo) {
        return filho;
      }
    }
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
