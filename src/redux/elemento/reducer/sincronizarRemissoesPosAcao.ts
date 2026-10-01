import { RemissaoInternaValue } from '../../../model/remissao';
import { buscarDispositivoPorUuid, sincronizarRemissoesComEstadoAtual } from '../../../model/remissao/sincronizarRemissoes';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { State, StateType } from '../../state';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acao/removerElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../model/lexml/acao/renumerarElementoAction';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { TRANSFORMAR_TIPO_ELEMENTO } from '../../../model/lexml/acao/transformarElementoAction';
import { TAB } from '../../../model/lexml/acao/tabAction';
import { SHIFT_TAB } from '../../../model/lexml/acao/shiftTabAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { REJEITAR_REVISAO } from '../../../model/lexml/acao/rejeitarRevisaoAction';

// Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): plugado na
// cadeia de pós-processamento genérico de elementoReducer.ts. Restrito a ações estruturais (D2) —
// resolver targetUuid custa uma busca em profundidade sem índice (findDispositivoByUuid); rodar em
// toda ação (inclusive digitação) custaria O(remissões × tamanho da árvore) sem necessidade.
// REJEITAR_REVISAO desfaz movimentações; ACEITAR_REVISAO fica fora porque não altera a estrutura.
const ACOES_ESTRUTURAIS = new Set([
  ADICIONAR_ELEMENTO,
  REMOVER_ELEMENTO,
  RENUMERAR_ELEMENTO,
  ADICIONAR_AGRUPADOR_ARTIGO,
  TRANSFORMAR_TIPO_ELEMENTO,
  TAB,
  SHIFT_TAB,
  MOVER_ELEMENTO_ACIMA,
  MOVER_ELEMENTO_ABAIXO,
  REJEITAR_REVISAO,
  UNDO,
  REDO,
]);

// D5 (change 2026-09-23-c01): grava uuid2 enquanto os uuids ainda resolvem — mover/undo trocam o uuid
// da subárvore e o fallback de sincronizarEntrada depende do uuid2 já estar na entrada. Mutação in-place:
// só acrescenta identidade, não altera nada que a UI ou o save leiam.
export const preencherUuid2DasRemissoes = (state: State, actionType: string | undefined): void => {
  if (!actionType || !ACOES_ESTRUTURAIS.has(actionType) || !state?.articulacao || !state.remissoes) {
    return;
  }

  const articulacao = state.articulacao;
  for (const [uuidStr, entries] of Object.entries(state.remissoes)) {
    // A origem é a chave; entradas inválidas também precisam do sourceUuid2 para acompanhar a origem movida.
    const origemUuid2 = entries.some(e => !e.sourceUuid2) ? buscarDispositivoPorUuid(articulacao, Number(uuidStr))?.uuid2 : undefined;
    for (const entry of entries) {
      entry.sourceUuid2 ??= origemUuid2;
      if (entry.valida !== false && !entry.targetUuid2 && entry.targetUuid !== undefined) {
        entry.targetUuid2 = buscarDispositivoPorUuid(articulacao, entry.targetUuid)?.uuid2;
      }
    }
  }
};

// targetUuid entra na comparação: reancorar sem mudar o id textual ainda exige repintar o href do link.
const entradaMudou = (antiga: RemissaoInternaValue | undefined, nova: RemissaoInternaValue): boolean =>
  !antiga || antiga.targetLexmlId !== nova.targetLexmlId || antiga.textoRef !== nova.textoRef || antiga.revisao !== nova.revisao || antiga.targetUuid !== nova.targetUuid;

export const sincronizarRemissoesPosAcao = (state: State, actionType: string | undefined): State => {
  if (!actionType || !ACOES_ESTRUTURAIS.has(actionType) || !state.articulacao || !state.remissoes) {
    return state;
  }

  const registroAntigo = state.remissoes;
  const registroNovo = sincronizarRemissoesComEstadoAtual(state.articulacao, registroAntigo);

  const sourceUuidsAlterados: number[] = [];
  for (const [uuidStr, entriesNovas] of Object.entries(registroNovo)) {
    const uuid = Number(uuidStr);
    const entriesAntigas = registroAntigo[uuid] ?? [];
    const mudou = entriesNovas.some((novaEntry, i) => entradaMudou(entriesAntigas[i], novaEntry));
    if (mudou) sourceUuidsAlterados.push(uuid);
  }

  if (sourceUuidsAlterados.length === 0) {
    return state;
  }

  const eventosNovos = sourceUuidsAlterados
    .map(uuid => buscarDispositivoPorUuid(state.articulacao!, uuid))
    .filter((d): d is Dispositivo => !!d)
    .map(d => ({ stateType: StateType.AtualizaRemissaoInterna, elementos: [createElemento(d, true)] }));

  state.remissoes = registroNovo;
  state.ui = { ...state.ui, events: [...(state.ui?.events ?? []), ...eventosNovos] };

  return state;
};
