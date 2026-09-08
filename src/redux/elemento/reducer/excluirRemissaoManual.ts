import { State } from '../../state';
import { RemissaoInternaValue } from '../../../model/remissao';

/**
 * Aplica deleção lógica (`excluidaManualmente: true`) para impedir a recriação automática do link na mesma posição.
 * Ignora entradas não registradas (no-op), pois não correm o risco de re-detecção.
 */
export const excluirRemissaoManual = (state: any, action: any): State => {
  const entries: RemissaoInternaValue[] = state.remissoes?.[action.sourceUuid] ?? [];
  const index = entries.findIndex(r => r.refId === action.refId);

  if (index === -1) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const novasEntradas = entries.map((r, i) => (i === index ? { ...r, excluidaManualmente: true as const } : r));
  const novoRegistro = { ...(state.remissoes || {}), [action.sourceUuid]: novasEntradas };

  return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events: [] } };
};
