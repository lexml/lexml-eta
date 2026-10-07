import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RenumerarElemento } from '../../../model/lexml/acao/renumerarElementoAction';
import { getDispositivoAndFilhosAsLista, isDispositivoAlteracao } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { updateIdDispositivoAndFilhos } from '../../../model/lexml/util/idUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
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

  const original = createElemento(dispositivo);

  try {
    const numero = ajustarNumero(dispositivo, action.novo?.numero);
    dispositivo.createNumeroFromRotulo(numero);
    updateIdDispositivoAndFilhos(dispositivo);
  } catch (error) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'O rótulo informado é inválido', detalhe: error });
  }

  dispositivo.createRotulo(dispositivo);

  // Os descendentes mudam de id com o ancestral; vão em Situação (e não em Modificado) para não gerar revisão de texto.
  const descendentes = getDispositivoAndFilhosAsLista(dispositivo)
    .slice(1)
    .map(d => createElemento(d));

  const eventosPast = buildUpdateEvent(dispositivo, original);
  descendentes.length && eventosPast.push({ stateType: StateType.SituacaoElementoModificada, elementos: descendentes });
  const past = buildPast(state, eventosPast);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  descendentes.length && eventos.add(StateType.SituacaoElementoModificada, descendentes);

  const builtEvents = eventos.build();

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past,
    present: builtEvents,
    future: state.future,
    ui: {
      events: builtEvents,
      alertas: state.ui?.alertas,
    },
  };
};
