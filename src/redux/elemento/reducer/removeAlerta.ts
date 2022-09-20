import { State, StateType } from '../../state';

export const removeAlerta = (state: any, action: any): State => {
  const alertas = state.ui?.alertas?.filter(({ id }) => id !== action.id);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [{ stateType: StateType.AtualizacaoAlertas }],
      message: state.ui?.mensagem,
      alertas: alertas,
    },
  };
};
