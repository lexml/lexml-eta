import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento/elemento';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { getElementosRemovidosEIncluidos } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import { findRevisaoByElementoUuid, getRevisoesElementoAssociadas } from '../util/revisaoUtil';
import { buildPast } from '../util/stateReducerUtil';
import { incluir } from '../util/undoRedoReducerUtil';
import { atualizaTextoElemento } from './atualizaTextoElemento';
import { removeElemento } from './removeElemento';
import { restauraElemento } from './restauraElemento';
import { suprimeElemento } from './suprimeElemento';

export const rejeitaRevisao = (state: any, action: any): State => {
  const revisao = (action.revisao || findRevisaoByElementoUuid(state.revisoes, action.elemento.uuid)) as RevisaoElemento;
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const idsRevisoesAssociadas = revisoesAssociadas.map(r => r.id);

  const elementos = revisoesAssociadas.map(r => {
    r.elementoAposRevisao.revisao = JSON.parse(JSON.stringify(r));
    return r.elementoAposRevisao as Elemento;
  });

  const eventos: StateEvent[] = [{ stateType: StateType.RevisaoRejeitada, elementos }];

  const tempState = { ...state, past: [] };

  revisoesAssociadas
    .filter(r => !r.idRevisaoElementoPrincipal)
    .forEach(r => {
      r.stateType === StateType.ElementoSuprimido && eventos.push(...rejeitaSupressao(tempState, r));
      r.stateType === StateType.ElementoModificado && eventos.push(...rejeitaModificacao(tempState, r));
      r.stateType === StateType.ElementoRestaurado && eventos.push(...rejeitaRestauracao(tempState, r));
      r.stateType === StateType.ElementoIncluido && eventos.push(...rejeitaInclusao(tempState, r));
      r.stateType === StateType.ElementoRemovido && eventos.push(...rejeitaExclusao(tempState, r));
      // rejeitaMovimentacao(state, revisao);
    });

  return {
    ...state,
    past: buildPast(state, eventos),
    present: eventos,
    future: [],
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
    revisoes: state.revisoes?.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id)),
  };
};

const rejeitaSupressao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  return restauraElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
};

const rejeitaModificacao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  if (revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    return atualizaTextoElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
  } else {
    return restauraElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
  }
};

const rejeitaRestauracao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  if (revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
    return suprimeElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
  } else if (revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
    return atualizaTextoElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
  }
  return [];
};

const rejeitaInclusao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  // return removeElemento(state, { atual: revisao.elementoAposRevisao }).ui?.events || [];
  const result = removeElemento(state, { atual: revisao.elementoAposRevisao, isRejeitandoRevisao: true }).ui?.events || [];
  if (revisao.elementoAntesRevisao) {
    result.push(...rejeitaExclusao(state, revisao));
  }
  return result;
};

const rejeitaExclusao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const evento: StateEvent = { stateType: StateType.ElementoRemovido, elementos: revisoesAssociadas.map(r => r.elementoAntesRevisao as Elemento) };
  const eventoAux: StateEvent = { stateType: StateType.ElementoIncluido, elementos: [] };
  const result: StateEvent[] = [{ stateType: StateType.ElementoIncluido, elementos: incluir(state, evento, eventoAux) }];
  result.push({ stateType: StateType.SituacaoElementoModificada, elementos: getElementosAlteracaoASeremAtualizados(state.articulacao!, getElementosRemovidosEIncluidos(result)) });
  return result;
};
