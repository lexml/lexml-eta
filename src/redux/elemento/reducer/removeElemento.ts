import { createElemento, createElementoValidadoComExtras, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { Alerta } from '../../../model/alerta/alerta';
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
import { isAgrupador, isArticulacao, isArtigo, isCaput, isEmenta } from '../../../model/dispositivo/tipo';
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

  // Captura o dispositivo removido e todos os seus descendentes ANTES da remoção,
  // para que RemissaoInvalidada seja emitida para cada um deles.
  const dispositivosRemovidosIds = capturarRemovidosEDescendentes(dispositivo);

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state, dispositivo);

  const { novoRegistroRemissoes, eventosRemissao, novosAlertas } = construirEventosRemissaoParaRemocao(state.remissoes, state.articulacao, dispositivosRemovidosIds);
  events.push(...eventosRemissao);

  if (elPrimeiroFilhoDoAgrupador) {
    events.push({ stateType: StateType.ElementoMarcado, elementos: [elPrimeiroFilhoDoAgrupador] });
    events.push({ stateType: StateType.ElementoReferenciado, elementos: [elPrimeiroFilhoDoAgrupador] });
  }

  if (isAtualizarElementoEmenta) {
    events.push({ stateType: StateType.SituacaoElementoModificada, elementos: [createElemento(state.articulacao.projetoNorma.ementa)] });
  }

  const alertasExistentes: Alerta[] = state.ui?.alertas ?? [];
  const alertasNovosDeduplicados = novosAlertas.filter(a => !alertasExistentes.some(e => e.id === a.id));
  const alertas = alertasNovosDeduplicados.length > 0 ? [...alertasExistentes, ...alertasNovosDeduplicados] : alertasExistentes;

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, events),
    present: events,
    future: [],
    ui: {
      events,
      alertas,
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
  dispositivosRemovidosIds: Array<{ lexmlId: string; uuid: number }>
): { novoRegistroRemissoes: Record<number, any[]> | undefined; eventosRemissao: any[]; novosAlertas: Alerta[] } => {
  const lexmlIdsRemovidos = dispositivosRemovidosIds.map(d => d.lexmlId);
  const uuidsRemovidos = new Set(dispositivosRemovidosIds.map(d => d.uuid));
  const novoRegistroRemissoes = marcarRemissoesComoInvalidas(remissoes, lexmlIdsRemovidos, uuidsRemovidos);
  const eventosRemissao: any[] = [];
  const novosAlertas: Alerta[] = [];

  if (novoRegistroRemissoes && lexmlIdsRemovidos.length > 0) {
    const mensagemInvalida = { tipo: TipoMensagem.ERROR, descricao: 'Este dispositivo contém referência para dispositivo que foi excluído.' };
    const sourceUuidsAfetados = new Set<number>();

    for (const uuidStr of Object.keys(novoRegistroRemissoes)) {
      const uuid = Number(uuidStr);
      const remissoesOrigem = novoRegistroRemissoes[uuid];
      if (remissoesOrigem.some((r: any) => r.valida === false && (r.targetUuid === undefined || uuidsRemovidos.has(r.targetUuid)))) {
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
        const rotulo = construirRotuloCompleto(dispositivoOrigem);
        novosAlertas.push({
          id: `alerta-remissao-invalida-${sourceUuid}`,
          tipo: TipoMensagem.ERROR,
          mensagem: `${rotulo} contém remissão inválida para dispositivo excluído.`,
          podeFechar: true,
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

  return { novoRegistroRemissoes, eventosRemissao, novosAlertas };
};

// Limpa pontuação de listagem do rótulo e, quando necessário, adiciona o nome do tipo como prefixo.
const limparRotuloParaAlerta = (rotulo: string): string => {
  const r = rotulo.trim();
  if (r.endsWith(' –')) return `inciso ${r.slice(0, -2).trim()}`;
  if (r.endsWith(')')) return `alínea ${r.slice(0, -1).trim()}`;
  return r.endsWith('.') ? r.slice(0, -1).trim() : r;
};

// Constrói o caminho legível do dispositivo subindo a hierarquia (ex: "Art. 1º, inciso II").
const construirRotuloCompleto = (dispositivo: Dispositivo): string => {
  const partes: string[] = [];
  let atual: Dispositivo | undefined = dispositivo;
  while (atual && !isArticulacao(atual)) {
    if (!isCaput(atual) && atual.rotulo) {
      partes.push(limparRotuloParaAlerta(atual.rotulo));
    }
    atual = atual.pai;
  }
  if (partes.length === 0) {
    return dispositivo.rotulo?.trim() ?? 'Dispositivo';
  }
  return partes.reverse().join(', ');
};

const marcarRemissoesComoInvalidas = (
  registroAtual: Record<number, any[]> | undefined,
  lexmlIdsRemovidos: string[],
  uuidsRemovidos: Set<number>
): Record<number, any[]> | undefined => {
  if (!lexmlIdsRemovidos.length || !registroAtual) {
    return registroAtual;
  }

  const novoRegistro: Record<number, any[]> = {};
  let houveAlteracao = false;

  for (const uuid of Object.keys(registroAtual)) {
    const remissoes = registroAtual[Number(uuid)];
    novoRegistro[Number(uuid)] = remissoes.map((r: any) => {
      // Valida a exclusão pelo targetUuid (imutável), pois lexmlIds defasados no state podem gerar falsos positivos de remoção.
      const destinoFoiRemovido = lexmlIdsRemovidos.includes(r.targetLexmlId) && (r.targetUuid === undefined || uuidsRemovidos.has(r.targetUuid));
      if (destinoFoiRemovido && r.valida !== false) {
        houveAlteracao = true;
        return { ...r, valida: false };
      }
      return r;
    });
  }

  return houveAlteracao ? novoRegistro : registroAtual;
};
