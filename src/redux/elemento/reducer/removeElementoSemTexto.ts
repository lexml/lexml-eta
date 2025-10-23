import { createElemento } from './../../../model/elemento/elementoUtil';
import { getDispositivoAnterior } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { removeElemento } from './removeElemento';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { hasFilhos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateEvent, StateType } from '../../state';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';

export const removeElementoSemTexto = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || !podeRemoverDispositivo(state, dispositivo)) {
    state.ui.events = [];
    return state;
  }

  const dispositivoAnterior = getDispositivoAnterior(dispositivo);

  const retorno = removeElemento(state, action);
  if (action.key === 'Backspace' && dispositivoAnterior) {
    retorno.ui?.events.push(getEventoMarcacaoElemento(dispositivoAnterior));
  }
  return retorno;
};

const getEventoMarcacaoElemento = (dispositivo: Dispositivo): StateEvent => {
  return {
    stateType: StateType.ElementoMarcado,
    elementos: [createElemento(dispositivo)],
    moverParaFimLinha: true,
  };
};

const podeRemoverDispositivo = (state: any, dispositivo: Dispositivo): boolean => {
  return !hasFilhos(dispositivo);
};
