import { createElemento, createElementoValidadoComExtras, listaDispositivosRenumerados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import {
  findDispositivoByUuid,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnterior,
  getDispositivoPosterior,
  getPrimeiroAgrupadorNaArticulacao,
  getTiposAgrupadorArtigoPermitidosNaArticulacao,
  hasEmenta,
  hasFilhos,
  isArtigoUnico,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { isAgrupador, isArticulacao, isArtigo, isEmenta } from '../../../model/dispositivo/tipo';
import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { RemoverElemento } from '../../../model/lexml/acao/removerElementoAction';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { getPaiQuePodeReceberFilhoDoTipo, removeAgrupadorAndBuildEvents, removeAndBuildEvents } from '../evento/eventosUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';
import { existeFilhoExcluidoOuAlteradoDuranteRevisao, findRevisaoByElementoUuid2, isRevisaoDeMovimentacao, isRevisaoPrincipal } from '../util/revisaoUtil';

export const removeElemento = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    state.ui.events = [];
    return state;
  }

  const erroValidacao = validarRemocaoElemento(state, dispositivo, action);
  if (erroValidacao) return erroValidacao;

  const primeiroFilhoDoAgrupador = isAgrupador(dispositivo) ? dispositivo.filhos[0] || getDispositivoPosterior(dispositivo) || getDispositivoAnterior(dispositivo) : undefined;
  const elPrimeiroFilhoDoAgrupador = primeiroFilhoDoAgrupador ? createElemento(primeiroFilhoDoAgrupador) : undefined;
  const isAtualizarElementoEmenta = hasEmenta(dispositivo) && dispositivo === getPrimeiroAgrupadorNaArticulacao(dispositivo);

  // Guarda lexmlId antigo (valor) e a referência do objeto para ler o novo d.id após a renumeração.
  const mapeamentoLexmlIds: Array<{ d: Dispositivo; lexmlIdAntigo: string; uuidDispositivo: number }> = [];
  listaDispositivosRenumerados(dispositivo).forEach(d => capturarComDescendentes(d, mapeamentoLexmlIds));

  // Captura o dispositivo removido e todos os seus descendentes ANTES da remoção,
  // para que RemissaoInvalidada seja emitida para cada um deles.
  const dispositivosRemovidosIds = capturarRemovidosEDescendentes(dispositivo);

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state, dispositivo);

  const { novoRegistroRemissoes, eventosRemissao } = construirEventosRemissaoParaRemocao(state.remissoes, state.articulacao, dispositivosRemovidosIds, mapeamentoLexmlIds);
  events.push(...eventosRemissao);

  if (elPrimeiroFilhoDoAgrupador) {
    events.push({ stateType: StateType.ElementoMarcado, elementos: [elPrimeiroFilhoDoAgrupador] });
    events.push({ stateType: StateType.ElementoReferenciado, elementos: [elPrimeiroFilhoDoAgrupador] });
  }

  if (isAtualizarElementoEmenta) {
    events.push({ stateType: StateType.SituacaoElementoModificada, elementos: [createElemento(state.articulacao.projetoNorma.ementa)] });
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
      alertas: state.ui?.alertas,
    },
    remissoes: novoRegistroRemissoes,
    mensagensCritical: state.mensagensCritical,
  };
};

// Valida se a remoção é permitida. Retorna o state de erro se não for, ou null se for permitido.
const validarRemocaoElemento = (state: any, dispositivo: Dispositivo, action: any): State | null => {
  if (isAgrupador(dispositivo) && !isDispositivoAlteracao(dispositivo)) {
    // Só deixa remover agrupador se articulação permanecer consistente
    if (isArticulacao(dispositivo.pai!)) {
      const tipos = getTiposAgrupadorArtigoPermitidosNaArticulacao();
      if (!dispositivo.filhos.every(f => isArtigo(f) || tipos.includes(f.tipo))) {
        return retornaEstadoAtualComMensagem(state, {
          tipo: TipoMensagem.ERROR,
          descricao: `Operação não permitida (se houver seções abaixo do "${dispositivo.rotulo}", elas devem ser removidas antes)`,
        });
      }
    } else if (dispositivo.filhos.filter(f => !isArtigo(f)).length) {
      const dispositivos = getDispositivoAndFilhosAsLista(dispositivo.pai!).filter(isAgrupador);
      const agrupadorAntes = dispositivos[dispositivos.indexOf(dispositivo) - 1] || {};
      const agrupadorDepois = dispositivos[dispositivos.indexOf(dispositivo) + 1] || {};
      if (agrupadorAntes.tipo !== agrupadorDepois.tipo && !getPaiQuePodeReceberFilhoDoTipo(dispositivo.pai!, agrupadorDepois.tipo, [])) {
        return retornaEstadoAtualComMensagem(state, {
          tipo: TipoMensagem.ERROR,
          descricao: `Operação não permitida (o agrupador "${agrupadorDepois.rotulo}" não poder estar diretamente subordinado ao agrupador "${agrupadorAntes.rotulo}")`,
        });
      }
    }
  }

  if (isEmenta(dispositivo)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir a ementa.' });
  }

  if (!isAcaoPermitida(dispositivo, RemoverElemento)) {
    return !isEmenta(dispositivo)
      ? retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir um dispositivo original mas apenas suprimi-lo.' })
      : state;
  }

  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigoUnico(dispositivo) || (state.articulacao.filhos.length === 1 && state.articulacao.filhos[0] === dispositivo && !hasFilhos(dispositivo)))
  ) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir o único dispositivo disponível.' });
  }

  if (state.emRevisao && existeFilhoExcluidoOuAlteradoDuranteRevisao(state, dispositivo) && !action.isRejeitandoRevisao) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.',
    });
  }

  const revisao = findRevisaoByElementoUuid2(state.revisoes, dispositivo.uuid2);
  if (state.emRevisao && revisao && isRevisaoPrincipal(revisao) && isRevisaoDeMovimentacao(revisao) && !action.isRejeitandoRevisao) {
    return retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.ERROR,
      descricao: 'Não é possível remover dispositivo movido em modo de revisão.',
    });
  }

  return null;
};

