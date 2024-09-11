import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArticulacao, isCaput } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import {
  getDispositivoAnteriorNaSequenciaDeLeitura,
  getDispositivoPosteriorNaSequenciaDeLeitura,
  isAdicionado,
  isModificado,
  isSuprimido,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { findPaginaByUuidDispositivo, getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao, hasMultiplasPaginas } from '../util/paginacaoUtil';
import { findRevisaoByElementoUuid, findRevisaoElementoPrincipal, isRevisaoDeExclusao, isRevisaoElemento, isRevisaoPrincipal } from '../util/revisaoUtil';

export const navegaEntreDispositivosAlterados = (state: any, action: any): State => {
  let ref = getDispositivoFromElemento(state.articulacao, action.atual, true);
  let ignorarRevisoesDeExclusao = false;
  if (!ref) {
    // Verifica se o elemento corresponde a um dispositivo excluído em modo de revisão
    const revisao = findRevisaoByElementoUuid(state.revisoes, action.atual.uuid);
    if (revisao && isRevisaoDeExclusao(revisao)) {
      ref = getDispositivoReferenciaFromRevisaoExclusao(revisao, state, action);
      ignorarRevisoesDeExclusao = true;
    }

    if (!ref) {
      state.ui.events = [];
      return state;
    }
  }

  const elementoAlterado =
    action.direcao === 'proximo' ? findProximoElementoAlterado(ref, state, ignorarRevisoesDeExclusao) : findElementoAlteradoAnterior(ref, state, ignorarRevisoesDeExclusao);

  if (!elementoAlterado) {
    state.ui.events = [];
    return state;
  }

  let pagina = state.ui?.paginacao?.paginaSelecionada;
  const eventos: StateEvent[] = [];

  // Se a articulação tiver mais de uma página, verifica se o elemento alterado está em outra página
  if (hasMultiplasPaginas(state)) {
    ref = getDispositivoFromElemento(state.articulacao, elementoAlterado, true);
    if (!ref) {
      // O elemento corresponde a um dispositivo excluído em modo de revisão
      // Nesse caso, é utilizado o elemento anterior na sequência de leitura para descobrir a página onde aparece a revisão de exclusão
      ref = getDispositivoFromElemento(state.articulacao, elementoAlterado.elementoAnteriorNaSequenciaDeLeitura!, true);
    }

    if (ref) {
      pagina = findPaginaByUuidDispositivo(state.ui.paginacao, ref.uuid!);
      if (pagina !== state.ui.paginacao.paginaSelecionada) {
        eventos.push({
          stateType: StateType.PaginaArticulacaoSelecionada,
          elementos: getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao(state),
        });
      }
    }
  }

  eventos.push(
    ...[
      {
        stateType: StateType.ElementoMarcado,
        elementos: [elementoAlterado],
      },
      {
        stateType: StateType.ElementoSelecionado,
        elementos: [elementoAlterado],
      },
    ]
  );

  return {
    ...state,
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
      paginacao: {
        ...state.ui?.paginacao,
        paginaSelecionada: pagina,
      },
    },
  };
};

const findProximoElementoAlterado = (ref: Dispositivo, state: State, ignorarRevisoesDeExclusao: boolean): Elemento | undefined => {
  const revisoes = state.revisoes?.filter(isRevisaoElemento).filter(isRevisaoPrincipal) as RevisaoElemento[];
  const revisoesDeExclusao = revisoes?.filter(isRevisaoDeExclusao);

  let atual: Dispositivo | undefined = ref;
  do {
    atual = getDispositivoPosteriorNaSequenciaDeLeitura(atual, d => !isCaput(d));
    if (!atual) return undefined;
    if (isAlterado(atual, revisoes)) return createElemento(atual);
    if (ignorarRevisoesDeExclusao) continue;
    const elemento = revisoesDeExclusao.find(r => r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.uuid === atual!.uuid)?.elementoAposRevisao;
    if (elemento) return elemento as Elemento;
  } while (atual);
  return undefined;
};

const findElementoAlteradoAnterior = (ref: Dispositivo, state: State, ignorarRevisoesDeExclusao: boolean): Elemento | undefined => {
  const revisoes = state.revisoes?.filter(isRevisaoElemento).filter(isRevisaoPrincipal) as RevisaoElemento[];
  const revisoesDeExclusao = revisoes?.filter(isRevisaoDeExclusao);

  let ementa: Dispositivo | undefined = undefined;
  let atual: Dispositivo | undefined = ref;
  do {
    atual = getDispositivoAnteriorNaSequenciaDeLeitura(atual, d => !isCaput(d));
    if (!atual) {
      if (!ementa) {
        return undefined;
      } else {
        atual = ementa;
      }
    }
    if (isAlterado(atual, revisoes)) return createElemento(atual);
    if (ignorarRevisoesDeExclusao) continue;
    const elemento = revisoesDeExclusao.find(r => r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.uuid === atual!.uuid)?.elementoAposRevisao;
    if (elemento) return elemento as Elemento;
    if (atual.tipo === 'Articulacao') ementa = (atual as Articulacao).projetoNorma?.ementa;
    if (atual.tipo === 'Ementa') return undefined;
  } while (atual);
  return undefined;
};

const isAlterado = (d: Dispositivo, revisoes: RevisaoElemento[]): boolean => {
  return !isArticulacao(d) && (isAdicionado(d) || isModificado(d) || isSuprimido(d) || !!findRevisaoByElementoUuid(revisoes, d.uuid!));
};

const getDispositivoReferenciaFromRevisaoExclusao = (revisao: RevisaoElemento, state: State, action: any): Dispositivo | undefined => {
  const revisaoPrincipal = isRevisaoPrincipal(revisao) ? revisao : findRevisaoElementoPrincipal(state, state.revisoes!, revisao);
  if (!revisaoPrincipal) return undefined;
  const ref = getDispositivoFromElemento(state.articulacao!, revisaoPrincipal.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!, true);
  if (!ref) return undefined;

  // O dispositivo retornado será o anterior ou posterior ao dispositivo excluído, dependendo da direção da navegação
  // Se a direção for 'proximo', o dispositivo retornado será o ANTERIOR ao dispositivo excluído
  // Se a direção for 'anterior', o dispositivo retornado será o POSTERIOR ao dispositivo excluído
  return action.direcao === 'proximo' ? ref : getDispositivoPosteriorNaSequenciaDeLeitura(ref, d => !isCaput(d));
};
