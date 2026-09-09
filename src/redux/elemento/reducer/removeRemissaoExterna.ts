export const removeRemissaoExterna = (state: any, action: any): any => {
  const { refId } = action;

  if (!refId || !state.remissoesExternas?.[refId]) {
    return state;
  }

  const remissoesExternas = { ...state.remissoesExternas };
  delete remissoesExternas[refId];

  return { ...state, remissoesExternas, ui: { ...state.ui, events: [] } };
};
