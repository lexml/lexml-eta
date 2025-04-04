import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { State, StateType } from '../../state';
import { findRevisaoByElementoUuid } from '../util/revisaoUtil';

export const selecionaElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);
  if (atual === undefined) {
    const revisao = findRevisaoByElementoUuid(state.revisoes, action.atual.uuid);
    if (!revisao) {
      state.ui.events = [];
    } else {
      const e = { ...revisao.elementoAntesRevisao!, acoesPossiveis: [] };
      state.ui.events = [{ stateType: StateType.ElementoSelecionado, elementos: [e] }];
    }
    return state;
  }

  atual.mensagens = validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.ElementoSelecionado,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
  };
};
