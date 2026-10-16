import { createElemento } from '../../../model/elemento/elementoUtil';
import { Artigo } from '../../../model/dispositivo/dispositivo';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RemissaoExternaValue } from '../../../model/remissao';
import { buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';
import { eventosRevalidacaoDoArtigo } from './revalidaArtigoDaRemissao';

// Conta as remissões do artigo cujo link já está no texto ou cujo textoRef aparece nele (as demais do registro são órfãs), mais as do lote atual, que podem ainda não estar no texto.
const contaRemissoesDoArtigo = (remissoes: Record<string, RemissaoExternaValue>, artigo: Artigo, novaRefId: string, totalNoLote: number): number =>
  Object.values(remissoes).filter(
    r => r.sourceUuid === artigo.uuid && r.refId !== novaRefId && (artigo.texto.includes(`data-ref-id="${r.refId}"`) || (!!r.textoRef && artigo.texto.includes(r.textoRef)))
  ).length + totalNoLote;

const preencheBasePelaRemissao = (state: any, remissoes: Record<string, RemissaoExternaValue>, value: RemissaoExternaValue, totalNoLote: number): any => {
  const artigo = state.articulacao && value.sourceUuid !== undefined ? (findDispositivoByUuid(state.articulacao, value.sourceUuid) as Artigo | null) : null;

  if (!artigo?.alteracoes || artigo.alteracoes.base || !value.targetUrn || contaRemissoesDoArtigo(remissoes, artigo, value.refId, totalNoLote) !== 1) {
    return undefined;
  }

  const original = createElemento(artigo, true);
  artigo.alteracoes.base = value.targetUrn;

  return {
    past: buildPast(state, buildUpdateEvent(artigo, original)),
    future: state.future,
  };
};

export const adicionaRemissaoExterna = (state: any, action: any): any => {
  const { value } = action;

  if (!value?.refId) {
    return state;
  }

  const remissoesExternas = { ...(state.remissoesExternas ?? {}), [value.refId]: value };
  const preenchimento = preencheBasePelaRemissao(state, remissoesExternas, value, Math.max(action.totalNoLote ?? 1, 1));

  return { ...state, remissoesExternas, ...preenchimento, ui: { ...state.ui, events: eventosRevalidacaoDoArtigo(state, value.sourceUuid) } };
};
