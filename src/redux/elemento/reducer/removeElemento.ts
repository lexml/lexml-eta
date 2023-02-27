import { createElemento } from './../../../model/elemento/elementoUtil';
import { StateType } from './../../state';
import {
  getDispositivoPosterior,
  getDispositivoAnterior,
  getPrimeiroAgrupadorNaArticulacao,
  hasEmenta,
  getTiposAgrupadorArtigoPermitidosNaArticulacao,
} from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador, isArticulacao, isArtigo } from '../../../model/dispositivo/tipo';
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

  if (isAgrupador(dispositivo) && !isDispositivoAlteracao(dispositivo)) {
    // Só deixa remover agrupador se articulação permenecer consistente
    if (isArticulacao(dispositivo.pai!)) {
      const tipos = getTiposAgrupadorArtigoPermitidosNaArticulacao();
      if (!dispositivo.filhos.every(f => isArtigo(f) || tipos.includes(f.tipo))) {
        return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida' });
      }
    } else if (dispositivo.filhos.filter(f => !isArtigo(f)).length) {
      return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida' });
    }
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
  const elPrimeiroFilhoDoAgrupador = primeiroFilhoDoAgrupador ? createElemento(primeiroFilhoDoAgrupador) : undefined;
  const isAtualizarElementoEmenta = hasEmenta(dispositivo) && dispositivo === getPrimeiroAgrupadorNaArticulacao(dispositivo);

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state.articulacao, dispositivo);

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
