import { DescricaoSituacao } from './../../../model/dispositivo/situacao';
import { Elemento } from '../../../model/elemento';
import { REDO } from '../../../model/lexml/acao/redoAction';
import { UNDO } from '../../../model/lexml/acao/undoAction';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { formatDateTime } from '../../../util/date-util';
import { State, StateEvent, StateType } from '../../state';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { LocalizadorElemento } from '../../../model/elemento/elemento';

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

  getElementosFromEventos(eventos).forEach(e => {
    const revisao = findRevisao(state.revisoes, e);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, e)!;
      const eAux = revisao?.elementoAntesRevisao || (JSON.parse(JSON.stringify(d.situacao.dispositivoOriginal)) as Elemento);
      result.push(new RevisaoElemento(actionType, StateType.ElementoSuprimido, '', state.usuario!, formatDateTime(new Date()), eAux, montarLocalizadorElemento(e), undefined));
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
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      if (revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, e)) {
        revisoesParaRemover.push(...montarListaDeRevisoesParaRemover(state, revisao));
      }
    } else {
      const eAux = getElementoAntesModificacao(state, e);
      result.push(new RevisaoElemento(actionType, StateType.ElementoModificado, '', state.usuario!, formatDateTime(new Date()), eAux, montarLocalizadorElemento(e), undefined));
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
        // revisao.uuidRevisado = incluidos[index].uuid!;
        revisao.localizadorElementoRevisado = montarLocalizadorElemento(incluidos[index]);
        revisao.usuario = state.usuario!;
      }
    });
  } else {
    removidos.forEach((e, index) => {
      // const revExclusao = new RevisaoElemento(actionType, StateType.ElementoRemovido, '', state.usuario!, formatDateTime(new Date()), e, e.uuid!, e.elementoAnteriorNaSequenciaDeLeitura?.uuid);
      // eslint-disable-next-line prettier/prettier
      const revInclusao = new RevisaoElemento(
        actionType,
        StateType.ElementoIncluido,
        '',
        state.usuario!,
        formatDateTime(new Date()),
        e,
        montarLocalizadorElemento(incluidos[index]),
        undefined
      );
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
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      result.push(new RevisaoElemento(actionType, StateType.ElementoIncluido, '', state.usuario!, formatDateTime(new Date()), undefined, montarLocalizadorElemento(e), undefined));
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
    const revisao = findRevisao(state.revisoes, e);
    if (revisao) {
      revisoesParaRemover.push(revisao);
    } else {
      const eAux = JSON.parse(JSON.stringify(e)) as Elemento;
      result.push(
        // eslint-disable-next-line prettier/prettier
        new RevisaoElemento(
          actionType,
          StateType.ElementoRemovido,
          '',
          state.usuario!,
          formatDateTime(new Date()),
          eAux,
          montarLocalizadorElemento(e),
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

    const revisao = findRevisao(state.revisoes, elementoAnterior);
    if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === eAux.descricaoSituacao && revisaoDeElementoComMesmoLexmlIdRotuloEConteudo(revisao, eAux)) {
      revisoesParaRemover.push(revisao);
    } else {
      const d = getDispositivoFromElemento(state.articulacao!, elementoAnterior);
      const eAux = d?.situacao.dispositivoOriginal || elementoAnterior;
      result.push(
        // eslint-disable-next-line prettier/prettier
        new RevisaoElemento(
          actionType,
          StateType.ElementoRestaurado,
          '',
          state.usuario!,
          formatDateTime(new Date()),
          revisao?.elementoAntesRevisao || eAux,
          montarLocalizadorElemento(eAux),
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

const getRevisoesElemento = (revisoes: Revisao[] = []): RevisaoElemento[] => {
  return revisoes.filter(r => r instanceof RevisaoElemento).map(r => r as RevisaoElemento);
};

const findRevisao = (revisoes: Revisao[] = [], elemento: Elemento): RevisaoElemento | undefined => {
  // return getRevisoesElemento(revisoes).find(r => r.uuidRevisado === elemento.uuid);
  return getRevisoesElemento(revisoes).find(r => r.localizadorElementoRevisado.uuid === elemento.uuid);
};

const isAcaoMover = (state: State): boolean => {
  const incluidos = getEventos(state, StateType.ElementoIncluido);
  const removidos = getEventos(state, StateType.ElementoRemovido);
  return !!incluidos.length && incluidos.length === removidos.length;
};

const existeRevisaoParaElementos = (revisoes: Revisao[] = [], elementos: Elemento[]): boolean => {
  const revisoesElemento = getRevisoesElemento(revisoes);
  // return elementos.every(e => revisoesElemento.some(r => r.uuidRevisado === e.uuid));
  return elementos.every(e => revisoesElemento.some(r => r.localizadorElementoRevisado.uuid === e.uuid));
};

const findRevisaoById = (revisoes: Revisao[] = [], idRevisao: string): Revisao | undefined => {
  return revisoes?.find(r => r.id === idRevisao);
};

const montarListaDeRevisoesParaRemover = (state: State, revisao: Revisao): Revisao[] => {
  const result = [revisao];
  // if (revisao.idRevisaoAssociada) {
  //   const revisaoAssociada = findRevisaoById(state.revisoes, revisao.idRevisaoAssociada);
  //   revisaoAssociada && result.push(revisaoAssociada);
  // }
  if (revisao.idsRevisoesAssociadas.length) {
    revisao.idsRevisoesAssociadas.forEach(id => {
      const revisaoAssociada = findRevisaoById(state.revisoes, id);
      revisaoAssociada && result.push(revisaoAssociada);
    });
  }
  return result;
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
