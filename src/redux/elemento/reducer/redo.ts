import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getElementosRemovidosEIncluidos, getEvento } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';
import { incluir, processaRenumerados, processarModificados, processaSituacoesAlteradas, processaValidados, remover, restaurarSituacao } from '../util/undoRedoReducerUtil';

export const redo = (state: any): State => {
  if (state.future === undefined || state.future.length === 0) {
    state.ui.events = [];
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
      alertas: state.ui?.alertas,
    },
  };

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoRemovido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoIncluido), getEvento(events.eventos, StateType.ElementoIncluido)));

  eventos
    .filter((ev: StateEvent) => ev.stateType === StateType.ElementoModificado)
    .forEach((ev: StateEvent) => {
      events.eventos.push({
        stateType: StateType.ElementoModificado,
        elementos: processarModificados(state, ev, true),
      });
    });

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

  events.add(StateType.SituacaoElementoModificada, getElementosAlteracaoASeremAtualizados(state.articulacao, getElementosRemovidosEIncluidos(events.eventos)));
  events.eventos.push({
    stateType: StateType.SituacaoElementoModificada,
    elementos: processaSituacoesAlteradas(state, eventos),
  });

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};