// Percorre o dispositivo e todos os seus descendentes, capturando pares {lexmlIdAntigo, uuid}
// antes da renumeração, para que os eventos RemissaoRenumerada possam ser emitidos depois.
const capturarComDescendentes = (d: Dispositivo, mapeamento: Array<{ d: Dispositivo; lexmlIdAntigo: string; uuidDispositivo: number }>): void => {
  if (d.id && d.uuid) {
    mapeamento.push({ d, lexmlIdAntigo: d.id, uuidDispositivo: d.uuid });
  }
  d.filhos?.forEach(filho => capturarComDescendentes(filho, mapeamento));
};

// Captura o dispositivo removido e todos os seus descendentes (via filhos) com lexmlId e uuid,
// para que RemissaoInvalidada seja emitida para cada um deles.
const capturarRemovidosEDescendentes = (d: Dispositivo): Array<{ lexmlId: string; uuid: number }> => {
  const result: Array<{ lexmlId: string; uuid: number }> = [];
  const capturar = (dispositivo: Dispositivo): void => {
    if (dispositivo.id && dispositivo.uuid) {
      result.push({ lexmlId: dispositivo.id, uuid: dispositivo.uuid });
    }
    dispositivo.filhos?.forEach(capturar);
  };
  capturar(d);
  return result;
};

export const construirEventosRemissaoParaRemocao = (
  remissoes: Record<number, any[]> | undefined,
  articulacao: any,
  dispositivosRemovidosIds: Array<{ lexmlId: string; uuid: number }>,
  mapeamentoLexmlIds: Array<{ d: Dispositivo; lexmlIdAntigo: string; uuidDispositivo: number }>
): { novoRegistroRemissoes: Record<number, any[]> | undefined; eventosRemissao: any[] } => {
  const lexmlIdsRemovidos = dispositivosRemovidosIds.map(d => d.lexmlId);
  const novoRegistroRemissoes = marcarRemissoesComoInvalidas(remissoes, lexmlIdsRemovidos);
  const eventosRemissao: any[] = [];

  if (novoRegistroRemissoes && lexmlIdsRemovidos.length > 0) {
    const mensagemInvalida = { tipo: TipoMensagem.ERROR, descricao: 'Este dispositivo contém referência para dispositivo que foi excluído.' };
    const sourceUuidsAfetados = new Set<number>();

    for (const uuidStr of Object.keys(novoRegistroRemissoes)) {
      const uuid = Number(uuidStr);
      const remissoesOrigem = novoRegistroRemissoes[uuid];
      if (remissoesOrigem.some((r: any) => lexmlIdsRemovidos.includes(r.targetLexmlId) && r.valida === false)) {
        sourceUuidsAfetados.add(uuid);
      }
    }

    for (const sourceUuid of sourceUuidsAfetados) {
      const dispositivoOrigem = findDispositivoByUuid(articulacao, sourceUuid, true);
      if (dispositivoOrigem) {
        eventosRemissao.push({
          stateType: StateType.ElementoValidado,
          elementos: [createElementoValidadoComExtras(dispositivoOrigem, [mensagemInvalida])],
        });
      }
    }
  }

  for (const { lexmlId, uuid } of dispositivosRemovidosIds) {
    eventosRemissao.push({
      stateType: StateType.RemissaoInvalidada,
      remissaoInvalidacao: { lexmlId, uuid },
    });
  }

  mapeamentoLexmlIds.forEach(({ d, lexmlIdAntigo, uuidDispositivo }) => {
    const lexmlIdNovo = d.id;
    if (lexmlIdAntigo && lexmlIdNovo && lexmlIdAntigo !== lexmlIdNovo && uuidDispositivo) {
      eventosRemissao.push({
        stateType: StateType.RemissaoRenumerada,
        elementos: [],
        remissaoRenumeracao: {
          lexmlIdAntigo,
          lexmlIdNovo,
          novoUuid: uuidDispositivo,
        },
      });
    }
  });

  return { novoRegistroRemissoes, eventosRemissao };
};

const marcarRemissoesComoInvalidas = (registroAtual: Record<number, any[]> | undefined, lexmlIdsRemovidos: string[]): Record<number, any[]> | undefined => {
  if (!lexmlIdsRemovidos.length || !registroAtual) {
    return registroAtual;
  }

  const novoRegistro: Record<number, any[]> = {};
  let houveAlteracao = false;

  for (const uuid of Object.keys(registroAtual)) {
    const remissoes = registroAtual[Number(uuid)];
    novoRegistro[Number(uuid)] = remissoes.map((r: any) => {
      if (lexmlIdsRemovidos.includes(r.targetLexmlId) && r.valida !== false) {
        houveAlteracao = true;
        return { ...r, valida: false };
      }
      return r;
    });
  }

  return houveAlteracao ? novoRegistro : registroAtual;
};
