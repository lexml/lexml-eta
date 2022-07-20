import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { State, StateType } from '../../state';

export const solicitaDadosAssistente = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }
  atual.mensagens = validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.InformarDadosAssistente,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: [],
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
  };
};
