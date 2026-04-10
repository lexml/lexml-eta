import { State, StateType } from '../../state';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElementoValidado, createElementoValidadoComExtras } from '../../../model/elemento/elementoUtil';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { MENSAGEM_REMISSAO_INVALIDA } from '../../../model/remissao/remissao';

export const removerRemissaoInvalida = (state: any, action: any): State => {
  const oldEntries = state.remissoes?.[action.sourceUuid] ?? [];
  const oldInvalidas = oldEntries.filter((r: any) => r.valida === false);

  if (oldInvalidas.length === 0) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const restantesRefIds = new Set((action.remissoesRestantes ?? []).map((r: any) => r.refId));
  const invalidasRemovidas = oldInvalidas.filter((r: any) => !restantesRefIds.has(r.refId));

  if (invalidasRemovidas.length === 0) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  // Re-aplica valida:false nas inválidas que ainda estão no DOM
  const invalidasRestantes = oldInvalidas.filter((r: any) => restantesRefIds.has(r.refId));
  const invalidasRestantesRefIds = new Set(invalidasRestantes.map((r: any) => r.refId));
  const novaEntradas = (action.remissoesRestantes ?? []).map((r: any) => (invalidasRestantesRefIds.has(r.refId) ? { ...r, valida: false } : r));

  const novoRegistro = { ...(state.remissoes || {}), [action.sourceUuid]: novaEntradas };

  const dispositivo = findDispositivoByUuid(state.articulacao, action.sourceUuid, true);
  if (!dispositivo) {
    return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events: [] } };
  }

  let elementoValidado;
  if (invalidasRestantes.length > 0) {
    // Ainda há links inválidos — mantém a mensagem
    const mensagemInvalida = { tipo: TipoMensagem.ERROR, descricao: MENSAGEM_REMISSAO_INVALIDA };
    elementoValidado = createElementoValidadoComExtras(dispositivo, [mensagemInvalida]);
  } else {
    // Todos os links inválidos foram removidos — sem mensagem extra
    elementoValidado = createElementoValidado(dispositivo);
  }

  const events = [{ stateType: StateType.ElementoValidado, elementos: [elementoValidado] }];

  return {
    ...state,
    remissoes: novoRegistro,
    ui: { ...state.ui, events },
  };
};
