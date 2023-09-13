import { State, StateType } from '../../state';

export const limpaRevisao = (state: any): State => {
  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [{ stateType: StateType.AtualizacaoAlertas }],
      message: state.ui?.mensagem,
      alertas: state.alertas,
    },
    revisoes: [],
    emRevisao: false,
    usuario: state.usuario,
  };
};
