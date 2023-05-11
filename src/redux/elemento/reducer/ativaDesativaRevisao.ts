import { State, StateType } from '../../state';

export const ativaDesativaRevisao = (state: any): State => {
  const isActive = !state.emRevisao;
  return {
    ...state,
    emRevisao: isActive,
    ui: {
      events: [{ stateType: isActive ? StateType.RevisaoAtivada : StateType.RevisaoDesativada }],
      alertas: state.ui?.alertas,
    },
  };
};
