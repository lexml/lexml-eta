import { StateEvent } from './../../state';
import { createElemento, getElementos } from './../../../model/elemento/elementoUtil';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { InformarExistenciaDoElementoNaNorma } from '../../../model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { getDispositivoAndFilhosAsLista, isDispositivoCabecaAlteracao, isDispositivoNovoNaNormaAlterada } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { Mensagem, TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { isAgrupador, isArtigo } from '../../../model/dispositivo/tipo';

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

  const mensagemValidacao = validaAlteracaoExistenciaDispositivo(dispositivo, newValueExisteNaNormaAlterada);
  if (mensagemValidacao) {
    return retornaEstadoAtualComMensagem(state, mensagemValidacao);
  }

  const mudouIndicacaoDeExistenteParaNovo = currentValueExisteNaNormaAlterada && !action.existeNaNormaAlterada;

  const eventos: StateEvent[] = [];

  if (mudouIndicacaoDeExistenteParaNovo) {
    const dispositivos = getDispositivoAndFilhosAsLista(dispositivo).filter(d => !isAgrupador(dispositivo) || isAgrupador(d));

    dispositivos.forEach(d => {
      const original = createElemento(d);
      (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = action.existeNaNormaAlterada;
      const alterado = createElemento(d);
      eventos.push({
        stateType: StateType.ElementoModificado,
        elementos: [original, alterado],
      });
    });
  } else {
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

export const validaAlteracaoExistenciaDispositivo = (dispositivo: Dispositivo, newValueExisteNaNormaAlterada: boolean): Mensagem | undefined => {
  const currentValueExisteNaNormaAlterada = !isDispositivoNovoNaNormaAlterada(dispositivo);
  if (currentValueExisteNaNormaAlterada === newValueExisteNaNormaAlterada) {
    return;
  }

  const mudouIndicacaoDeExistenteParaNovo = currentValueExisteNaNormaAlterada && !newValueExisteNaNormaAlterada;
  return mudouIndicacaoDeExistenteParaNovo ? validaAlteracaoExistenteParaNovo(dispositivo) : validaAlteracaoNovoParaExistente(dispositivo);
};

const validaAlteracaoNovoParaExistente = (dispositivo: Dispositivo): Mensagem | undefined => {
  if (isDispositivoPossuiPaiNovoNaNormaAlterada(dispositivo)) {
    return {
      tipo: TipoMensagem.INFO,
      descricao: 'Não é permitido mudar a indicação de dispositivo "Novo" para "Existente" quando dispositivo hierarquicamente superior é novo na norma alteradao.',
    };
  }
};

const validaAlteracaoExistenteParaNovo = (dispositivo: Dispositivo): Mensagem | undefined => {
  const dispositivos = getDispositivoAndFilhosAsLista(dispositivo).filter(d => !isAgrupador(dispositivo) || !isArtigo(d));
  if (existeDispositivoSemNumero(dispositivos.slice(1))) {
    return {
      tipo: TipoMensagem.INFO,
      descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando existe dispositivo subordinado sem numeração.',
    };
  }

  if (existeOmissis(dispositivos)) {
    return {
      tipo: TipoMensagem.INFO,
      descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando existe texto omitido na estrutura do dispositivo.',
    };
  }

  if (existeNecessidadeDeOmissis(dispositivos.slice(1))) {
    return {
      tipo: TipoMensagem.INFO,
      descricao: 'Não é permitido mudar a indicação de dispositivo "Existente" para "Novo" quando existe numeração não sequencial nos dispositivos subordinados.',
    };
  }
};

const isDispositivoPossuiPaiNovoNaNormaAlterada = (dispositivo: Dispositivo): boolean => {
  const existe = (dispositivo.pai?.situacao as DispositivoAdicionado).existeNaNormaAlterada;
  return !isArtigo(dispositivo) && !isDispositivoCabecaAlteracao(dispositivo) && !(existe ?? true);
};

const existeDispositivoSemNumero = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.mensagens?.some(m => m.descricao?.toLowerCase().includes('numere o dispositivo')) || d.numero === undefined);
};

const existeOmissis = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.tipo === 'Omissis' || d.texto?.includes(TEXTO_OMISSIS));
};

const existeNecessidadeDeOmissis = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => d.mensagens?.some(m => m.descricao?.includes('omissis antes')));
};
