export const adicionaRemissaoExterna = (state: any, action: any): any => {
  const { value } = action;

  if (!value?.refId) {
    return state;
  }

  const remissoesExternas = { ...(state.remissoesExternas ?? {}), [value.refId]: value };

  return { ...state, remissoesExternas, ui: { ...state.ui, events: [] } };
};
