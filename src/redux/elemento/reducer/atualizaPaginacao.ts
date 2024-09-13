import { isCaput } from '../../../model/dispositivo/tipo';
import { PaginaArticulacao } from '../../../model/paginacao/paginacao';
import { Elemento } from '../../../model/elemento';
import { SELECIONAR_PAGINA_ARTICULACAO } from '../../../model/lexml/acao/selecionarPaginaArticulacaoAction';
import {
  buscaDispositivoById,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnteriorNaSequenciaDeLeitura,
  getDispositivoPosteriorNaSequenciaDeLeitura,
  getUltimoFilho,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { isRevisaoDeExclusao, isRevisaoElemento, isRevisaoPrincipal } from '../util/revisaoUtil';
import { ADICIONAR_ELEMENTO } from '../../../model/lexml/acao/adicionarElementoAction';
import { createElemento } from '../../../model/elemento/elementoUtil';
import {
  findPaginaByIdDispositivo,
  findPaginaByUuidDispositivo,
  findPaginaDoDispositivoAnterior,
  getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao,
  isPaginaUnica,
} from '../util/paginacaoUtil';
import { MOVER_ELEMENTO_ABAIXO } from '../../../model/lexml/acao/moverElementoAbaixoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../model/lexml/acao/moverElementoAcimaAction';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { AGRUPAR_ELEMENTO } from '../../../model/lexml/acao/agruparElementoAction';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';

export const atualizaPaginacao = (state: any, action: any): State => {
  if (!state.ui?.paginacao?.paginasArticulacao || !state.ui?.events || [SELECIONAR_PAGINA_ARTICULACAO].includes(action.type)) {
    return state;
  }

  if (!state.ui?.paginacao) {
    return state;
  }

  if (isPaginaUnica(state)) {
    state.ui.paginacao.paginasArticulacao[0].dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
    state.ui.paginacao.paginaSelecionada = state.ui.paginacao.paginasArticulacao[0];
    atualizaIdsDasPaginas(state.ui.paginacao.paginasArticulacao);
    return state;
  }

  state.ui.events.forEach((se: StateEvent) => {
    if (se.elementos?.length) {
      if (se.stateType === StateType.ElementoIncluido) {
        incluiDispositivosNaPaginacao(state, se.elementos, action);
      } else if (se.stateType === StateType.ElementoRemovido) {
        removeDispositivosDaPaginacao(state, se.elementos);
      }
    }
  });

  atualizaIdsDasPaginas(state.ui.paginacao.paginasArticulacao);
  adicionaIdsDeDispositivosRemovidosEmModoDeRevisao(state);

  if ([MOVER_ELEMENTO_ABAIXO, MOVER_ELEMENTO_ACIMA, UNDO, REDO].includes(action?.type)) {
    adicionaEventosDeMudancaDePaginaSeNecessario(state);
  }

  // TODO: garantir que todo dispositivo na articulação esteja em alguma página
  // TODO: garantir que todo dispositivo removido em modo de revisão esteja em alguma página

  return state;
};

const adicionaIdsDeDispositivosRemovidosEmModoDeRevisao = (state: any): void => {
  const stateAux = state as State;
  const dispositivosRemovidosEmModoDeRevisao = stateAux.revisoes?.filter(r => isRevisaoElemento(r) && isRevisaoDeExclusao(r as RevisaoElemento)) as RevisaoElemento[];

  let paginaDestino: PaginaArticulacao | undefined = undefined;
  dispositivosRemovidosEmModoDeRevisao.forEach(revisao => {
    const lexmlIdElementoAnterior = revisao.elementoAntesRevisao?.elementoAnteriorNaSequenciaDeLeitura?.lexmlId;
    if (isRevisaoPrincipal(revisao) && lexmlIdElementoAnterior) {
      paginaDestino = findPaginaByIdDispositivo(state.ui.paginacao, lexmlIdElementoAnterior);
    }

    const indexElementoAnterior = paginaDestino!.ids.indexOf(lexmlIdElementoAnterior!);
    paginaDestino!.ids.splice(indexElementoAnterior + 1, 0, revisao.elementoAntesRevisao!.lexmlId!);
  });
};

const atualizaIdsDasPaginas = (paginas: PaginaArticulacao[]): void => {
  paginas.forEach(pagina => {
    pagina.ids = pagina.dispositivos.map(d => d.id!);
  });
};

const adicionaEventosDeMudancaDePaginaSeNecessario = (state: any): void => {
  const primeiroElementoInserido = state.ui.events.find(e => e.stateType === StateType.ElementoIncluido)?.elementos[0];
  if (primeiroElementoInserido) {
    const paginaDestino = primeiroElementoInserido && findPaginaByUuidDispositivo(state.ui.paginacao, primeiroElementoInserido.uuid);

    // Adiciona eventos para mudar a página selecionada e colocar o foco no elemento movido
    if (paginaDestino && paginaDestino !== state.ui.paginacao.paginaSelecionada) {
      state.ui.paginacao.paginaSelecionada = paginaDestino;

      state.ui.events.push(
        ...[
          {
            stateType: StateType.PaginaArticulacaoSelecionada,
            elementos: getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao(state),
          },
          {
            stateType: StateType.ElementoSelecionado,
            elementos: [primeiroElementoInserido],
          },
          {
            stateType: StateType.ElementoMarcado,
            elementos: [primeiroElementoInserido],
          },
        ]
      );
    }
  }
};

const incluiDispositivosNaPaginacao = (state: any, elementos: Elemento[] = [], action?: any): void => {
  const novos = elementos
    .filter(e => !e.revisao || !isRevisaoDeExclusao(e.revisao as RevisaoElemento))
    .map(e => buscaDispositivoById(state.articulacao!, e.lexmlId!)!)
    .filter(Boolean);

  if (!novos.length) {
    return;
  }

  let paginaDestino: PaginaArticulacao | undefined = undefined;
  let definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido = false;

  if ([ADICIONAR_ELEMENTO, ADICIONAR_AGRUPADOR_ARTIGO, AGRUPAR_ELEMENTO].includes(action?.type) && action.atual) {
    paginaDestino = findPaginaByUuidDispositivo(state.ui.paginacao, action.atual.uuid);
    const indexAtual = paginaDestino?.dispositivos.findIndex(d => d.uuid === action.atual.uuid);
    if (indexAtual === 0 && (action.posicao === 'antes' || action.novo?.posicao === 'antes')) {
      definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido = true;
    }
  } else if (action?.type === MOVER_ELEMENTO_ABAIXO) {
    const dAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(novos[0], d => !isCaput(d))!;
    paginaDestino = findPaginaByUuidDispositivo(state.ui.paginacao, dAnterior.uuid!)!;
  } else if (action?.type === MOVER_ELEMENTO_ACIMA) {
    const dPosterior = getDispositivoPosteriorNaSequenciaDeLeitura(getUltimoFilho(novos[0]), d => !isCaput(d))!;
    paginaDestino = findPaginaByUuidDispositivo(state.ui.paginacao, dPosterior.uuid!);
    const indexDPosterior = paginaDestino?.dispositivos.indexOf(dPosterior);
    if (indexDPosterior === 0 || (indexDPosterior === 1 && paginaDestino?.dispositivos[0].uuid === novos[0].uuid)) {
      definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido = true;
    }
  }

  if (!paginaDestino) {
    paginaDestino = findPaginaDoDispositivoAnterior(state.ui.paginacao, novos[0]);
  }

  novos.forEach(novo => {
    if ([MOVER_ELEMENTO_ABAIXO, MOVER_ELEMENTO_ACIMA].includes(action?.type)) {
      // Remove dispositivo da página de origem
      const paginaOrigem = findPaginaByUuidDispositivo(state.ui.paginacao, novo.uuid!);
      if (paginaOrigem) {
        paginaOrigem.dispositivos = paginaOrigem.dispositivos.filter(d => d.uuid !== novo.uuid);
      }
    }

    const dReferencia = getDispositivoAnteriorNaSequenciaDeLeitura(novo, d => !isCaput(d));
    const pagina = findPaginaByUuidDispositivo(state.ui.paginacao, dReferencia!.uuid!);
    if (pagina === paginaDestino) {
      const index = paginaDestino!.dispositivos.indexOf(dReferencia!) + 1;
      paginaDestino!.dispositivos.splice(index, 0, novo);
    } else {
      paginaDestino!.dispositivos.unshift(novo);
    }
  });

  if (definirArticulacaoComoElementoAnteriorDoPrimeiroDispositivoInserido) {
    elementos[0].elementoAnteriorNaSequenciaDeLeitura = createElemento(state.articulacao, false, false);
  }
};

const removeDispositivosDaPaginacao = (state: State, elementos: Elemento[] = []): void => {
  const uuids = elementos.filter(e => !e.revisao).map(e => e.uuid!);
  state.ui?.paginacao?.paginasArticulacao?.forEach(pagina => {
    pagina.dispositivos = pagina.dispositivos.filter(d => !uuids.includes(d.uuid!));
  });
};
