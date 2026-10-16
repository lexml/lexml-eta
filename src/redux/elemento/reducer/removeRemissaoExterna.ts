import { eventosRevalidacaoDoArtigo } from './revalidaArtigoDaRemissao';

export const removeRemissaoExterna = (state: any, action: any): any => {
  const { refId } = action;

  if (!refId || !state.remissoesExternas?.[refId]) {
    return state;
  }

  const sourceUuid = state.remissoesExternas[refId].sourceUuid;
  const remissoesExternas = { ...state.remissoesExternas };
  delete remissoesExternas[refId];

  return { ...state, remissoesExternas, ui: { ...state.ui, events: eventosRevalidacaoDoArtigo(state, sourceUuid) } };
};
