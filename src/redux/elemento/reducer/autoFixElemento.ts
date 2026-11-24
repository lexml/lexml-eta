import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isAgrupador, isArtigo, isIncisoCaput, isOmissis, isPena } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, createElementoValidado, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { criaDispositivo } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  buscaProximoOmissis as buscaProximoOmissisSequencial,
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnterior,
  getDispositivoPosterior,
  getUltimoFilho,
  hasFilhos,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { RemissaoExternaValue } from '../../../model/remissao';
import { AutoFix } from '../../../model/lexml/util/mensagem';
import { State, StateEvent, StateType } from '../../state';
import { Eventos } from '../evento/eventos';
import { buildEventoAtualizacaoElemento, buildUpdateEvent } from '../evento/eventosUtil';
import { buildPast } from '../util/stateReducerUtil';
import { remissoesDoArtigo } from './remissoesDoArtigo';
import { solicitaNorma } from './solicitaNorma';

const hasFix = (dispositivo: Dispositivo): boolean => {
  return (dispositivo.mensagens?.filter(m => m.fix) ?? []).length > 0;
};

// O que a renumeração automática pode alterar: o grupo do dispositivo (e, em agrupador, todos os artigos).
const getEscopoDaRenumeracao = (atual: Dispositivo): Dispositivo[] => {
  if (isArtigo(atual)) {
    return getArticulacao(atual).artigos;
  }
  const irmaos = atual.pai!.filhos.filter(f => !isPena(f));
  return isAgrupador(atual) ? [...irmaos.filter(isAgrupador), ...getArticulacao(atual).artigos] : irmaos;
};

const snapshot = (dispositivo: Dispositivo): { dispositivo: Dispositivo; original: Elemento; descendentes: Elemento[] } => ({
  dispositivo,
  original: createElemento(dispositivo),
  descendentes: getDispositivoAndFilhosAsLista(dispositivo)
    .slice(1)
    .map(d => createElemento(d)),
});

// Renumera o grupo e guarda no histórico o estado anterior (par antes/depois), como a renumeração manual: desfazer restaura a repetição.
const corrigeNumeracaoRepetida = (state: any, atual: Dispositivo | undefined): State => {
  const oferecida = atual && validaDispositivo(atual).some(m => m.descricao === AutoFix.NUMERACAO_REPETIDA && m.fix);
  if (!atual || !oferecida) {
    state.ui.events = [];
    return state;
  }

  const antes = getEscopoDaRenumeracao(atual).map(snapshot);
  if (isArtigo(atual)) {
    getArticulacao(atual).renumeraArtigos();
  } else {
    atual.pai!.renumeraFilhos();
  }

  const modificados: Elemento[] = [];
  const renumerados: Elemento[] = [];
  const descendentes: Elemento[] = [];
  antes.forEach(({ dispositivo, original, descendentes: descendentesAntes }) => {
    dispositivo.mensagens = validaDispositivo(dispositivo);
    const depois = createElemento(dispositivo);
    const filhosDepois = getDispositivoAndFilhosAsLista(dispositivo).slice(1);
    const mudaramFilhos = filhosDepois.map(d => createElemento(d)).filter((d, i) => d.lexmlId !== descendentesAntes[i]?.lexmlId);
    if (original.numero !== depois.numero || original.rotulo !== depois.rotulo) {
      modificados.push(original, depois);
      renumerados.push(depois);
    }
    descendentes.push(...mudaramFilhos);
  });

  if (!modificados.length) {
    state.ui.events = [];
    return state;
  }

  const eventosPast: StateEvent[] = [{ stateType: StateType.ElementoModificado, elementos: modificados, renumeracaoAutomatica: true }];
  const eventos = new Eventos();
  eventos.add(StateType.ElementoRenumerado, renumerados);
  if (descendentes.length) {
    eventosPast.push({ stateType: StateType.SituacaoElementoModificada, elementos: descendentes });
    eventos.add(StateType.SituacaoElementoModificada, descendentes);
  }
  // O clique em "Corrigir agora" deixa o cursor no painel da mensagem, que é removido: devolve-o ao conteúdo do dispositivo.
  eventos.add(StateType.ElementoMarcado, [createElemento(atual)]);
  eventos.add(StateType.ElementoSelecionado, [createElemento(atual)]);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventosPast),
    present: eventos.build(),
    future: [],
    ui: { events: eventos.build(), alertas: state.ui?.alertas },
  };
};

