import { RemissaoInternaValue } from '../../../model/remissao';
import { sincronizarRemissoesComEstadoAtual } from '../../../model/remissao/sincronizarRemissoes';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { findDispositivoByUuid } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { State, StateType } from '../../state';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../model/lexml/acao/removerElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../model/lexml/acao/renumerarElementoAction';
import { AGRUPAR_ELEMENTO } from '../../../model/lexml/acao/agruparElementoAction';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { TRANSFORMAR_TIPO_ELEMENTO } from '../../../model/lexml/acao/transformarElementoAction';
import { TAB } from '../../../model/lexml/acao/tabAction';
import { SHIFT_TAB } from '../../../model/lexml/acao/shiftTabAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { REDO } from '../../../model/lexml/acao/redoAction';

// Fase 5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): plugado na
// cadeia de pós-processamento genérico de elementoReducer.ts. Restrito a ações estruturais (D2) —
// resolver targetUuid custa uma busca em profundidade sem índice (findDispositivoByUuid); rodar em
// toda ação (inclusive digitação) custaria O(remissões × tamanho da árvore) sem necessidade.
const ACOES_ESTRUTURAIS = new Set([
  ADICIONAR_ELEMENTO,
  REMOVER_ELEMENTO,
  RENUMERAR_ELEMENTO,
  AGRUPAR_ELEMENTO,
  ADICIONAR_AGRUPADOR_ARTIGO,
  TRANSFORMAR_TIPO_ELEMENTO,
  TAB,
  SHIFT_TAB,
  UNDO,
  REDO,
]);

const entradaMudou = (antiga: RemissaoInternaValue | undefined, nova: RemissaoInternaValue): boolean =>
  !antiga || antiga.targetLexmlId !== nova.targetLexmlId || antiga.textoRef !== nova.textoRef || antiga.revisao !== nova.revisao;

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
    .map(uuid => findDispositivoByUuid(state.articulacao as unknown as Dispositivo, uuid, true))
    .filter((d): d is Dispositivo => !!d)
    .map(d => ({ stateType: StateType.AtualizaRemissaoInterna, elementos: [createElemento(d, true)] }));

  state.remissoes = registroNovo;
  state.ui = { ...state.ui, events: [...(state.ui?.events ?? []), ...eventosNovos] };

  return state;
};
