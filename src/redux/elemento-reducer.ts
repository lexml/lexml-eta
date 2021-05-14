import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { isAgrupador, isIncisoCaput, TipoDispositivo } from '../model/dispositivo/tipo';
import { Elemento } from '../model/elemento';
import {
  createElemento,
  createElementos,
  criaElementoValidadoSeNecessario,
  getDispositivoFromElemento,
  getElementos,
  listaDispositivosRenumerados,
} from '../model/elemento/elemento-util';
import { getAcaoPossivelShift, getAcaoPossivelShiftTab } from '../model/lexml/acoes/acoes.possiveis';
import { validaDispositivo } from '../model/lexml/dispositivo/dispositivo-validator';
import { DispositivoLexmlFactory } from '../model/lexml/factory/dispositivo-lexml-factory';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  getDispositivoPosteriorMesmoTipo,
  isArtigoUnico,
  isParagrafoUnico,
} from '../model/lexml/hierarquia/hierarquia-util';
import { ArticulacaoParser } from '../model/lexml/service/articulacao-parser';
import { converteDispositivo, copiaFilhos } from '../model/lexml/tipo/tipo-util';
import { Mensagem, TipoMensagem } from '../model/lexml/util/mensagem';
import {
  ADD_ELEMENTO,
  ChangeElemento,
  CHANGE_ELEMENTO,
  ELEMENTO_SELECIONADO,
  MOVER_ELEMENTO_ABAIXO,
  MOVER_ELEMENTO_ACIMA,
  NOVA_ARTICULACAO,
  OPEN_ARTICULACAO,
  REDO,
  REMOVE_ELEMENTO,
  SHIFT_TAB,
  TAB,
  UNDO,
  UPDATE_ELEMENTO,
  VALIDA_ARTICULACAO,
  VALIDA_ELEMENTO,
} from './elemento-actions';
import {
  ajustaReferencia,
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
import { Eventos } from './eventos';
import { ElementoState, StateEvent, StateType } from './state';

export const adicionaElemento = (state: any, action: any): ElementoState => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action)) {
    atual!.texto = action.atual?.conteudo?.texto ?? '';
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos nessa situação' });
  }

  if (isAgrupador(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos a partir de agrupadores' });
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

const validaFilhos = (validados: Elemento[], filhos: Dispositivo[]): void => {
  filhos.forEach(filho => {
    criaElementoValidadoSeNecessario(validados, filho);
    filhos ? validaFilhos(validados, filho.filhos) : undefined;
  });
};

export const validaArticulacao = (state: any): ElementoState => {
  const elementos: Elemento[] = [];
  validaFilhos(elementos, state.articulacao.filhos);

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: elementos,
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

  atual.mensagens = validaDispositivo(atual);
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

export const retornaEstadoAtualComMensagem = (state: any, mensagem: Mensagem): ElementoState => {
  return {
    articulacao: state.articulacao,
    past: state.past,
    future: state.future,
    ui: {
      events: state.ui?.events,
      message: mensagem,
    },
  };
};

export const atualizaElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual);

  if (dispositivo === undefined) {
    return state;
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
    return state;
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
    return state;
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
    return state;
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

export const moveElementoAbaixo = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }

  const proximo = getDispositivoPosteriorMesmoTipo(atual);

  if (proximo === undefined) {
    return state;
  }

  const removidos = [...getElementos(atual), ...getElementos(proximo)];
  const renumerados = listaDispositivosRenumerados(proximo);

  const pai = atual.pai!;
  const pos = pai.indexOf(atual);
  pai.removeFilho(atual);
  pai.removeFilho(proximo);

  const um = DispositivoLexmlFactory.create(atual.tipo, pai, undefined, pos);
  um.texto = proximo.texto;

  const outro = DispositivoLexmlFactory.create(atual.tipo, pai, undefined, pos + 1);
  outro.texto = action.atual.conteudo.texto;

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(um) ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(StateType.ElementoIncluido, getElementos(um).concat(getElementos(outro)));
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
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

export const moveElementoAcima = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }

  const anterior = getDispositivoAnteriorMesmoTipo(atual);

  if (anterior === undefined) {
    return state;
  }

  const removidos = [...getElementos(anterior), ...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(anterior);

  const pai = atual.pai!;
  const pos = pai.indexOf(anterior);
  pai.removeFilho(atual);
  pai.removeFilho(anterior);

  const um = DispositivoLexmlFactory.create(atual.tipo, pai, undefined, pos);
  um.texto = action.atual.conteudo.texto;

  const outro = DispositivoLexmlFactory.create(atual.tipo, pai, undefined, pos + 1);
  outro.texto = anterior.texto;

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(um) ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(StateType.ElementoIncluido, getElementos(um).concat(getElementos(outro)));
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
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

export const modificaTipoElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
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

export const modificaTipoElementoWithTab = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual);

  if (atual === undefined) {
    return state;
  }
  const acao = action.type === TAB ? getAcaoPossivelShift(atual) : getAcaoPossivelShiftTab(atual);

  if (!acao) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível mudar o tipo do dispositivo' });
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
    case MOVER_ELEMENTO_ABAIXO:
      return moveElementoAbaixo(state, action);
    case MOVER_ELEMENTO_ACIMA:
      return moveElementoAcima(state, action);
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
      return modificaTipoElementoWithTab(state, action);
    case UNDO:
      return undo(state);
    case UPDATE_ELEMENTO:
      return atualizaElemento(state, action);
    case VALIDA_ELEMENTO:
      return validaElemento(state, action);
    case VALIDA_ARTICULACAO:
      return validaArticulacao(state);
    default:
      return state;
  }
};
