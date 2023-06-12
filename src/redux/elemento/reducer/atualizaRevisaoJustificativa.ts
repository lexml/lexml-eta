import { State } from '../../state';

export const atualizaRevisaoJustificativa = (state: State, actionType: any): State => {
  const numElementos = state.ui?.events.map(se => se.elementos).flat().length;
  if (!state.emRevisao || !actionType || !numElementos) {
    return state;
  }

  return state;
};
