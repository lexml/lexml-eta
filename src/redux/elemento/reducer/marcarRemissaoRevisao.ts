import { State, StateType } from '../../state';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { createElementoValidado, createElementoValidadoComExtras } from '../../../model/elemento/elementoUtil';
import { TipoMensagem, Mensagem } from '../../../model/lexml/util/mensagem';
import { MENSAGEM_REMISSAO_INVALIDA, MENSAGEM_REMISSAO_TEXTO_PRESERVADO } from '../../../model/remissao/remissao';

export const marcarRemissaoPendenteRevisao = (state: any, action: any): State => {
  const entries: any[] = state.remissoes?.[action.sourceUuid] ?? [];
  const refIdsExistentes = new Set(entries.map((r: any) => r.refId));
  // Marca revisao:true nas entradas existentes
  const entradasAtualizadas = entries.map((r: any) => (action.refIds.includes(r.refId) ? { ...r, revisao: true } : r));
  // Cria placeholders para refIds de links manuais que não estão no registry (criados via diálogo)
  const placeholders = action.refIds.filter((id: string) => !refIdsExistentes.has(id)).map((id: string) => ({ refId: id, revisao: true as const }));
  const novasEntradas = [...entradasAtualizadas, ...placeholders];

  const novoRegistro = { ...(state.remissoes || {}), [action.sourceUuid]: novasEntradas };

  const dispositivo = findDispositivoByUuid(state.articulacao, action.sourceUuid, true);
  if (!dispositivo) {
    return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events: [] } };
  }

  const mensagensExtras: Mensagem[] = [];
  if (novasEntradas.some((r: any) => r.valida === false)) {
    mensagensExtras.push({ tipo: TipoMensagem.ERROR, descricao: MENSAGEM_REMISSAO_INVALIDA });
  }
  mensagensExtras.push({ tipo: TipoMensagem.WARNING, descricao: MENSAGEM_REMISSAO_TEXTO_PRESERVADO });

  const elementoValidado = createElementoValidadoComExtras(dispositivo, mensagensExtras);
  const events = [{ stateType: StateType.ElementoValidado, elementos: [elementoValidado] }];

  return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events } };
};

export const marcarRemissaoRevisada = (state: any, action: any): State => {
  const entries: any[] = state.remissoes?.[action.sourceUuid] ?? [];
  const novasEntradas = entries.map((r: any) => {
    if (r.refId !== action.refId) return r;
    const updated = { ...r };
    delete updated.revisao;
    return updated;
  });

  const novoRegistro = { ...(state.remissoes || {}), [action.sourceUuid]: novasEntradas };

  const dispositivo = findDispositivoByUuid(state.articulacao, action.sourceUuid, true);
  if (!dispositivo) {
    return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events: [] } };
  }

  const mensagensExtras: Mensagem[] = [];
  if (novasEntradas.some((r: any) => r.valida === false)) {
    mensagensExtras.push({ tipo: TipoMensagem.ERROR, descricao: MENSAGEM_REMISSAO_INVALIDA });
  }
  if (novasEntradas.some((r: any) => r.revisao === true)) {
    mensagensExtras.push({ tipo: TipoMensagem.WARNING, descricao: MENSAGEM_REMISSAO_TEXTO_PRESERVADO });
  }

  const elementoValidado = mensagensExtras.length > 0 ? createElementoValidadoComExtras(dispositivo, mensagensExtras) : createElementoValidado(dispositivo);

  const events = [{ stateType: StateType.ElementoValidado, elementos: [elementoValidado] }];

  return { ...state, remissoes: novoRegistro, ui: { ...state.ui, events } };
};
