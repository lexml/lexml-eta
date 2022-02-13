import { State, StateType } from '../../state';

export const recuperaArticulacaoAtualizada = (state: any): State => {
  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [
        {
          stateType: StateType.ArticulacaoAtualizada,
        },
      ],
    },
  };
};
