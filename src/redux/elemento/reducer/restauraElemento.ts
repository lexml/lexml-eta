import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State } from '../../state';
import { restauraAndBuildEvents } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';

export const restauraElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_MODIFICADO && dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
    return state;
  }

  const events = restauraAndBuildEvents(dispositivo);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
  };
};
