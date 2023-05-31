import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State, StateEvent, StateType } from '../../state';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { LocalizadorElemento } from '../../../model/elemento/elemento';
import {
  identificarRevisaoElementoPai,
  findRevisaoByElementoUuid,
  montarListaDeRevisoesParaRemover,
  existeRevisaoParaElementos,
  buildDescricaoUndoRedoRevisaoElemento,
} from '../util/revisaoUtil';
import { aceitarRevisaoAction } from '../../../model/lexml/acao/aceitarRevisaoAction';
import { rejeitarRevisaoAction } from '../../../model/lexml/acao/rejeitarRevisaoAction';

export const atualizaRevisao = (state: State, actionType: any): State => {
  const numElementos = state.ui?.events.map(se => se.elementos).flat().length;
  if (!state.emRevisao || !actionType || !numElementos) {
    associarRevisoesAosElementos(state);
    return state;
  }

  if (UNDO === actionType && (state.past?.length || 0) < state.numEventosPassadosAntesDaRevisao!) {
    return state;
  }

  if (REDO === actionType && (state.past?.length || 0) <= state.numEventosPassadosAntesDaRevisao!) {
    return state;
  }

  const revisoes: Revisao[] = [];
  revisoes.push(...processaEventosDeSupressao(state, actionType));
  revisoes.push(...processaEventosDeModificacao(state, actionType));
  revisoes.push(...processaEventosDeRestauracao(state, actionType));
  // revisoes.push(...processaEventosDeRenumeracao(state, actionType, elementoAntesAcao));

  if (isAcaoMover(state)) {
    revisoes.push(...processaEventosDeMover(state, actionType));
  } else {
    revisoes.push(...processaEventosDeInclusao(state, actionType));
    revisoes.push(...processaEventosDeRemocao(state, actionType));
  }

  state.revisoes!.push(...revisoes);
  state.revisoes = identificarRevisaoElementoPai(state.revisoes);

  associarRevisoesAosElementos(state);

  adicionarOpcoesAoMenu(state);

  return state;
};

const associarRevisoesAosElementos = (state: State): void => {
  state.ui?.events.forEach(se => se.elementos?.forEach(e => (e.revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid))));
};

const processaEventosDeSupressao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoSuprimido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, e)!;
      const eAux = revisao?.elementoAntesRevisao || (JSON.parse(JSON.stringify(d.situacao.dispositivoOriginal)) as Elemento);
      // result.push(new RevisaoElemento(actionType, StateType.ElementoSuprimido, '', state.usuario!, formatDateTime(new Date()), eAux, montarLocalizadorElemento(e), undefined));
      result.push(new RevisaoElemento(actionType, StateType.ElementoSuprimido, '', state.usuario!, formatDateTime(new Date()), eAux, JSON.parse(JSON.stringify(e)), undefined));
      if (revisao) {
        revisoesParaRemover.push(revisao);
      }
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeModificacao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoModificado);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao) {
      if (revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, e)) {
        revisoesParaRemover.push(...montarListaDeRevisoesParaRemover(state, revisao));
      }
    } else {
      const eAux = getElementoAntesModificacao(state, e);
      // result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, montarLocalizadorElemento(e), undefined));
      result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, JSON.parse(JSON.stringify(e)), undefined));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeMover = (state: State, actionType: any): Revisao[] => {
  const incluidos = getElementosFromEventos(getEventos(state, StateType.ElementoIncluido));
  const removidos = getElementosFromEventos(getEventos(state, StateType.ElementoRemovido));

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  if (existeRevisaoParaElementos(state.revisoes, removidos)) {
    removidos.forEach((e, index) => {
      const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid)!;
      if (revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, incluidos[index])) {
        revisoesParaRemover.push(...montarListaDeRevisoesParaRemover(state, revisao));
      } else {
        revisao.actionType = actionType;
        revisao.dataHora = formatDateTime(new Date());
        // revisao.localizadorElementoRevisado = montarLocalizadorElemento(incluidos[index]);
        revisao.elementoAposRevisao = JSON.parse(JSON.stringify(incluidos[index]));
        revisao.usuario = state.usuario!;
        revisao.descricao = buildDescricaoUndoRedoRevisaoElemento(revisao, incluidos[index]);
      }
    });
  } else {
    removidos.forEach((e, index) => {
      // const revExclusao = new RevisaoElemento(actionType, StateType.ElementoRemovido, '', state.usuario!, formatDateTime(new Date()), e, e.uuid!, e.elementoAnteriorNaSequenciaDeLeitura?.uuid);

      // const revInclusao = new RevisaoElemento(
      //   actionType,
      //   StateType.ElementoIncluido,
      //   '',
      //   state.usuario!,
      //   formatDateTime(new Date()),
      //   e,
      //   montarLocalizadorElemento(incluidos[index]),
      //   undefined
      // );
      const revInclusao = new RevisaoElemento(
        actionType,
        StateType.ElementoIncluido,
        '',
        state.usuario!,
        formatDateTime(new Date()),
        JSON.parse(JSON.stringify(e)),
        JSON.parse(JSON.stringify(incluidos[index])),
        undefined
      );

      revInclusao.descricao = buildDescricaoUndoRedoRevisaoElemento(revInclusao, incluidos[index]);
      // revExclusao.idRevisaoAssociada = revInclusao.id;
      // revInclusao.idRevisaoAssociada = revExclusao.id;
      // result.push(revExclusao);
      result.push(revInclusao);
    });
  }

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeInclusao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoIncluido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      // result.push(new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), undefined, montarLocalizadorElemento(e), undefined));
      result.push(new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), undefined, JSON.parse(JSON.stringify(e)), undefined));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeRemocao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoRemovido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisaoByElementoUuid(state.revisoes, e.uuid);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      const eAux = JSON.parse(JSON.stringify(e)) as Elemento;
      // result.push(
      //   new RevisaoElemento(
      //     actionType,
      //     StateType.ElementoRemovido,
      //     '',
      //     state.usuario!,
      //     formatDateTime(new Date()),
      //     eAux,
      //     montarLocalizadorElemento(e),
      //     e.elementoAnteriorNaSequenciaDeLeitura && montarLocalizadorElemento(e.elementoAnteriorNaSequenciaDeLeitura)
      //   )
      // );
      result.push(
        new RevisaoElemento(
          actionType,
          StateType.ElementoRemovido,
          '',
          state.usuario!,
          formatDateTime(new Date()),
          eAux,
          { ...eAux, acoesPossiveis: [] },
          e.elementoAnteriorNaSequenciaDeLeitura && montarLocalizadorElemento(e.elementoAnteriorNaSequenciaDeLeitura)
        )
      );
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeRestauracao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoRestaurado);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  eventos.forEach(se => {
    const elementoAtual = se.elementos![1];
    const elementoAnterior = se.elementos![0];
    const eAux = elementoAtual || elementoAnterior;

    const revisao = findRevisaoByElementoUuid(state.revisoes, elementoAnterior.uuid);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === eAux.descricaoSituacao && revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, eAux)) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, elementoAnterior);
      const eAux = d?.situacao.dispositivoOriginal || elementoAnterior;
      // result.push(
      //   new RevisaoElemento(
      //     actionType,
      //     StateType.ElementoRestaurado,
      //     '',
      //     state.usuario!,
      //     formatDateTime(new Date()),
      //     revisao?.elementoAntesRevisao || eAux,
      //     montarLocalizadorElemento(eAux),
      //     undefined
      //   )
      // );
      result.push(
        new RevisaoElemento(
          actionType,
          StateType.ElementoRestaurado,
          '',
          state.usuario!,
          formatDateTime(new Date()),
          revisao?.elementoAntesRevisao || eAux,
          JSON.parse(JSON.stringify(eAux)),
          undefined
        )
      );
      if (revisao) {
        revisoesParaRemover.push(revisao);
      }
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const getEventos = (state: State, stateType: StateType): StateEvent[] => {
  return state.ui?.events.filter(se => se.stateType === stateType) || [];
};

