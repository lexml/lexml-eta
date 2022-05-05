import { createElemento } from './../../../model/elemento/elementoUtil';
import { getDispositivoAnterior } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { removeElemento } from './removeElemento';
// import { isAgrupador } from '../../../model/dispositivo/tipo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { hasFilhos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateEvent, StateType } from '../../state';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';

export const removeElementoSemTexto = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined || !podeRemoverDispositivo(state, dispositivo)) {
    state.ui = [];
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
  if (state.modo.startsWith('emenda') && dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    return false;
  }
  return !hasFilhos(dispositivo);
};
