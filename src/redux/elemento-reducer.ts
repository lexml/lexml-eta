import { Articulacao } from '../model/dispositivo/dispositivo';
import { isAgrupador, TipoDispositivo } from '../model/dispositivo/tipo';
import { Elemento } from '../model/elemento';
import { createElemento, createElementos, getDispositivoFromElemento, getElementos, listaDispositivosRenumerados } from '../model/elemento/elemento-util';
import { getAcaoPossivelShift, getAcaoPossivelShiftTab } from '../model/lexml/acoes/acoes.possiveis';
import { validaDispositivo } from '../model/lexml/dispositivo/dispositivo-validator';
import { DispositivoLexmlFactory } from '../model/lexml/factory/dispositivo-lexml-factory';
import { getDispositivoAnterior, isArtigoUnico, isParagrafoUnico } from '../model/lexml/hierarquia/hierarquia-util';
import { ArticulacaoParser } from '../model/lexml/service/articulacao-parser';
import { converteDispositivo, copiaFilhos } from '../model/lexml/tipo/tipo-util';
import {
  ADD_ELEMENTO,
  ChangeElemento,
  CHANGE_ELEMENTO,
  ELEMENTO_SELECIONADO,
  NOVA_ARTICULACAO,
  OPEN_ARTICULACAO,
  REDO,
  REMOVE_ELEMENTO,
  SHIFT_TAB,
  TAB,
  UNDO,
  UPDATE_ELEMENTO,
  VALIDA_ELEMENTO,
} from './elemento-actions';
import {
  buildEventoAdicionarElemento,
  buildEventoAtualizacaoElemento,
  buildEventoTransformacaooElemento,
  buildFuture,
  buildPast,
  buildUpdateEvent,
  createElementoValidado,
  getElementosDoDispositivo,
  isNovoDispositivoDesmembrandoAtual,
  isOrWasUnico,
  naoPodeCriarFilho,
  redoDispositivosExcluidos,
  removeAndBuildEvents,
  textoFoiModificado,
  validaDispositivosAfins,
} from './elemento-reducer-util';
import { StateEvent, StateType } from './state';

export interface ElementoState {
  articulacao?: Articulacao;
  past?: StateEvent[];
  future?: StateEvent[];
  ui?: {
    events: StateEvent[];
  };
}

export const adicionaElemento = (state: any, action: any): ElementoState => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    throw new Error('Elemento não encontrado');
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action)) {
    atual!.texto = action.atual?.conteudo?.texto ?? '';
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual) || isAgrupador(atual)) {
    return state;
  }

  const novo = DispositivoLexmlFactory.createFilhoByReferencia(atual);
  novo!.texto = action.novo?.conteudo?.texto ?? '';

  if (isNovoDispositivoDesmembrandoAtual(novo)) {
    copiaFilhos(atual, novo);
  }

  novo.pai!.renumeraFilhos();

  const eventos = buildEventoAdicionarElemento(atual, novo);

  const elementoAtualAtualizado = createElementoValidado(atual);

  if (isNovoDispositivoDesmembrandoAtual(novo) && elementosRemovidos && elementosRemovidos.length > 0) {
    eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(novo)) {
    eventos.add(StateType.ElementoModificado, [elementoAtualOriginal, elementoAtualAtualizado]);
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
  }

  if (isOrWasUnico(atual, originalmenteUnico)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
    eventos.add(StateType.ElementoRenumerado, [elementoAtualAtualizado]);
  }

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    future: state.future,

    ui: {
      events: eventos.build(),
    },
  };
};

export const selecionaElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }

  validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.ElementoSelecionado,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    past: state.past,
    future: state.future,
    ui: {
      events,
    },
  };
};

export const validaElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }

  validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    past: state.past,
    future: state.future,
    ui: {
      events,
    },
  };
};

export const atualizaElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual);

  if (dispositivo === undefined) {
    throw new Error('Elemento não encontrado');
  }

  const past = buildPast(state, buildUpdateEvent(dispositivo));

  dispositivo.texto = action.atual.conteudo?.texto ?? '';

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    past,
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

const redoIncludedElements = (state: any, evento: StateEvent): StateEvent[] => {
  if (evento === undefined || evento.elementos === undefined || evento.elementos[0] === undefined) {
    return [];
  }

  const elemento = evento.elementos[0];
  const dispositivo = getDispositivoFromElemento(state.articulacao, elemento);

  if (dispositivo === undefined) {
    throw new Error('Elemento não encontrado');
  }

  return removeAndBuildEvents(state.articulacao, dispositivo);
};

