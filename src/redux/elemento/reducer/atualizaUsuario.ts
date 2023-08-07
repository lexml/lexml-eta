import { State, StateType } from '../../state';

export const atualizaUsuario = (state: any, action: any): State => {
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [{ stateType: StateType.AtualizaUsuario }],
      message: state.ui?.mensagem,
      alertas: state.ui?.alertas,
    },
    usuario: action.usuario,
  };
};
