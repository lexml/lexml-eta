import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isCaput } from '../../../model/dispositivo/tipo';

export const redirecionaRemissao = (state: any, action: any): State => {
  const uuid = action.uuid;

  if (uuid === undefined) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const dispositivo = getDispositivoFromElemento(state.articulacao, { uuid }, true);

  if (!dispositivo) {
    return { ...state, ui: { ...state.ui, events: [] } };
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
