import { createElementoValidado, getDispositivoFromElemento } from './../../../model/elemento/elementoUtil';
import { Elemento } from '../../../model/elemento/elemento';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { findRevisaoByElementoUuid, getRevisoesElementoAssociadas } from '../util/revisaoUtil';
import { buildPast } from '../util/stateReducerUtil';

export const aceitaRevisao = (state: any, action: any): State => {
  const revisao = (action.revisao || findRevisaoByElementoUuid(state.revisoes, action.elemento.uuid)) as RevisaoElemento;
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const idsRevisoesAssociadas = revisoesAssociadas.map(r => r.id);

  const elementos = revisoesAssociadas.map(r => {
    const e = r.stateType === StateType.ElementoRemovido ? r.elementoAposRevisao : createElementoValidado(getDispositivoFromElemento(state.articulacao, r.elementoAposRevisao)!);
    e.revisao = JSON.parse(JSON.stringify(r));
    return e as Elemento;
  });

  const elementosValidados = elementos
    .map(e => getDispositivoFromElemento(state.articulacao, e))
    .filter(Boolean)
    .map(d => createElementoValidado(d!));

  const events: StateEvent[] = [{ stateType: StateType.RevisaoAceita, elementos }];

  if (elementosValidados.length) {
    events.push({ stateType: StateType.ElementoValidado, elementos: elementosValidados });
  }

  return {
    ...state,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
    revisoes: state.revisoes?.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id)),
  };
};
