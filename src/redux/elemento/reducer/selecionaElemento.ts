// import { isArtigo, isAgrupador } from './../../../model/dispositivo/tipo';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { State, StateType } from '../../state';

export const selecionaElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    state.ui.events = [];
    return state;
  }

  // if (isArtigo(atual) || isAgrupador(atual)) {
  //   console.log(11111, `Dispositivo ${atual.id?.toUpperCase()} (uuid: ${atual.uuid}) filho de ${(atual.pai?.id ?? atual.pai?.tipo)?.toUpperCase()} (uuid: ${atual.pai?.uuid})`);
  // }

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