// A mensagem existe só na tela (não está em dispositivo.mensagens), por isso não passa pela guarda hasFix; a URN alvo precisa constar no registro do artigo.
const corrigeNormaAlteradaDivergente = (state: any, atual: Dispositivo | undefined, urn: string | undefined): State => {
  const urnNoRegistro = Object.values<RemissaoExternaValue>(state.remissoesExternas ?? {}).some(r => r.sourceUuid === atual?.uuid && r.targetUrn === urn);

  if (!atual?.alteracoes || !urn || !urnNoRegistro) {
    state.ui.events = [];
    return state;
  }

  const original = createElemento(atual);
  atual.alteracoes.base = urn;

  const eventos = new Eventos();
  eventos.add(StateType.ElementoValidado, [createElementoValidado(atual, true)]);

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, buildUpdateEvent(atual, original)),
    present: buildEventoAtualizacaoElemento(atual).build(),
    future: state.future,
    ui: { events: eventos.build(), alertas: state.ui?.alertas },
  };
};

export const autoFixElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (action.mensagem?.detalhe?.autoFix === AutoFix.NORMA_ALTERADA_DIVERGENTE) {
    const { uuid, urn } = action.mensagem.detalhe;
    return corrigeNormaAlteradaDivergente(state, uuid === undefined ? atual : getDispositivoFromElemento(state.articulacao, { uuid }, true), urn);
  }

  if (action.mensagem?.descricao === AutoFix.NUMERACAO_REPETIDA) {
    // Mensagem só calculada na validação: não está em dispositivo.mensagens, então não passa pela guarda hasFix.
    return corrigeNumeracaoRepetida(state, atual);
  }

  if (atual === undefined || !hasFix(atual)) {
    state.ui.events = [];
    return state;
  }

  const eventos = new Eventos();

  switch (action.mensagem?.descricao) {
    case AutoFix.INFORMAR_NORMA: {
      // Com uma única remissão externa a norma é conhecida: preenche sem abrir o diálogo.
      const unica = isArtigo(atual) && !atual.alteracoes?.base ? remissoesDoArtigo(state.remissoesExternas, atual as Artigo) : [];
      return unica.length === 1 ? corrigeNormaAlteradaDivergente(state, atual, unica[0].targetUrn) : solicitaNorma(state, action);
    }
    case AutoFix.OMISSIS_ANTES: {
      const anterior = getDispositivoAnterior(atual);

      const novo = criaDispositivo(atual.pai!, TipoDispositivo.omissis.tipo, anterior, anterior ? undefined : 0);
      novo.existeNaNormaAlterada = true;
      novo.mensagens = validaDispositivo(novo);
      const elementoNovo = createElemento(novo, true);

      atual.mensagens = validaDispositivo(atual);
      const elementoAtual = createElemento(atual);
      eventos.add(StateType.ElementoIncluido, [elementoNovo]);
      eventos.add(StateType.ElementoValidado, [elementoAtual]);

      let ref;

      if (anterior) {
        ref = isArtigo(anterior) && hasFilhos(anterior) ? getUltimoFilho(anterior) : anterior;
      } else {
        ref = isIncisoCaput(atual) ? atual.pai!.pai! : atual.pai!;
      }

      eventos.setReferencia(createElemento(ref));
      break;
    }
    case AutoFix.OMISSIS_SEQUENCIAIS: {
      const removido = createElemento(atual);
      let proximo = getDispositivoPosterior(atual);

      if (!proximo || !isOmissis(proximo)) {
        proximo = buscaProximoOmissisSequencial(atual.pai!);
      }

      const pai = atual.pai!;
      pai.removeFilho(atual);
      pai.renumeraFilhos();

      eventos.add(StateType.ElementoRemovido, [removido]);
      proximo && eventos.add(StateType.ElementoValidado, [createElemento(proximo)]);

      break;
    }
    default:
      state.ui.events = [];
      return state;
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: [],
    ui: {
      events: eventos.build(),
      alertas: state.ui?.alertas,
    },
  };
};
