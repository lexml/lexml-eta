import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { State, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getEvento } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';
import {
  incluir,
  processaRenumerados,
  processarModificados,
  processaValidados,
  remover,
  restaurarSituacao,
  getElementosAlteracaoASeremAtualizados,
} from '../util/undoRedoReducerUtil';

export const redo = (state: any): State => {
  if (state.future === undefined || state.future.length === 0) {
    state.ui = [];
    return state;
  }

  const eventos = state.future.pop();

  const retorno: State = {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos),
    present: [],
    future: state.future,
    ui: {
      events: [],
    },
  };

  const stateEvent = getEvento(eventos, StateType.ElementoRemovido);
  const primeiroDispositivoASerRemovido = stateEvent?.elementos?.length ? getDispositivoFromElemento(state.articulacao, stateEvent.elementos[0]) : undefined;
  const paiDoPrimeiroDispositivoASerRemovido = primeiroDispositivoASerRemovido?.pai;
  // const primeiroDispositivoASerRemovidoEhCabecaAlteracao = primeiroDispositivoASerRemovido ? isDispositivoCabecaAlteracao(primeiroDispositivoASerRemovido) : false;

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoRemovido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoIncluido), getEvento(events.eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoModificado, processarModificados(state, getEvento(eventos, StateType.ElementoModificado), true));
  events.add(
    StateType.ElementoSuprimido,
    restaurarSituacao(state, getEvento(eventos, StateType.ElementoSuprimido), getEvento(events.eventos, StateType.ElementoSuprimido), DispositivoSuprimido)
  );
  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  const elementosParaMarcar = getEvento(eventos, StateType.ElementoMarcado)?.elementos;
  if (elementosParaMarcar) {
    events.add(StateType.ElementoMarcado, elementosParaMarcar);
    events.add(StateType.ElementoSelecionado, [elementosParaMarcar[0]]);
  }

  events.add(StateType.SituacaoElementoModificada, getElementosAlteracaoASeremAtualizados(state.articulacao, events, paiDoPrimeiroDispositivoASerRemovido));

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};
