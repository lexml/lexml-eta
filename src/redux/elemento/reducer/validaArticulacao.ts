import { Elemento } from '../../../model/elemento';
import { State, StateType } from '../../state';
import { validaFilhos } from '../util/reducerUtil';

export const validaArticulacao = (state: any): State => {
  const elementos: Elemento[] = [];
  validaFilhos(elementos, state.articulacao.filhos);

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: elementos,
    },
  ];

  return {
    articulacao: state.articulacao,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};
