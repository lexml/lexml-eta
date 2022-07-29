import { isDispositivoCabecaAlteracao } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { TEXTO_OMISSIS } from './../../../model/lexml/conteudo/textoOmissis';
import { StateEvent } from './../../state';
import { createElemento, getElementos } from './../../../model/elemento/elementoUtil';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { InformarExistenciaDoElementoNaNorma } from '../../../model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { getDispositivoAndFilhosAsLista, isDispositivoNovoNaNormaAlterada } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
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
    if (isDispositivoPossuiPaiNovoNaNormaAlterada(dispositivo)) {
      return retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'Não é permitido mudar a indicação de dispositivo "Novo" para "Existente" quando dispositivo hierarquicamente superior é novo na norma alteradao.',
      });
    }

    const original = createElemento(dispositivo);
    (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada = action.existeNaNormaAlterada;
    const alterado = createElemento(dispositivo);
    eventos.push({
      stateType: StateType.ElementoModificado,
      elementos: [original, alterado],
    });

    eventos.push({
      stateType: StateType.SituacaoElementoModificada,
      elementos: getElementos(dispositivo),
    });
  } else {
    const dispositivos = getDispositivoAndFilhosAsLista(dispositivo);
    if (existeDispositivoSemNumero(dispositivos)) {
      return retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando o dispositivo atual ou um de seus subordinados não possui numeração.',
      });
    }

    if (existeOmissis(dispositivos)) {
      return retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando existe texto omitido na estrutura do dispositivo.',
      });
    }

    if (existeNecessidadeDeOmissis(dispositivos)) {
      return retornaEstadoAtualComMensagem(state, {
        tipo: TipoMensagem.INFO,
        descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando existe numeração não sequencial nos dispositivos subordinados.',
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

const isDispositivoPossuiPaiNovoNaNormaAlterada = (dispositivo: Dispositivo) => {
  const existe = (dispositivo.pai?.situacao as DispositivoAdicionado).existeNaNormaAlterada;
  return !isDispositivoCabecaAlteracao(dispositivo) && !(existe ?? true);
};

const existeDispositivoSemNumero = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.mensagens?.some(m => m.descricao?.toLowerCase().includes('numere o dispositivo')));
};

const existeOmissis = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.tipo === 'Omissis' || d.texto.includes(TEXTO_OMISSIS));
};

const existeNecessidadeDeOmissis = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.mensagens?.some(m => m.descricao?.includes('omissis antes')));
};