const redoRemovedElements = (state: any, evento: StateEvent): StateEvent[] => {
  if (evento === undefined || evento.elementos === undefined || evento.elementos[0] === undefined) {
    return [];
  }
  const elemento = evento.elementos[0];
  const posicao = elemento!.hierarquia!.posicao;
  const pai = getDispositivoFromElemento(state.articulacao, elemento!.hierarquia!.pai!);
  const novo = redoDispositivosExcluidos(state.articulacao, evento.elementos);
  pai?.renumeraFilhos();

  const referencia = posicao === 0 ? pai : getDispositivoAnterior(novo);

  const eventos = buildEventoAdicionarElemento(referencia!, novo);

  eventos.add(StateType.ElementoIncluido, evento.elementos);

  return eventos.build();
};

const redoModifiedElements = (state: any, evento: StateEvent): StateEvent[] => {
  if (evento === undefined || evento.elementos === undefined || evento.elementos[0] === undefined) {
    return [];
  }

  const dispositivo = getDispositivoFromElemento(state.articulacao, evento.elementos[0]);

  if (dispositivo === undefined) {
    throw new Error('Elemento não encontrado');
  }

  dispositivo.texto = evento.elementos[0].conteudo?.texto ?? '';

  const elementoOriginal = createElemento(dispositivo);
  elementoOriginal.mensagens = validaDispositivo(dispositivo);

  return [
    {
      stateType: StateType.ElementoModificado,
      elementos: [elementoOriginal],
    },
    {
      stateType: StateType.ElementoValidado,
      elementos: validaDispositivosAfins(dispositivo, true),
    },
  ];
};

export const removeElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual);

  if (dispositivo === undefined) {
    throw new Error('Elemento não encontrado');
  }

  const events = removeAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    past: buildPast(state, events),
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};

export const modificaTipoElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    throw new Error('Elemento não encontrado');
  }

  const removidos = [...getElementos(atual)];

  const atualRenumerados = listaDispositivosRenumerados(atual);

  const novo = converteDispositivo(atual, action);

  const novoRenumerados = listaDispositivosRenumerados(novo);

  const renumerados = novoRenumerados.concat(atualRenumerados);

  const validados = getElementosDoDispositivo(novo, true);

  const eventos = buildEventoTransformacaooElemento(
    atual,
    novo,
    removidos,
    renumerados.map(d => {
      d.mensagens = validaDispositivo(d);
      const el = createElemento(d);
      return el;
    }),
    validados
  );

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const transformaDispositivoWithTab = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    throw new Error('Elemento não encontrado');
  }
  const acao = action.type === TAB ? getAcaoPossivelShift(atual) : getAcaoPossivelShiftTab(atual);

  if (!acao) {
    return state;
  }

  const newAction = {
    type: CHANGE_ELEMENTO,
    subType: (acao as ChangeElemento).nomeAcao,
    atual,
    novo: {
      tipo: acao.tipo,
    },
  };

  return modificaTipoElemento(state, newAction);
};

const buildRenumeradosValidadosUndoRedo = (state: any, eventos: StateEvent[], renumerados: Elemento[], retorno: ElementoState): void => {
  if (renumerados.length > 0) {
    let r = retorno.ui?.events.filter((evento: StateEvent) => evento.stateType === StateType.ElementoRenumerado)[0];

    renumerados.forEach((element: Elemento) => {
      const d = getDispositivoFromElemento(state.articulacao, element);
      const el = createElemento(d!);
      if (!r) {
        retorno.ui?.events.push({ stateType: StateType.ElementoRenumerado, elementos: [] });
        r = retorno.ui?.events.filter((evento: StateEvent) => evento.stateType === StateType.ElementoRenumerado)[0];
      }
      if (r?.elementos?.length === 0 || r?.elementos?.filter((e: Elemento) => e.uuid === el.uuid).length === 0) {
        r?.elementos?.push(el);
      }
    });
  }

  const v = eventos?.filter((evento: StateEvent) => evento.stateType === StateType.ElementoValidado)[0];
  if (v && v.elementos && v.elementos.length > 0) {
    v.elementos.forEach((element: Elemento) => {
      const ui = retorno.ui?.events.filter((evento: StateEvent) => evento.stateType === StateType.ElementoValidado)[0];

      const d = getDispositivoFromElemento(state.articulacao, element);
      d ? (d.mensagens = validaDispositivo(d)) : undefined;
      if (d && d.mensagens!.length > 0) {
        // se não for o próprio dispositivo já removido
        !ui ? retorno.ui?.events.push({ stateType: StateType.ElementoValidado, elementos: [createElemento(d)] }) : ui?.elementos?.push(createElemento(d));
      }
    });
  }
};

