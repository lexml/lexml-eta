import { isRevisaoPrincipal, mergeEventosStatesAposAceitarOuRejeitarMultiplasRevisoes } from './../util/revisaoUtil';
import { createElementoValidado, getDispositivoFromElemento } from './../../../model/elemento/elementoUtil';
import { Elemento } from '../../../model/elemento/elemento';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { findRevisaoByElementoUuid, getRevisoesElementoAssociadas, isRevisaoDeExclusao } from '../util/revisaoUtil';
import { buildPast } from '../util/stateReducerUtil';

export const aceitaRevisao = (state: any, action: any): State => {
  if (action.revisao || action.elemento) {
    return aceitarRevisao(state, action);
  } else {
    return aceitarRevisaoEmLote(state, state.revisoes);
  }
};

export const aceitarRevisaoEmLote = (state: State, revisoes: Revisao[] = []): State => {
  const tempStates: State[] = [];
  revisoes.filter(isRevisaoPrincipal).forEach((revisao: Revisao) => {
    const tempState = { ...state, past: [], present: [], future: [], ui: { ...state.ui, events: [] } };
    tempStates.push(aceitarRevisao(tempState, { revisao }));
  });

  return mergeEventosStatesAposAceitarOuRejeitarMultiplasRevisoes(state, tempStates, revisoes, 'aceitar');
};

const aceitarRevisao = (state: any, action: any): State => {
  const revisao = (action.revisao || findRevisaoByElementoUuid(state.revisoes, action.elemento.uuid)) as RevisaoElemento;
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const idsRevisoesAssociadas = revisoesAssociadas.map(r => r.id);

  const elementos = revisoesAssociadas.map(r => {
    const e = isRevisaoDeExclusao(r) ? r.elementoAposRevisao : createElementoValidado(getDispositivoFromElemento(state.articulacao, r.elementoAposRevisao)!);
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

  const revisoes = state.revisoes.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id));
  if (isRevisaoDeExclusao(revisao)) {
    // Se está aceitando uma revisão de exclusão, é preciso atualizar os elementos de outras revisões de exclusão que referenciam o elemento REALMENTE excluído durante a aceitação
    atualizaReferenciaElementoAnteriorEmRevisoesExclusaoAposAceitacao(revisoes, revisoesAssociadas);
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

const atualizaReferenciaElementoAnteriorEmRevisoesExclusaoAposAceitacao = (revisoes: Revisao[], revisoesAssociadas: RevisaoElemento[]): void => {
  const revisaoPrincipal = revisoesAssociadas[0];
  const ultimaRevisao = revisoesAssociadas[revisoesAssociadas.length - 1];

  const revisao = revisoes.find(r => (r as RevisaoElemento).elementoAposRevisao?.elementoAnteriorNaSequenciaDeLeitura?.uuid === ultimaRevisao.elementoAposRevisao.uuid);
  if (revisao) {
    (revisao as RevisaoElemento).elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = revisaoPrincipal.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura;
    (revisao as RevisaoElemento).elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = revisaoPrincipal.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura;
  }
};
