import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State, StateEvent, StateType } from '../../state';

export const atualizaRevisao = (state: State, actionType: any): State => {
  const numElementos = state.ui?.events.map(se => se.elementos).flat().length;
  if (!state.emRevisao || !actionType || !numElementos) {
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

  state.ui?.events.forEach(se => se.elementos?.forEach(e => (e.revisao = findRevisao(state.revisoes, e))));

  return state;
};

const processaEventosDeSupressao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoSuprimido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  const elementos = getElementosFromEventos(eventos);

  if (!elementos.length) {
    return [];
  }

  elementos.forEach(e => {
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      const eAux = JSON.parse(JSON.stringify(e)) as Elemento;
      eAux.descricaoSituacao = DescricaoSituacao.DISPOSITIVO_SUPRIMIDO;
      result.push(new RevisaoElemento(actionType, StateType.ElementoSuprimido, '', state.usuario!, formatDateTime(new Date()), eAux, e.uuid!, undefined));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeModificacao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoModificado);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  const elementos = getElementosFromEventos(eventos);

  elementos.forEach(e => {
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      if (revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, e)) {
        revisoesParaRemover.push(...montarListaDeRevisoesParaRemover(state, revisao));
      }
    } else {
      const eAux = JSON.parse(JSON.stringify(e)) as Elemento;
      // eAux.descricaoSituacao = DescricaoSituacao.DISPOSITIVO_MODIFICADO;
      result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, e.uuid!, undefined));
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
      const revisao = findRevisao(state.revisoes, e)!;
      if (revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, incluidos[index])) {
        revisoesParaRemover.push(...montarListaDeRevisoesParaRemover(state, revisao));
      } else {
        revisao.actionType = actionType;
        revisao.dataHora = formatDateTime(new Date());
        revisao.usuario = state.usuario!;
        revisao.uuidRevisado = incluidos[index].uuid!;
      }
    });
  } else {
    removidos.forEach((e, index) => {
      // eslint-disable-next-line prettier/prettier
      const revExclusao = new RevisaoElemento(
        actionType,
        StateType.ElementoRemovido,
        '',
        state.usuario!,
        formatDateTime(new Date()),
        e,
        e.uuid!,
        e.elementoAnteriorNaSequenciaDeLeitura?.uuid
      );
      const revInclusao = new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), e, incluidos[index].uuid!, undefined);
      revExclusao.idRevisaoAssociada = revInclusao.id;
      revInclusao.idRevisaoAssociada = revExclusao.id;
      result.push(revExclusao);
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

  const elementos = getElementosFromEventos(eventos);

  if (!elementos.length) {
    return [];
  }

  elementos.forEach(e => {
    // const revisao = revisoes?.find(r => r.uuidRevisado === e.uuid || revisaoDeElementoExcluidoComMesmoLexmlIdRotuloEConteudo(r, e));
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      result.push(new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), undefined, e.uuid!, undefined));
    }
  });

  state.revisoes = state.revisoes?.filter(r => !revisoesParaRemover.includes(r));

  return result;
};

const processaEventosDeRemocao = (state: State, actionType: any): Revisao[] => {
  const eventos = getEventos(state, StateType.ElementoRemovido);

  const result: Revisao[] = [];
  const revisoesParaRemover: Revisao[] = [];

  const elementos = getElementosFromEventos(eventos);

  if (!elementos.length) {
    return [];
  }

  elementos.forEach(e => {
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      result.push(
        new RevisaoElemento(actionType, StateType.ElementoRemovido, '', state.usuario!, formatDateTime(new Date()), e, e.uuid!, e.elementoAnteriorNaSequenciaDeLeitura?.uuid)
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

  // const types = [StateType.ElementoModificado, StateType.ElementoSuprimido];

  eventos.forEach(se => {
    const e = se.elementos![0];
    // const revisao = state.revisoes?.find(r => r.uuidRevisado === e.uuid && types.includes(r.stateType));
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      result.push(new RevisaoElemento(actionType, StateType.ElementoRestaurado, '', state.usuario!, formatDateTime(new Date()), e, e.uuid!, undefined));
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
  return (
    // r.stateType === StateType.ElementoRemovido &&
    r.elementoAntesRevisao?.lexmlId === e.lexmlId && r.elementoAntesRevisao?.rotulo === e.rotulo && r.elementoAntesRevisao?.conteudo?.texto === e.conteudo?.texto
  );
};

const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(r => r instanceof RevisaoElemento).map(r => r as RevisaoElemento);
};

const findRevisao = (revisoes: Revisao[] = [], elemento: Elemento): RevisaoElemento | undefined => {
  return getRevisoesElemento(revisoes).find(r => r.uuidRevisado === elemento.uuid);
};

const isAcaoMover = (state: State): boolean => {
  const incluidos = getEventos(state, StateType.ElementoIncluido);
  const removidos = getEventos(state, StateType.ElementoRemovido);
  return !!incluidos.length && incluidos.length === removidos.length;
};

const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  return elementos.every(e => revisoesElemento.some(r => r.uuidRevisado === e.uuid));
};

const findRevisaoById = (revisoes: Revisao[] = [], idRevisao: string): Revisao | undefined => {
  return revisoes?.find(r => r.id === idRevisao);
};

const montarListaDeRevisoesParaRemover = (state: State, revisao: Revisao): Revisao[] => {
  const result = [revisao];
  if (revisao.idRevisaoAssociada) {
    const revisaoAssociada = findRevisaoById(state.revisoes, revisao.idRevisaoAssociada);
    revisaoAssociada && result.push(revisaoAssociada);
  }
  return result;
};
