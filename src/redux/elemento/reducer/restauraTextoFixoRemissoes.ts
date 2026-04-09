import { State, StateType } from '../../state';
import { RemissaoTextoFixo, RemissaoInternaValue } from '../../../model/remissao';
import { buscaDispositivoById } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { gerarRefId } from '../../../model/remissao/refId';

/**
 * Restaura o flag textoFixo nas entradas do registry após carregar um documento.
 *
 * O bootstrap (Etapa 3) recria as entradas do registry a partir do HTML dos dispositivos,
 * mas não tem como inferir o flag textoFixo — ele só está disponível no campo
 * remissoesTextoFixo da Proposicao. Este reducer aplica o flag nas entradas correspondentes.
 *
 * Também emite RemissaoTextoFixoRestaurada para que o editor possa marcar o atributo
 * data-texto-fixo no DOM (necessário para que atualizarReferencias preserve o texto na renomeação).
 */
export const restauraTextoFixoRemissoes = (state: any, action: any): State => {
  const remissoesTextoFixo: RemissaoTextoFixo[] = action.remissoesTextoFixo ?? [];

  if (remissoesTextoFixo.length === 0) {
    return { ...state, ui: { ...state.ui, events: [] } };
  }

  const articulacao = state.articulacao;
  const novoRegistro: Record<number, RemissaoInternaValue[]> = { ...(state.remissoes ?? {}) };
  const restauradas: { sourceUuid: number; targetLexmlId: string }[] = [];

  for (const entrada of remissoesTextoFixo) {
    const { sourceLexmlId, targetLexmlId, textoRef } = entrada;

    const sourceDevice = buscaDispositivoById(articulacao, sourceLexmlId);
    if (!sourceDevice || sourceDevice.uuid === undefined) {
      continue;
    }

    const sourceUuid = sourceDevice.uuid;
    const entriesAtual: RemissaoInternaValue[] = novoRegistro[sourceUuid] ? [...novoRegistro[sourceUuid]] : [];

    const idx = entriesAtual.findIndex(e => e.targetLexmlId === targetLexmlId);

    if (idx >= 0) {
      entriesAtual[idx] = { ...entriesAtual[idx], textoFixo: true, textoRef };
    } else {
      // Bootstrap não detectou — cria nova entrada
      const targetDevice = buscaDispositivoById(articulacao, targetLexmlId);
      entriesAtual.push({
        refId: gerarRefId(),
        targetLexmlId,
        targetUuid: targetDevice?.uuid,
        sourceUuid,
        sourceLexmlId,
        textoRef,
        textoFixo: true,
      });
    }

    novoRegistro[sourceUuid] = entriesAtual;
    restauradas.push({ sourceUuid, targetLexmlId });
  }

  const eventosUi = restauradas.length > 0 ? [{ stateType: StateType.RemissaoTextoFixoRestaurada, elementos: [], remissoesTextoFixoRestauradas: restauradas }] : [];

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: eventosUi,
      alertas: state.ui?.alertas,
      message: state.ui?.message,
      paginacao: state.ui?.paginacao,
    },
    emRevisao: state.emRevisao,
    usuario: state.usuario,
    revisoes: state.revisoes,
    numEventosPassadosAntesDaRevisao: state.numEventosPassadosAntesDaRevisao,
    mensagensCritical: state.mensagensCritical,
    remissoes: novoRegistro,
  };
};
