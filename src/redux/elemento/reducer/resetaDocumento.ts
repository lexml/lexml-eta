import { State, StateType } from '../../state';

// Devolve o estado ao inicial, preservando só o que é da sessão (usuário); modo de revisão desligado.
export const resetaDocumento = (state: any): State => ({
  articulacao: undefined,
  modo: undefined,
  past: [],
  present: [],
  future: [],
  ui: {
    // Sem isso a chave de revisão da tela continuaria ligada.
    events: state.emRevisao ? [{ stateType: StateType.RevisaoDesativada }] : [],
    alertas: [],
    paginacao: undefined,
  },
  emRevisao: false,
  usuario: state.usuario,
  revisoes: [],
  numEventosPassadosAntesDaRevisao: 0,
  remissoes: {},
  remissoesExternas: {},
});
