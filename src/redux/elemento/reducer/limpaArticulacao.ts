import { State, StateType } from '../../state';

export const limpaArticulacao = (state: any): State => {
  for (let i = 0; i < state.articulacao.artigos.length; i++) {
    state.articulacao.removeArtigo(state.articulacao.artigos[i]);
  }
  state.articulacao._filhos = [];

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
