import { getDispositivoCabecaAlteracao } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { AtualizarNotaAlteracao } from './../../../model/lexml/acao/atualizarNotaAlteracaoAction';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State, StateEvent, StateType } from '../../state';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';

export const atualizaNotaAlteracao = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, AtualizarNotaAlteracao)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível alterar esse dado do dispositivo' });
  }

  const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);

  if (cabecaAlteracao === undefined) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível alterar esse dado do dispositivo' });
  }

  if (cabecaAlteracao.notaAlteracao === action.notaAlteracao) {
    state.ui.events = [];
    return state;
  }

  const original = createElemento(dispositivo);
  cabecaAlteracao.notaAlteracao = action.notaAlteracao;
  const alterado = createElemento(dispositivo);

  const eventos: StateEvent[] = [];
  eventos.push({
    stateType: StateType.ElementoModificado,
    elementos: [original, alterado],
  });

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos),
    present: eventos,
    future: [],
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
  };
};
