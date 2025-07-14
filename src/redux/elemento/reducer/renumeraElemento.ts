import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RenumerarElemento } from '../../../model/lexml/acao/renumerarElementoAction';
import { isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { buildId } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { formatarMilhares } from '../../../model/lexml/numeracao/numeracaoUtil';

const ajustarNumero = (dispositivo: Dispositivo, numero: string | undefined): string => {
  if (!numero) {
    return '';
  }

  if (dispositivo.tipo !== 'Alinea') {
    return numero.toUpperCase();
  }

  const partes = numero.split('-');
  return partes.map((parte, index) => (index === 0 ? formatarMilhares(parte) : parte.toUpperCase())).join('-');
};

export const renumeraElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, RenumerarElemento)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível renumerar o dispositivo' });
  }

  if (isDispositivoAlteracao(dispositivo) && ajustarNumero(dispositivo, action.novo?.numero)?.startsWith('0')) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não pode haver um dispositivo com esse rótulo em alteração de norma' });
  }

  const past = buildPast(state, buildUpdateEvent(dispositivo));

  try {
    const numero = ajustarNumero(dispositivo, action.novo?.numero);
    dispositivo.createNumeroFromRotulo(numero);
    dispositivo.id = buildId(dispositivo);
    if (dispositivo.tipo === 'Artigo') {
      (dispositivo as Artigo).caput!.id = buildId((dispositivo as Artigo).caput!);
    }
  } catch (error) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'O rótulo informado é inválido', detalhe: error });
  }

  dispositivo.createRotulo(dispositivo);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past,
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};
