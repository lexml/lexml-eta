import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State } from '../../state';
import { suprimeAndBuildEvents } from '../evento/eventosUtil';
import { buildFuture, buildPast } from '../util/stateReducerUtil';

export const suprimeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  const events = suprimeAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    past: buildPast(state, events),
    present: events,
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};
