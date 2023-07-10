import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento/elemento';
import { createElemento, createElementoValidado, getDispositivoFromElemento, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { getUltimoFilho, isAdicionado } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { getElementosRemovidosEIncluidos, unificarEvento } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import {
  findRevisaoByElementoUuid,
  findRevisaoDeExclusaoComElementoAnteriorApontandoPara,
  findUltimaRevisaoDoGrupo,
  getRevisoesElementoAssociadas,
  isAtualizarPosicaoDeElementoExcluido,
  isRevisaoMovimentacao,
  isRevisaoPrincipal,
} from '../util/revisaoUtil';
import { buildPast } from '../util/stateReducerUtil';
import { incluir } from '../util/undoRedoReducerUtil';
import { agrupaElemento } from './agrupaElemento';
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

  if (isRevisaoMovimentacao(revisao)) {
    // Elementos com revisão de movimentação também podem ter revisão de exclusão (desde que não seja o elemento principal)
    // Nesse caso, a revisão de exclusão deve ser removida do state (não precisa ser rejeitada)
    const uuid2Elementos = elementos.map(e => e.uuid2);
    const outrasRevisoes = state.revisoes
      .filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id))
      .filter((r: Revisao) => uuid2Elementos.includes((r as RevisaoElemento).elementoAposRevisao.uuid2)) as RevisaoElemento[];
    idsRevisoesAssociadas.push(...outrasRevisoes.map(r => r.id));

    // Desfaz as ações feitas após a movimentação do dispositivo e que geraram revisões adicionais
    processaRevisoes(state, outrasRevisoes.filter(isRevisaoPrincipal));

    const elementosDeOutrasRevisoes = outrasRevisoes.map(r => {
      r.elementoAposRevisao.revisao = JSON.parse(JSON.stringify(r));
      return r.elementoAposRevisao as Elemento;
    });

    eventos.push({ stateType: StateType.RevisaoAdicionalRejeitada, elementos: elementosDeOutrasRevisoes });

    // eventos[0].elementos!.push(...elementosDeOutrasRevisoes);
  }

  const tempState = { ...state, past: [] };

  eventos.push(...processaRevisoes(tempState, revisoesAssociadas.filter(isRevisaoPrincipal)));

  return {
    ...state,
    past: buildPast(state, eventos),
    present: eventos,
    future: [],
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
    // revisoes: state.revisoes?.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id) && !idsOutrasRevisoes.includes(r.id)),
    revisoes: state.revisoes?.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id)),
  };
};

const processaRevisoes = (state: State, revisoes: RevisaoElemento[]): StateEvent[] => {
  const eventos: StateEvent[] = [];
  revisoes.forEach(r => {
    r.stateType === StateType.ElementoSuprimido && eventos.push(...rejeitaSupressao(state, r));
    r.stateType === StateType.ElementoModificado && eventos.push(...rejeitaModificacao(state, r));
    r.stateType === StateType.ElementoRestaurado && eventos.push(...rejeitaRestauracao(state, r));
    r.stateType === StateType.ElementoIncluido && eventos.push(...rejeitaInclusao(state, r));
    r.stateType === StateType.ElementoRemovido && eventos.push(...rejeitaExclusao(state, r));
    // rejeitaMovimentacao(state, revisao);
  });

  return unificarEvento(state, eventos, StateType.ElementoRenumerado);
};

const rejeitaSupressao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  return restauraElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
};

const rejeitaModificacao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  if (
    revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ||
    revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO
  ) {
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
  const result = removeElemento(state, { atual: revisao.elementoAposRevisao, isRejeitandoRevisao: true }).ui?.events || [];

  // Se existe elemento antes da revisão, então reinclui elemento (havia sido excluído por se tratar de uma movimentação)
  if (revisao.elementoAntesRevisao) {
    result.push(...rejeitaExclusao(state, revisao));
  }

  const ultimaRevisaoDoGrupo = findUltimaRevisaoDoGrupo(state.revisoes, revisao);
  const rAux2 = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(state.revisoes, ultimaRevisaoDoGrupo.elementoAposRevisao);

  if (rAux2) {
    rAux2.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura));
    rAux2.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura));
  }

  return result;
};

