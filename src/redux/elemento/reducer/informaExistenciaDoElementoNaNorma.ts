import { StateEvent } from './../../state';
import { createElemento } from './../../../model/elemento/elementoUtil';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { InformarExistenciaDoElementoNaNorma } from '../../../model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { getDispositivoAndFilhosAsLista, isDispositivoNovoNaNormaAlterada } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { Mensagem, TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { validaNumeracao } from '../../../model/lexml/numeracao/numeracaoValidator';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';

export const informaExistenciaDoElementoNaNorma = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  if (!isAcaoPermitida(dispositivo, InformarExistenciaDoElementoNaNorma)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível alterar esse dado do dispositivo' });
  }

  const currentValueExisteNaNormaAlterada = !isDispositivoNovoNaNormaAlterada(dispositivo);
  const newValueExisteNaNormaAlterada = action.existeNaNormaAlterada;

  if (currentValueExisteNaNormaAlterada === newValueExisteNaNormaAlterada) {
    state.ui.events = [];
    return state;
  }

  const mudouIndicacaoDeExistenteParaNovo = currentValueExisteNaNormaAlterada && !action.existeNaNormaAlterada;

  const eventos: StateEvent[] = [];

  if (!mudouIndicacaoDeExistenteParaNovo) {
    const original = createElemento(dispositivo);
    (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada = action.existeNaNormaAlterada;
    const alterado = createElemento(dispositivo);
    eventos.push({
      stateType: StateType.ElementoModificado,
      elementos: [original, alterado],
    });
  } else {
    const dispositivos = getDispositivoAndFilhosAsLista(dispositivo);
    if (!isDispositivosValidosParaNumeracaoAutomatica(dispositivos)) {
      return retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" porque existe numeração não sequencial nos dispositivos filhos',
      });
    }

    dispositivos.forEach(d => {
      const original = createElemento(d);
      (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = action.existeNaNormaAlterada;
      const alterado = createElemento(d);
      eventos.push({
        stateType: StateType.ElementoModificado,
        elementos: [original, alterado],
      });
    });
  }

  eventos.push({
    stateType: StateType.ElementoSelecionado,
    elementos: [createElemento(dispositivo)],
  });

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos),
    present: eventos,
    future: [], //state.future,
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
    },
  };
};

export const isDispositivosValidosParaNumeracaoAutomatica = (dispositivos: Dispositivo[]): boolean => {
  const mensagens: Mensagem[] = [];
  dispositivos.forEach(d => mensagens.push(...validaNumeracao(d)));
  return !mensagens.some(m => m.descricao?.includes('omissis antes')) && !dispositivos.some(d => d.tipo === 'Omissis');
};
