import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getEvento } from '../evento/eventosUtil';
import { buildFuture } from '../util/stateReducerUtil';
import { incluir, processaRenumerados, processarModificados, processaValidados, remover, restaurarSituacao } from '../util/undoRedoReducerUtil';

export const undo = (state: any): State => {
  if (state.past === undefined || state.past.length === 0) {
    state.ui = [];
    return state;
  }

  const eventos = state.past.pop();

  const retorno: State = {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: [],
    future: buildFuture(state, eventos),
    ui: {
      events: [],
    },
  };

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoRemovido), getEvento(events.eventos, StateType.ElementoIncluido)));
  events.add(
    StateType.ElementoRestaurado,
    restaurarSituacao(state, getEvento(eventos, StateType.ElementoSuprimido), getEvento(events.eventos, StateType.ElementoRestaurado), DispositivoOriginal)
  );
  events.add(StateType.ElementoModificado, processarModificados(state, getEvento(eventos, StateType.ElementoModificado)));
  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  const elementosParaMarcar = getEvento(eventos, StateType.ElementoMarcado)?.elementos;
  if (elementosParaMarcar) {
    events.add(StateType.ElementoMarcado, [elementosParaMarcar[1], elementosParaMarcar[0]]);
    events.add(StateType.ElementoSelecionado, [elementosParaMarcar[1]]);
  }

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};