const rejeitaExclusao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const evento: StateEvent = { stateType: StateType.ElementoRemovido, elementos: revisoesAssociadas.map(r => r.elementoAntesRevisao as Elemento) };
  const eventoAux: StateEvent = { stateType: StateType.ElementoIncluido, elementos: [] };

  const result: StateEvent[] = [];

  const elementoASerIncluido = revisao.elementoAposRevisao;

  if (elementoASerIncluido.agrupador) {
    let tempState: State = { ...state, past: [], present: [], future: [], ui: { events: [] } };
    tempState = agrupaElemento(tempState, {
      atual: elementoASerIncluido.elementoAnteriorNaSequenciaDeLeitura,
      novo: {
        tipo: elementoASerIncluido.tipo,
        uuid: elementoASerIncluido.uuid,
        posicao: 'depois',
        manterNoMesmoGrupoDeAspas: elementoASerIncluido.manterNoMesmoGrupoDeAspas,
      },
    });

    result.push(...tempState.ui!.events!);
  } else {
    result.push({ stateType: StateType.ElementoIncluido, elementos: incluir(state, evento, eventoAux) });
  }

  atualizaReferenciaElementoAnteriorEmRevisoesDeExclusaoAposRejeicao(state, revisao, result[0].elementos![0]);

  const dispositivosRenumerados = listaDispositivosRenumerados(getDispositivoFromElemento(state.articulacao!, result[0].elementos![0])!).filter(isAdicionado);
  result.push({ stateType: StateType.ElementoRenumerado, elementos: dispositivosRenumerados.map(d => createElemento(d)) });

  result.push({ stateType: StateType.SituacaoElementoModificada, elementos: getElementosAlteracaoASeremAtualizados(state.articulacao!, getElementosRemovidosEIncluidos(result)) });
  result.push({ stateType: StateType.ElementoValidado, elementos: montarListaElementosValidados(state, result) });

  return result.filter(ev => ev.elementos?.length);
};

const atualizaReferenciaElementoAnteriorEmRevisoesDeExclusaoAposRejeicao = (state: State, revisao: RevisaoElemento, primeiroElementoReincluido: Elemento): void => {
  // Atualizar referência
  const dUltimoFilho = getUltimoFilho(getDispositivoFromElemento(state.articulacao!, primeiroElementoReincluido)!);
  const eUltimoFilho = createElemento(dUltimoFilho, false, true);
  const revisaoASerAtualizada = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(
    state.revisoes?.filter(r => r.id !== revisao.id),
    eUltimoFilho
  );

  if (revisaoASerAtualizada && revisaoASerAtualizada.id !== revisao.id) {
    // Atualiza referência
    revisaoASerAtualizada.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(eUltimoFilho));
    revisaoASerAtualizada.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = JSON.parse(JSON.stringify(eUltimoFilho));

    // Atualiza posição
    if (isAtualizarPosicaoDeElementoExcluido(primeiroElementoReincluido, revisaoASerAtualizada.elementoAposRevisao)) {
      revisaoASerAtualizada.elementoAposRevisao.hierarquia!.posicao = primeiroElementoReincluido.hierarquia!.posicao! + 1;
      revisaoASerAtualizada.elementoAntesRevisao!.hierarquia!.posicao = primeiroElementoReincluido.hierarquia!.posicao! + 1;
    }
  }
};

const montarListaElementosValidados = (state: State, result: StateEvent[]): Elemento[] => {
  return result
    .filter(ev => ev.stateType === StateType.ElementoIncluido)
    .map(ev => ev.elementos || [])
    .flat()
    .map(e => getDispositivoFromElemento(state.articulacao!, e)!)
    .map(d => createElementoValidado(d));
};
