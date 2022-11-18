import { createElemento } from './../../../model/elemento/elementoUtil';
import { StateType } from './../../state';
import { getDispositivoPosterior, getDispositivoAnterior } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador } from '../../../model/dispositivo/tipo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RemoverElemento } from '../../../model/lexml/acao/removerElementoAction';
import { hasFilhos, isArtigoUnico, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { removeAgrupadorAndBuildEvents, removeAndBuildEvents } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const removeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, RemoverElemento)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir um dispositivo original mas apenas suprimi-lo.' });
  }

  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigoUnico(dispositivo) || (state.articulacao.filhos.length === 1 && state.articulacao.filhos[0] === dispositivo && !hasFilhos(dispositivo)))
  ) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir o único dispositivo disponível.' });
  }

  const primeiroFilhoDoAgrupador = isAgrupador(dispositivo) ? dispositivo.filhos[0] || getDispositivoPosterior(dispositivo) || getDispositivoAnterior(dispositivo) : undefined;

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state.articulacao, dispositivo);

  if (primeiroFilhoDoAgrupador) {
    events.push({ stateType: StateType.ElementoMarcado, elementos: [createElemento(primeiroFilhoDoAgrupador)] });
    events.push({ stateType: StateType.ElementoReferenciado, elementos: [createElemento(primeiroFilhoDoAgrupador)] });
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
