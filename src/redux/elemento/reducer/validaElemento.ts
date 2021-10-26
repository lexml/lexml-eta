import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { State, StateType } from '../../state';

export const validaElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  atual.mensagens = validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};
