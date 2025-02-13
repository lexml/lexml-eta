import { isRevisaoDeModificacao, isRevisaoDeTransformacao, mergeEventosStatesAposAceitarOuRejeitarMultiplasRevisoes } from './../util/revisaoUtil';
import { isCaput } from './../../../model/dispositivo/tipo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento/elemento';
import {
  createElemento,
  createElementoValidado,
  criaListaElementosAfinsValidados,
  getDispositivoFromElemento,
  listaDispositivosRenumerados,
} from '../../../model/elemento/elementoUtil';
import { getDispositivoAnteriorNaSequenciaDeLeitura, getUltimoFilho, isAdicionado } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { getElementosRemovidosEIncluidos, unificarEvento } from '../evento/eventosUtil';
import { getElementosAlteracaoASeremAtualizados } from '../util/reducerUtil';
import {
  findRevisaoByElementoUuid,
  findRevisaoDeExclusaoComElementoAnteriorApontandoPara,
  findUltimaRevisaoDoGrupo,
  getRevisoesElementoAssociadas,
  isRevisaoDeMovimentacao,
  isRevisaoPrincipal,
} from '../util/revisaoUtil';
import { buildPast } from '../util/stateReducerUtil';
import { ajustarAtributosAgrupadorIncluidoPorUndoRedo, ajustarHierarquivoAgrupadorIncluidoPorUndoRedo, incluir } from '../util/undoRedoReducerUtil';
import { agrupaElemento } from './agrupaElemento';
import { atualizaTextoElemento } from './atualizaTextoElemento';
import { removeElemento } from './removeElemento';
import { restauraElemento } from './restauraElemento';
import { suprimeElemento } from './suprimeElemento';

export const rejeitaRevisao = (state: any, action: any): State => {
  if (action.revisao || action.elemento) {
    return rejeitarRevisao(state, action);
  } else {
    return rejeitarRevisaoEmLote(state, state.revisoes);
  }
};

export const rejeitarRevisaoEmLote = (state: State, revisoes: Revisao[] = []): State => {
  const tempStates: State[] = [];
  revisoes.filter(isRevisaoPrincipal).forEach((revisao: Revisao) => {
    const tempState = { ...state, past: [], present: [], future: [], ui: { ...state.ui, events: [] } };
    tempStates.push(rejeitarRevisao(tempState, { revisao }));
  });
  const tempState = mergeEventosStatesAposAceitarOuRejeitarMultiplasRevisoes(state, tempStates, revisoes, 'rejeitar');
  tempState.revisoes = state.revisoes?.filter(r => !isRevisaoPrincipal(r));
  return tempState;
};

export const rejeitarRevisao = (state: any, action: any): State => {
  const revisao = (action.revisao || findRevisaoByElementoUuid(state.revisoes, action.elemento.uuid)) as RevisaoElemento;
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const idsRevisoesAssociadas = revisoesAssociadas.map(r => r.id);

  const elementos = revisoesAssociadas.map(r => {
    r.elementoAposRevisao.revisao = JSON.parse(JSON.stringify(r));
    return r.elementoAposRevisao as Elemento;
  });

  const eventos: StateEvent[] = [{ stateType: StateType.RevisaoRejeitada, elementos }];

  if (isRevisaoDeMovimentacao(revisao) || isRevisaoDeTransformacao(revisao)) {
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
  }

  const tempState = { ...state, past: [] };

  eventos.push(...processaRevisoes(tempState, revisoesAssociadas.filter(isRevisaoPrincipal)));
  const eventosPast = isRevisaoDeModificacao(revisao) ? montarEventosDeModificacaoParaHistorico(eventos, revisao, state) : eventos;

  return {
    ...state,
    past: buildPast(state, eventosPast),
    present: eventos,
    future: [],
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
    revisoes: state.revisoes?.filter((r: Revisao) => !idsRevisoesAssociadas.includes(r.id)),
  };
};

const montarEventosDeModificacaoParaHistorico = (eventos: StateEvent[], revisao: RevisaoElemento, state: State): StateEvent[] => {
  // O PASSADO de evento de modificação (StateType.ElementoModificado) deve possuir 2 itens no array elemento:
  // Item 0: valor a ser retornado para a articulação em caso de UNDO
  // Item 1: valor a ser retornado para a articulação em caso de REDO
  const eventosPast = eventos.filter(ev => ev.stateType !== StateType.ElementoModificado) as StateEvent[];
  const dispositivo = getDispositivoFromElemento(state.articulacao!, revisao.elementoAposRevisao)!;
  eventosPast.push({ stateType: StateType.ElementoModificado, elementos: [revisao.elementoAposRevisao! as Elemento, revisao.elementoAntesRevisao as Elemento] });
  eventosPast.push({ stateType: StateType.ElementoValidado, elementos: criaListaElementosAfinsValidados(dispositivo, true) });
  return eventosPast;
};

