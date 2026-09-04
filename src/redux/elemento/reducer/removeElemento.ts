import { createElemento } from './../../../model/elemento/elementoUtil';
import { StateType } from './../../state';
import {
  getDispositivoPosterior,
  getDispositivoAnterior,
  getPrimeiroAgrupadorNaArticulacao,
  hasEmenta,
  getImpedimentoParaRemoverAgrupador,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador, isEmenta } from '../../../model/dispositivo/tipo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RemoverElemento } from '../../../model/lexml/acao/removerElementoAction';
import { hasFilhos, isArtigoUnico, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { removeAgrupadorAndBuildEvents, removeAndBuildEvents } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { existeFilhoExcluidoOuAlteradoDuranteRevisao, findRevisaoByElementoUuid2, isRevisaoDeMovimentacao, isRevisaoPrincipal } from '../util/revisaoUtil';

export const removeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  const impedimentoRemocaoAgrupador = getImpedimentoParaRemoverAgrupador(dispositivo);
  if (impedimentoRemocaoAgrupador) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: impedimentoRemocaoAgrupador });
  }

  if (isEmenta(dispositivo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir a ementa.' });
  }

  if (!isAcaoPermitida(dispositivo, RemoverElemento)) {
    return !isEmenta(dispositivo) ? retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir este dispositivo.' }) : state;
  }

  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigoUnico(dispositivo) || (state.articulacao.filhos.length === 1 && state.articulacao.filhos[0] === dispositivo && !hasFilhos(dispositivo)))
  ) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir o único dispositivo disponível.' });
  }

  if (state.emRevisao && existeFilhoExcluidoOuAlteradoDuranteRevisao(state, dispositivo) && !action.isRejeitandoRevisao) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.',
    });
  }

  const revisao = findRevisaoByElementoUuid2(state.revisoes, dispositivo.uuid2);
  if (state.emRevisao && revisao && isRevisaoPrincipal(revisao) && isRevisaoDeMovimentacao(revisao) && !action.isRejeitandoRevisao) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Não é possível remover dispositivo movido em modo de revisão.',
    });
  }

  const primeiroFilhoDoAgrupador = isAgrupador(dispositivo) ? dispositivo.filhos[0] || getDispositivoPosterior(dispositivo) || getDispositivoAnterior(dispositivo) : undefined;
  const elPrimeiroFilhoDoAgrupador = primeiroFilhoDoAgrupador ? createElemento(primeiroFilhoDoAgrupador) : undefined;
  const isAtualizarElementoEmenta = hasEmenta(dispositivo) && dispositivo === getPrimeiroAgrupadorNaArticulacao(dispositivo);

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state, dispositivo);

  if (elPrimeiroFilhoDoAgrupador) {
    events.push({ stateType: StateType.ElementoMarcado, elementos: [elPrimeiroFilhoDoAgrupador] });
    events.push({ stateType: StateType.ElementoReferenciado, elementos: [elPrimeiroFilhoDoAgrupador] });
  }

  if (isAtualizarElementoEmenta) {
    events.push({ stateType: StateType.SituacaoElementoModificada, elementos: [createElemento(state.articulacao.projetoNorma.ementa)] });
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
  };
};
