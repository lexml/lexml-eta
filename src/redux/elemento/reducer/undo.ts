import { agrupaElemento } from './agrupaElemento';
import { removeElemento } from './removeElemento';
import {
  ajustarAtributosAgrupadorIncluidoPorUndoRedo,
  isUndoRedoInclusaoExclusaoAgrupador,
  processaSituacoesAlteradas,
  processarRestaurados,
  processarSuprimidos,
  processarRevisoesAceitasOuRejeitadas,
} from './../util/undoRedoReducerUtil';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { getElementosRemovidosEIncluidos, getEvento } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { buildFuture } from '../util/stateReducerUtil';
import { incluir, processaRenumerados, processarModificados, processaValidados, remover } from '../util/undoRedoReducerUtil';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { getRevisoesFromElementos } from '../util/revisaoUtil';

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

    const eventosFiltrados = eventos.filter((ev: StateEvent) => ![StateType.RevisaoAceita, StateType.RevisaoRejeitada, StateType.RevisaoAdicionalRejeitada].includes(ev.stateType));

    if (eventosFiltrados[0].stateType === StateType.ElementoIncluido) {
      tempState = removeElemento(tempState, { atual: eventosFiltrados[0].elementos[0] });
    } else {
      const ref = eventosFiltrados.find((ev: StateEvent) => ev.stateType === StateType.ElementoReferenciado)!.elementos[0];
      const elementoASerIncluido = eventosFiltrados[0].elementos[0];
      tempState = agrupaElemento(tempState, {
        atual: ref,
        novo: { tipo: elementoASerIncluido.tipo, uuid: elementoASerIncluido.uuid, posicao: 'antes', manterNoMesmoGrupoDeAspas: elementoASerIncluido.manterNoMesmoGrupoDeAspas },
      });
      ajustarAtributosAgrupadorIncluidoPorUndoRedo(state.articulacao, eventosFiltrados, tempState.ui!.events);
    }

    const eventosRevisao = [
      ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoAceita),
      ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoRejeitada),
      ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoAdicionalRejeitada),
    ].filter(ev => ev.elementos?.length);

    retorno.ui!.events = [...eventosRevisao, ...tempState.ui!.events];
    retorno.present = [...eventosRevisao, ...tempState.ui!.events];

    return retorno;
  }

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoRemovido), getEvento(events.eventos, StateType.ElementoIncluido)));

  eventos.filter((ev: StateEvent) => ev.stateType === StateType.ElementoSuprimido).forEach((ev: StateEvent) => events.eventos.push(...processarSuprimidos(state, ev)));

  eventos.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRestaurado).forEach((ev: StateEvent) => events.eventos.push(processarRestaurados(state, ev, 'UNDO')));

  const revisoesDeRejeicaoDeRestauracaoASeremRetornadas = getRevisoesFromElementos(
    eventos
      .filter((ev: StateEvent) => ev.stateType === StateType.RevisaoRejeitada)
      .map((ev: StateEvent) => ev.elementos || [])
      .flat()
  );

  eventos
    .filter((ev: StateEvent) => ev.stateType === StateType.ElementoModificado)
    .forEach((ev: StateEvent) =>
      events.eventos.push({ stateType: StateType.ElementoModificado, elementos: processarModificados(state, ev, false, revisoesDeRejeicaoDeRestauracaoASeremRetornadas) })
    );

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

  events.add(StateType.SituacaoElementoModificada, events.get(StateType.ElementoIncluido).elementos || []);
  events.add(StateType.SituacaoElementoModificada, getElementosAlteracaoASeremAtualizados(state.articulacao, getElementosRemovidosEIncluidos(events.eventos)));
  events.add(StateType.SituacaoElementoModificada, processaSituacoesAlteradas(state, eventos));

  const eventosRevisao = [
    ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoAceita),
    ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoRejeitada),
    ...processarRevisoesAceitasOuRejeitadas(retorno, eventos, StateType.RevisaoAdicionalRejeitada),
  ].filter(ev => ev.elementos?.length);

  retorno.ui!.events = [...eventosRevisao, ...events.build()];
  retorno.present = [...eventosRevisao, ...events.build()];

  return retorno;
};