const processaRevisoes = (state: State, revisoes: RevisaoElemento[]): StateEvent[] => {
  const eventos: StateEvent[] = [];

  revisoes.forEach(r => {
    r.stateType === StateType.ElementoSuprimido && eventos.push(...rejeitaSupressao(state, r));
    r.stateType === StateType.ElementoModificado && eventos.push(...rejeitaModificacao(state, r));
    r.stateType === StateType.ElementoRestaurado && eventos.push(...rejeitaRestauracao(state, r));
    r.stateType === StateType.ElementoIncluido && eventos.push(...rejeitaInclusao(state, r));
    r.stateType === StateType.ElementoRemovido && eventos.push(...rejeitaExclusao(state, r));
  });

  return unificarEvento(state, eventos, StateType.ElementoRenumerado);
};

const rejeitaSupressao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  return restauraElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
};

const rejeitaModificacao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  return atualizaTextoElemento(state, { atual: revisao.elementoAntesRevisao }).ui?.events || [];
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
  const dispositivoASerRemovido = getDispositivoFromElemento(state.articulacao!, revisao.elementoAposRevisao)!;
  const dispositivoAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(dispositivoASerRemovido, d => !isCaput(d));

  const result = removeElemento(state, { atual: revisao.elementoAposRevisao, isRejeitandoRevisao: true }).ui?.events || [];

  // Se existe elemento antes da revisão, então reinclui elemento (havia sido excluído por se tratar de uma movimentação)
  if (revisao.elementoAntesRevisao) {
    result.push(...rejeitaExclusao(state, revisao));
  }

  const ultimaRevisaoDoGrupo = findUltimaRevisaoDoGrupo(state.revisoes, revisao);
  const rAux2 = findRevisaoDeExclusaoComElementoAnteriorApontandoPara(state.revisoes, ultimaRevisaoDoGrupo.elementoAposRevisao);

  if (rAux2) {
    const e = dispositivoAnterior ? createElemento(dispositivoAnterior) : undefined;
    rAux2.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura = e ? JSON.parse(JSON.stringify(e)) : undefined;
    rAux2.elementoAntesRevisao!.elementoAnteriorNaSequenciaDeLeitura = e ? JSON.parse(JSON.stringify(e)) : undefined;
  }

  return result;
};

const rejeitaExclusao = (state: State, revisao: RevisaoElemento): StateEvent[] => {
  const revisoesAssociadas = getRevisoesElementoAssociadas(state.revisoes, revisao);
  const evento: StateEvent = { stateType: StateType.ElementoRemovido, elementos: revisoesAssociadas.map(r => r.elementoAntesRevisao as Elemento) };
  const eventoAux: StateEvent = { stateType: StateType.ElementoIncluido, elementos: [] };

  const result: StateEvent[] = [];

  const elementoASerIncluido = revisao.elementoAntesRevisao ?? revisao.elementoAposRevisao;

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

    const ev: StateEvent = { stateType: StateType.SituacaoElementoModificada, elementos: [elementoASerIncluido as Elemento] };
    ajustarAtributosAgrupadorIncluidoPorUndoRedo(state.articulacao!, [ev], tempState.ui!.events);
    ajustarHierarquivoAgrupadorIncluidoPorUndoRedo(state.articulacao!, [ev], tempState.ui!.events);

    // Atualiza elemento que seja agrupador de artigo em alteração de norma em eventos de inclusão
    // Isso é necessário porque a rejeição da exclusão desse tipo de dispositivo pode ter alterado a hierarquia
    tempState
      .ui!.events!.filter(ev => ev.stateType === StateType.ElementoIncluido)
      .forEach(ev => {
        ev.elementos = ev.elementos?.map(e => {
          if (e.agrupador && e.dispositivoAlteracao) {
            const d = getDispositivoFromElemento(tempState.articulacao!, e)!;
            return createElemento(d);
          } else {
            return e;
          }
        });
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

    // // Atualiza posição
    // if (isAtualizarPosicaoDeElementoExcluido(primeiroElementoReincluido, revisaoASerAtualizada.elementoAposRevisao)) {
    //   revisaoASerAtualizada.elementoAposRevisao.hierarquia!.posicao = primeiroElementoReincluido.hierarquia!.posicao! + 1;
    //   revisaoASerAtualizada.elementoAntesRevisao!.hierarquia!.posicao = primeiroElementoReincluido.hierarquia!.posicao! + 1;
    // }
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
