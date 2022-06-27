import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildPast } from '../util/stateReducerUtil';

export const suprimeAgrupador = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || dispositivo.situacao?.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
    state.ui = [];
    return state;
  }

  dispositivo.situacao = new DispositivoSuprimido(createElemento(dispositivo));
  const eventos = new Eventos();

  eventos.add(StateType.ElementoSuprimido, [createElemento(dispositivo)]);

  const events = eventos.build();

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
    },
  };
};
