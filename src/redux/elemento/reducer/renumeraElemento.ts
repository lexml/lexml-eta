import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RenumerarElemento } from '../../../model/lexml/acao/renumerarElementoAction';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const renumeraElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  if (!isAcaoPermitida(dispositivo, RenumerarElemento)) {
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
    tipoDocumento: state.tipoDocumento,
    past,
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};
