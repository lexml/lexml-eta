import { createElemento, listaDispositivosRenumerados, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';
import {
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

  if (isAgrupador(dispositivo) && !isDispositivoAlteracao(dispositivo)) {
    // Só deixa remover agrupador se articulação permenecer consistente
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

  const primeiroFilhoDoAgrupador = isAgrupador(dispositivo) ? dispositivo.filhos[0] || getDispositivoPosterior(dispositivo) || getDispositivoAnterior(dispositivo) : undefined;
  const elPrimeiroFilhoDoAgrupador = primeiroFilhoDoAgrupador ? createElemento(primeiroFilhoDoAgrupador) : undefined;
  const isAtualizarElementoEmenta = hasEmenta(dispositivo) && dispositivo === getPrimeiroAgrupadorNaArticulacao(dispositivo);

  // Guarda lexmlId antigo (valor) e a referência do objeto para ler o novo d.id após a renumeração.
  const mapeamentoLexmlIds: Array<{ d: Dispositivo; lexmlIdAntigo: string; uuidDispositivo: number }> = [];
  const capturarComDescendentes = (d: Dispositivo): void => {
    if (d.id && d.uuid) {
      mapeamentoLexmlIds.push({ d, lexmlIdAntigo: d.id, uuidDispositivo: d.uuid });
    }
    d.filhos?.forEach(capturarComDescendentes);
  };
  listaDispositivosRenumerados(dispositivo).forEach(capturarComDescendentes);

  const lexmlIdRemovido = dispositivo.id;
  const uuidRemovido = dispositivo.uuid;

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state, dispositivo);

  const novoRegistroRemissoes = marcarRemissoesDoDestinoComoInvalidas(state.remissoes, lexmlIdRemovido);

  if (lexmlIdRemovido && uuidRemovido) {
    events.push({
      stateType: StateType.RemissaoInvalidada,
      remissaoInvalidacao: {
        lexmlId: lexmlIdRemovido,
        uuid: uuidRemovido,
      },
    });
  }

  mapeamentoLexmlIds.forEach(({ d, lexmlIdAntigo, uuidDispositivo }) => {
    const lexmlIdNovo = d.id;
    if (lexmlIdAntigo && lexmlIdNovo && lexmlIdAntigo !== lexmlIdNovo && uuidDispositivo) {
      events.push({
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

const marcarRemissoesDoDestinoComoInvalidas = (registroAtual: Record<number, any[]> | undefined, lexmlIdRemovido: string | undefined): Record<number, any[]> | undefined => {
  if (!lexmlIdRemovido || !registroAtual) {
    return registroAtual;
  }

  const novoRegistro: Record<number, any[]> = {};
  let houveAlteracao = false;

  for (const uuid of Object.keys(registroAtual)) {
    const remissoes = registroAtual[Number(uuid)];
    novoRegistro[Number(uuid)] = remissoes.map((r: any) => {
      if (r.targetLexmlId === lexmlIdRemovido && r.valida !== false) {
        houveAlteracao = true;
        return { ...r, valida: false };
      }
      return r;
    });
  }

  return houveAlteracao ? novoRegistro : registroAtual;
};
