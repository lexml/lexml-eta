import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State } from '../../state';
import { restauraAndBuildEvents } from '../evento/eventosUtil';
import { buildFuture, buildPast } from '../util/stateReducerUtil';

export const restauraElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (
    dispositivo === undefined ||
    (dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_MODIFICADO && dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO)
  ) {
    return state;
  }

  const events = restauraAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, events),
    present: events,
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};