export const undo = (state: any): ElementoState => {
  if (state.past === undefined || state.past.length === 0) {
    return state;
  }

  const eventos = state.past.pop();

  const retorno: ElementoState = {
    articulacao: state.articulacao,
    past: state.past,
    future: buildFuture(state, eventos),
    ui: {
      events: [],
    },
  };

  let renumerados: Elemento[] = [];

  eventos.forEach((ev: StateEvent) => {
    let events;
    if (ev.stateType === StateType.ElementoIncluido) {
      events = redoIncludedElements(state, ev);
      retorno.ui!.events.splice(0, 0, events[0]);
    } else if (ev.stateType === StateType.ElementoModificado) {
      events = redoModifiedElements(state, ev);
      events[0] && events[0].elementos ? retorno.ui!.events.push(events[0]) : undefined;
    } else if (ev.stateType === StateType.ElementoRemovido) {
      events = redoRemovedElements(state, ev);
      retorno.ui!.events.unshift(events[0]);
    }
  });

  const r = eventos?.filter((evento: StateEvent) => evento.stateType === StateType.ElementoRenumerado)[0];
  renumerados = r && r.elementos ? renumerados.concat(r.elementos) : renumerados;

  buildRenumeradosValidadosUndoRedo(state, eventos, renumerados, retorno);

  return retorno;
};

export const redo = (state: any): ElementoState => {
  if (state.future === undefined || state.future.length === 0) {
    return state;
  }

  const eventos = state.future.pop();

  const retorno: ElementoState = {
    articulacao: state.articulacao,
    past: buildPast(state, eventos),
    future: state.future,
    ui: {
      events: [],
    },
  };

  let renumerados: Elemento[] = [];

  eventos.forEach((ev: StateEvent) => {
    let events;
    if (ev.stateType === StateType.ElementoIncluido) {
      const events = redoRemovedElements(state, ev);
      retorno.ui!.events.splice(0, 0, events[0]);
    } else if (ev.stateType === StateType.ElementoModificado) {
      ev.elementos!.length > 1 ? ev.elementos?.shift() : undefined;
      events = redoModifiedElements(state, ev);
      retorno.ui!.events.push(events[0]);
    } else if (ev.stateType === StateType.ElementoRemovido) {
      const events = redoIncludedElements(state, ev);
      retorno.ui!.events.unshift(events[0]);
    }
  });

  const r = eventos?.filter((evento: StateEvent) => evento.stateType === StateType.ElementoRenumerado)[0];
  renumerados = r && r.elementos ? renumerados.concat(r.elementos) : renumerados;

  buildRenumeradosValidadosUndoRedo(state, eventos, renumerados, retorno);

  return retorno;
};

const load = (articulacao: Articulacao): ElementoState => {
  const elementos = getElementos(articulacao);
  return {
    articulacao,
    past: [],
    future: [],
    ui: {
      events: [
        {
          stateType: StateType.DocumentoCarregado,
          elementos: elementos,
        },
      ],
    },
  };
};

export const novaArticulacao = (): ElementoState => {
  const articulacao = DispositivoLexmlFactory.createArticulacao();
  DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, articulacao);
  articulacao.renumeraArtigos();
  return load(articulacao);
};

export const openArticulacao = (state: any, action: any): ElementoState => {
  return load(ArticulacaoParser.load(action.articulacao));
};

export const elementoReducer = (state = {}, action: any): any => {
  switch (action.type) {
    case ADD_ELEMENTO:
      return adicionaElemento(state, action);
    case CHANGE_ELEMENTO:
      return modificaTipoElemento(state, action);
    case ELEMENTO_SELECIONADO:
      return selecionaElemento(state, action);
    case NOVA_ARTICULACAO:
      return novaArticulacao();
    case OPEN_ARTICULACAO:
      return openArticulacao(state, action);
    case REDO:
      return redo(state);
    case REMOVE_ELEMENTO:
      return removeElemento(state, action);
    case SHIFT_TAB:
    case TAB:
      return transformaDispositivoWithTab(state, action);
    case UNDO:
      return undo(state);
    case UPDATE_ELEMENTO:
      return atualizaElemento(state, action);
    case VALIDA_ELEMENTO:
      return validaElemento(state, action);
    default:
      return state;
  }
};
