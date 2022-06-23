import { State } from '../../state';

export const limparAlertas = (state: any): State => {
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: state.ui?.events,
      message: state.ui?.mensagem,
      alertas: [],
    },
  };
};
