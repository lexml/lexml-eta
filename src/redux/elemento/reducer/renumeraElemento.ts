import { getDispositivoFromElemento } from '../../../model/elemento/elemento-util';
import { acoesPossiveis } from '../../../model/lexml/acoes/acoes-possiveis';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { RenumerarElemento } from '../action/elementoActions';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../util/eventosReducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const renumeraElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  if (acoesPossiveis(dispositivo).filter(a => a instanceof RenumerarElemento).length === 0) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível renumerar o dispositivo' });
  }

  const past = buildPast(state, buildUpdateEvent(dispositivo));

  try {
    dispositivo.createNumeroFromRotulo(action.novo?.numero);
  } catch (error) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'O rótulo informado é inválido', detalhe: error });
  }

  dispositivo.createRotulo(dispositivo);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    past,
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
