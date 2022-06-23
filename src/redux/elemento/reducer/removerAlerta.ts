import { State } from '../../state';

export const removerAlerta = (state: any, action: any): State => {
  const alertas = state.ui?.alertas?.filter(({ id }) => id !== action.id);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: state.ui?.events,
      message: state.ui?.mensagem,
      alertas: alertas,
    },
  };
};
