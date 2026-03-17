import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { isCaput } from '../../../model/dispositivo/tipo';

export const redirecionaRemissao = (state: any, action: any): State => {
  const uuid = action.uuid;

  if (uuid === undefined) {
    state.ui.events = [];
    return state;
  }

  const dispositivo = buscarDispositivoPorUuid(state.articulacao, uuid);

  if (!dispositivo) {
    state.ui.events = [];
    return state;
  }

  // Fix: Usa o artigo pai no getLinhaPorId, pois o caput não possui container DOM isolado.
  const dispositivoNavegacao = isCaput(dispositivo) && dispositivo.pai ? dispositivo.pai : dispositivo;

  const elemento = createElemento(dispositivoNavegacao, true);
  const eventosUi = new Eventos();

  eventosUi.add(StateType.RemissaoRedirecionar, [elemento]);
  eventosUi.add(StateType.ElementoSelecionado, [elemento]);

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
    remissoes: state.remissoes,
  };
};

const buscarDispositivoPorUuid = (articulacao: any, uuid: number): any => {
  if (!articulacao) return null;

  const buscarRecursivo = (dispositivo: any): any => {
    if (dispositivo.uuid === uuid) {
      return dispositivo;
    }

    if (dispositivo.filhos) {
      for (const filho of dispositivo.filhos) {
        const encontrado = buscarRecursivo(filho);
        if (encontrado) return encontrado;
      }
    }

    if (dispositivo.caput) {
      const encontradoCaput = buscarRecursivo(dispositivo.caput);
      if (encontradoCaput) return encontradoCaput;
    }

    if (dispositivo.artigos) {
      for (const artigo of dispositivo.artigos) {
        const encontrado = buscarRecursivo(artigo);
        if (encontrado) return encontrado;
      }
    }

    return null;
  };

  return buscarRecursivo(articulacao);
};
