import { agrupaElemento } from './agrupaElemento';
import { removeElemento } from './removeElemento';
import {
  ajustarAtributosAgrupadorIncluidoPorUndoRedo,
  isUndoRedoInclusaoExclusaoAgrupador,
  processaSituacoesAlteradas,
  processarRestaurados,
  processarSuprimidos,
} from './../util/undoRedoReducerUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getElementosRemovidosEIncluidos, getEvento } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { buildFuture } from '../util/stateReducerUtil';
import { incluir, processaRenumerados, processarModificados, processaValidados, remover } from '../util/undoRedoReducerUtil';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { getElementosFromRevisoes } from '../util/revisaoUtil';

export const undo = (state: any): State => {
  if (state.past === undefined || state.past.length === 0) {
    state.ui.events = [];
    return state;
  }

  const eventos = state.past.pop();
  const future = buildFuture(state, eventos);

  const retorno: State = {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: [],
    future,
    ui: {
      events: [],
      alertas: state.ui?.alertas,
    },
    emRevisao: state.emRevisao,
    usuario: state.usuario,
    revisoes: state.revisoes,
    numEventosPassadosAntesDaRevisao: state.numEventosPassadosAntesDaRevisao,
  };

  if (isUndoRedoInclusaoExclusaoAgrupador(eventos)) {
    let tempState: State;
    tempState = { ...retorno };
    tempState.past = [];
    tempState.present = [];
    tempState.future = [];

    if (eventos[0].stateType === StateType.ElementoIncluido) {
      tempState = removeElemento(tempState, { atual: eventos[0].elementos[0] });
    } else {
      const ref = eventos.find((ev: StateEvent) => ev.stateType === StateType.ElementoReferenciado)!.elementos[0];
      const elementoASerIncluido = eventos[0].elementos[0];
      tempState = agrupaElemento(tempState, {
        atual: ref,
        novo: { tipo: elementoASerIncluido.tipo, uuid: elementoASerIncluido.uuid, posicao: 'antes', manterNoMesmoGrupoDeAspas: elementoASerIncluido.manterNoMesmoGrupoDeAspas },
      });
      ajustarAtributosAgrupadorIncluidoPorUndoRedo(state.articulacao, eventos, tempState.ui!.events);
    }

    retorno.present = tempState.ui!.events;
    retorno.ui!.events = tempState.ui!.events;
    return retorno;
  }

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoRemovido), getEvento(events.eventos, StateType.ElementoIncluido)));

  eventos.filter((ev: StateEvent) => ev.stateType === StateType.ElementoSuprimido).forEach((ev: StateEvent) => events.eventos.push(...processarSuprimidos(state, ev)));

  eventos.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRestaurado).forEach((ev: StateEvent) => events.eventos.push(processarRestaurados(state, ev, 'UNDO')));

  eventos
    .filter((ev: StateEvent) => ev.stateType === StateType.ElementoModificado)
    .forEach((ev: StateEvent) => events.eventos.push({ stateType: StateType.ElementoModificado, elementos: processarModificados(state, ev) }));

  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  const incluidos = events.get(StateType.ElementoIncluido);
  const primeiroElementoIncluidoEhAgrupador = !incluidos.elementos || !incluidos.elementos.length ? false : incluidos.elementos[0].agrupador;
  if (primeiroElementoIncluidoEhAgrupador) {
    events.add(StateType.ElementoMarcado, [incluidos.elementos![0]]);
    events.add(StateType.ElementoSelecionado, [incluidos.elementos![0]]);
  } else {
    const elementosParaMarcar = getEvento(eventos, StateType.ElementoMarcado)?.elementos?.filter(e => getDispositivoFromElemento(state.articulacao, e, true));
    if (elementosParaMarcar) {
      events.add(StateType.ElementoMarcado, [elementosParaMarcar[1], elementosParaMarcar[0]].filter(Boolean));
      events.add(StateType.ElementoSelecionado, [elementosParaMarcar[1]].filter(Boolean));
    }
  }

  events.add(StateType.SituacaoElementoModificada, getElementosAlteracaoASeremAtualizados(state.articulacao, getElementosRemovidosEIncluidos(events.eventos)));
  events.eventos.push({ stateType: StateType.SituacaoElementoModificada, elementos: processaSituacoesAlteradas(state, eventos) });

  const eventosRevisaoAceita = eventos.filter((se: StateEvent) => se.stateType === StateType.RevisaoAceita);
  if (eventosRevisaoAceita.length) {
    eventosRevisaoAceita.forEach((ev: StateEvent) => {
      const revisoes = ev.elementos!.map(e => e.revisao!);
      retorno.revisoes!.push(...revisoes);
      events.eventos.push({ stateType: StateType.SituacaoElementoModificada, elementos: getElementosFromRevisoes(revisoes, state) });
    });
    //TODO: criar eventos de ElementoIncluido para exibir os elementos que foram excluídos na revisão
  }

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};