const getElementosFromEventos = (eventos: StateEvent[]): Elemento[] => {
  return removeDuplicidades(eventos.map(se => se.elementos || []).flat());
};

const removeDuplicidades = (elementos: Elemento[]): Elemento[] => {
  const map = new Map<number, Elemento>();
  const result: Elemento[] = [];
  elementos.reverse().forEach(e => {
    if (!map.has(e.uuid!)) {
      map.set(e.uuid!, e);
      result.unshift(e);
    }
  });
  return result;
};

const revisaoDeElementoComMesmoLexmlIdRotuloEConteudo = (r: RevisaoElemento, e: Elemento): boolean => {
  return r.elementoAntesRevisao?.lexmlId === e.lexmlId && r.elementoAntesRevisao?.rotulo === e.rotulo && r.elementoAntesRevisao?.conteudo?.texto === e.conteudo?.texto;
};

const isAcaoMover = (state: State): boolean => {
  const incluidos = getEventos(state, StateType.ElementoIncluido);
  const removidos = getEventos(state, StateType.ElementoRemovido);
  return !!incluidos.length && incluidos.length === removidos.length;
};

const getElementoAntesModificacao = (state: State, elemento: Elemento): Elemento | undefined => {
  const eventos = [...state.past!].pop() as any as StateEvent[];
  const modificacoes = eventos.filter(se => se.stateType === StateType.ElementoModificado && se.elementos?.some(e => e.uuid === elemento.uuid));
  const modificacao = modificacoes.pop();
  return modificacao ? JSON.parse(JSON.stringify(modificacao.elementos![0])) : undefined;
};

const montarLocalizadorElemento = (elemento: Partial<Elemento>): LocalizadorElemento => {
  return { uuid: elemento.uuid!, lexmlId: elemento.lexmlId! };
};

const adicionarOpcoesAoMenu = (state: State): void => {
  state.ui?.events.forEach(se =>
    se.elementos?.forEach(e => {
      if (e.revisao && !e.revisao.idRevisaoElementoPrincipal) {
        e.acoesPossiveis = se.stateType === StateType.ElementoRemovido ? [] : [...(e.acoesPossiveis || [])];
        !e.acoesPossiveis.includes(aceitarRevisaoAction) && e.acoesPossiveis.push(aceitarRevisaoAction);
        !e.acoesPossiveis.includes(rejeitarRevisaoAction) && e.acoesPossiveis.push(rejeitarRevisaoAction);
      }
    })
  );
};
