import { isAgrupador } from '../../../model/dispositivo/tipo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RemoverElemento } from '../../../model/lexml/acao/removerElementoAction';
import { hasFilhos, isArtigoUnico, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { removeAgrupadorAndBuildEvents, removeAndBuildEvents } from '../evento/eventosUtil';
import { buildFuture, buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const removeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
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

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, events),
    present: events,
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};
