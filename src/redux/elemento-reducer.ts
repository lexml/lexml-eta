import { Articulacao } from '../model/dispositivo/dispositivo';
import { isAgrupador, isCaput, isIncisoCaput, isOmissis, TipoDispositivo } from '../model/dispositivo/tipo';
import { Elemento } from '../model/elemento';
import {
  buildListaDispositivos,
  buildListaElementosRenumerados,
  createElemento,
  createElementos,
  getDispositivoFromElemento,
  getElementos,
  listaDispositivosRenumerados,
} from '../model/elemento/elemento-util';
import { acoesPossiveis, getAcaoPossivelShiftTab, getAcaoPossivelTab, isAcaoTransformacaoPermitida, normalizaNomeAcao } from '../model/lexml/acoes/acoes.possiveis';
import { validaDispositivo } from '../model/lexml/dispositivo/dispositivo-validator';
import { DispositivoLexmlFactory } from '../model/lexml/factory/dispositivo-lexml-factory';
import {
  getAgrupadorAcimaByTipo,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasAgrupadoresAcimaByTipo,
  hasFilhos,
  isArtigoUnico,
  isParagrafoUnico,
} from '../model/lexml/hierarquia/hierarquia-util';
import { ArticulacaoParser } from '../model/lexml/service/articulacao-parser';
import { TipoMensagem } from '../model/lexml/util/mensagem';
import { incluir, processaRenumerados, processarModificados, processaValidados, remover } from './element-reducer-undo-redo-util';
import {
  ABRIR_ARTICULACAO,
  ADICIONAR_ELEMENTO,
  AGRUPAR_ELEMENTO,
  ATUALIZAR_ELEMENTO,
  ELEMENTO_SELECIONADO,
  MOVER_ELEMENTO_ABAIXO,
  MOVER_ELEMENTO_ACIMA,
  NOVA_ARTICULACAO,
  REDO,
  REMOVER_ELEMENTO,
  RenumerarElemento,
  RENUMERAR_ELEMENTO,
  SHIFT_TAB,
  TAB,
  TransformarElemento,
  TRANSFORMAR_TIPO_ELEMENTO,
  UNDO,
  VALIDAR_ARTICULACAO,
  VALIDAR_ELEMENTO,
} from './elemento-actions';
import { normalizaSeForOmissis } from './elemento-reducer-conteudo-util';
import {
  ajustaReferencia,
  buildEventoAdicionarElemento,
  buildEventoAtualizacaoElemento,
  buildEventoTransformacaooElemento,
  buildFuture,
  buildPast,
  buildUpdateEvent,
  copiaDispositivosParaAgrupadorPai,
  createElementoValidado,
  getElementosDoDispositivo,
  isDesdobramentoAgrupadorAtual,
  isDispositivoAlteracao,
  isNovoDispositivoDesmembrandoAtual,
  isOrWasUnico,
  naoPodeCriarFilho,
  removeAgrupadorAndBuildEvents,
  removeAndBuildEvents,
  retornaEstadoAtualComMensagem,
  textoFoiModificado,
  validaFilhos,
} from './elemento-reducer-util';
import { Eventos, getEvento } from './eventos';
import { ElementoState, StateType } from './state';

export const adicionaElemento = (state: any, action: any): ElementoState => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action, state)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos nessa situação' });
  }

  const novo = DispositivoLexmlFactory.createByInferencia(atual, action);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && hasFilhos(atual)) {
    DispositivoLexmlFactory.copiaFilhos(atual, novo);
  }

  if (isDispositivoAlteracao(novo)) {
    novo.mensagens?.push({ tipo: TipoMensagem.WARNING, descricao: `É necessário informar o rótulo do dispositivo` });
  }

  novo.pai!.renumeraFilhos();

  const eventos = buildEventoAdicionarElemento(atual, novo);

  const elementoAtualAtualizado = createElementoValidado(atual);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && elementosRemovidos && elementosRemovidos.length > 0) {
    eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    eventos.add(StateType.ElementoModificado, [elementoAtualOriginal, elementoAtualAtualizado]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) || isOmissis(atual)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
  }

  if (isOrWasUnico(atual, originalmenteUnico)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
    eventos.add(StateType.ElementoRenumerado, [elementoAtualAtualizado]);
  }

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,

    ui: {
      events: eventos.build(),
    },
  };
};

export const agruparElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const dispositivoAnterior = getDispositivoAnterior(atual);
  const pos = atual.pai!.indexOf(atual);
  const removidos = atual
    .pai!.filhos.filter((f, index) => index >= pos && f.tipo !== action.novo.tipo)
    .map(d => getElementos(d))
    .flat();

  if (textoFoiModificado(atual, action)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
  }

  let novo;

  if (isDesdobramentoAgrupadorAtual(atual, action.novo.tipo)) {
    novo = DispositivoLexmlFactory.create(atual.pai!.pai!, action.novo.tipo, undefined, atual.pai!.pai!.indexOf(atual.pai!) + 1);
  } else if (hasAgrupadoresAcimaByTipo(atual, action.novo.tipo)) {
    const ref = getAgrupadorAcimaByTipo(atual, action.novo.tipo);
    novo = DispositivoLexmlFactory.create(ref!.pai!, action.novo.tipo, ref);
  } else {
    novo = DispositivoLexmlFactory.create(atual.pai!, action.novo.tipo, undefined, atual.pai!.indexOf(atual));
  }
  novo.texto = action.novo.conteudo?.texto;
  const dispositivos = atual.pai!.filhos.filter((f, index) => index >= pos && f.tipo !== action.novo.tipo);
  copiaDispositivosParaAgrupadorPai(novo, dispositivos);
  novo.renumeraFilhos();
  novo.pai!.renumeraFilhos();

  const renumerados = [...buildListaElementosRenumerados(novo)].concat(
    novo.filhos
      .filter((f, index) => index >= pos && f.tipo !== atual.tipo)
      .map(d => getElementos(d))
      .flat()
  );
  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(dispositivoAnterior ?? atual.pai!, novo)));
  eventos.add(StateType.ElementoIncluido, getElementos(novo));
  eventos.add(StateType.ElementoRemovido, removidos);

  eventos.add(StateType.ElementoRenumerado, renumerados);

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const selecionaElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }
  atual.mensagens = validaDispositivo(atual);
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
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
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
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};

export const validaElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

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
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};

export const atualizaElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  const original = createElemento(dispositivo);

  dispositivo.texto = !isDispositivoAlteracao(dispositivo) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    past: buildPast(state, buildUpdateEvent(dispositivo, original)),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const renumeraElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  if (acoesPossiveis(dispositivo).filter(a => a instanceof RenumerarElemento).length === 0) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Nessa situação, não é possível renumerar o dispositivo' });
  }

  const past = buildPast(state, buildUpdateEvent(dispositivo));

  try {
    dispositivo.createNumeroFromRotulo(action.novo?.numero);
  } catch (error) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'O rótulo informado é inválido', detalhe: error });
  }

  dispositivo.createRotulo(dispositivo);

  const eventos = buildEventoAtualizacaoElemento(dispositivo);
  return {
    articulacao: state.articulacao,
    past,
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const removeElemento = (state: any, action: any): ElementoState => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (dispositivo === undefined) {
    return state;
  }

  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigoUnico(dispositivo) || (state.articulacao.filhos.length === 1 && state.articulacao.filhos[0] === dispositivo && !hasFilhos(dispositivo)))
  ) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Não é possível excluir o único dispositivo disponível.' });
  }

  const events = isAgrupador(dispositivo) ? removeAgrupadorAndBuildEvents(state.articulacao, dispositivo) : removeAndBuildEvents(state.articulacao, dispositivo);

  return {
    articulacao: state.articulacao,
    past: buildPast(state, events),
    present: events,
    future: buildFuture(state, events),
    ui: {
      events,
    },
  };
};

export const moveElementoAbaixo = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const proximo = getDispositivoPosteriorMesmoTipoInclusiveOmissis(atual);

  if (proximo === undefined) {
    return state;
  }

  const removidos = [...getElementos(atual), ...getElementos(proximo)];
  const renumerados = listaDispositivosRenumerados(proximo);

  const pai = atual.pai!;
  const pos = pai.indexOf(atual);
  pai.removeFilho(atual);
  pai.removeFilho(proximo);

  const um = DispositivoLexmlFactory.create(pai, proximo.tipo, undefined, pos);
  um.texto = proximo.texto;
  DispositivoLexmlFactory.copiaFilhos(proximo, um);

  const outro = DispositivoLexmlFactory.create(pai, atual.tipo, undefined, pos + 1);
  outro.texto = action.atual.conteudo.texto;
  DispositivoLexmlFactory.copiaFilhos(atual, outro);

  pai.renumeraFilhos();

  const referencia = pos === 0 ? (isIncisoCaput(um) ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(um, [])
      .concat(buildListaDispositivos(outro, []))
      .map(v => {
        v.mensagens = validaDispositivo(v);
        return createElemento(v);
      })
  );
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
  );

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const moveElementoAcima = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const anterior = getDispositivoAnteriorMesmoTipoInclusiveOmissis(atual);

  if (anterior === undefined) {
    return state;
  }

  const removidos = [...getElementos(anterior), ...getElementos(atual)];
  const renumerados = listaDispositivosRenumerados(atual);

  const pai = atual.pai!;
  const pos = pai.indexOf(anterior);
  pai.removeFilho(atual);
  pai.removeFilho(anterior);

  const um = DispositivoLexmlFactory.create(pai, atual.tipo, undefined, pos);
  um.texto = action.atual.conteudo.texto;
  DispositivoLexmlFactory.copiaFilhos(atual, um);

  const outro = DispositivoLexmlFactory.create(pai, anterior.tipo, undefined, pos + 1);
  outro.texto = anterior.texto;
  DispositivoLexmlFactory.copiaFilhos(anterior, outro);
  pai.renumeraFilhos();

  const referencia = pos === 0 ? (um.pai?.tipo === TipoDispositivo.caput.tipo ? pai.pai! : pai) : getDispositivoAnterior(um);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(referencia!, um)));
  eventos.add(
    StateType.ElementoIncluido,
    buildListaDispositivos(um, [])
      .concat(buildListaDispositivos(outro, []))
      .map(v => {
        v.mensagens = validaDispositivo(v);
        return createElemento(v);
      })
  );
  eventos.add(StateType.ElementoRemovido, removidos);
  eventos.add(
    StateType.ElementoRenumerado,
    renumerados.map(r => createElemento(r))
  );

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const transformaTipoElemento = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  action.subType = normalizaNomeAcao(atual, action.subType);

  if (!isAcaoTransformacaoPermitida(atual, action.subType)) {
    return state;
  }

  const removidos = [...getElementos(atual)];

  const atualRenumerados = listaDispositivosRenumerados(atual);

  const novo = DispositivoLexmlFactory.converteDispositivo(atual, action);

  const novoRenumerados = listaDispositivosRenumerados(novo);

  const renumerados = novoRenumerados.concat(atualRenumerados);

  const validados = getElementosDoDispositivo(novo, true);

  const dispositivoAnterior = getDispositivoAnterior(novo);

  const referencia = dispositivoAnterior ?? novo.pai!;
  const eventos = buildEventoTransformacaooElemento(
    isCaput(referencia) ? referencia.pai! : referencia,
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
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

export const modificaTipoElementoWithTab = (state: any, action: any): ElementoState => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }
  const acao = action.type === TAB ? getAcaoPossivelTab(atual) : getAcaoPossivelShiftTab(atual);

  if (!acao) {
    return state;
  }

  const newAction = {
    type: TRANSFORMAR_TIPO_ELEMENTO,
    subType: (acao as TransformarElemento).nomeAcao,
    atual: action.atual,
    novo: {
      tipo: acao.tipo,
    },
  };

  return transformaTipoElemento(state, newAction);
};

export const undo = (state: any): ElementoState => {
  if (state.past === undefined || state.past.length === 0) {
    return state;
  }

  const eventos = state.past.pop();

  const retorno: ElementoState = {
    articulacao: state.articulacao,
    past: state.past,
    present: [],
    future: buildFuture(state, eventos),
    ui: {
      events: [],
    },
  };

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoRemovido), getEvento(events.eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoModificado, processarModificados(state, getEvento(eventos, StateType.ElementoModificado)));
  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  retorno.ui!.events = events.build();
  retorno.present = events.build();

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
    present: [],
    future: state.future,
    ui: {
      events: [],
    },
  };

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoRemovido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoIncluido), getEvento(events.eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoModificado, processarModificados(state, getEvento(eventos, StateType.ElementoModificado), true));
  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};

const load = (articulacao: Articulacao): ElementoState => {
  const elementos = getElementos(articulacao);
  return {
    articulacao,
    past: [],
    present: [],
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
  DispositivoLexmlFactory.create(articulacao, TipoDispositivo.artigo.tipo);
  articulacao.renumeraArtigos();
  return load(articulacao);
};

export const openArticulacao = (state: any, action: any): ElementoState => {
  return load(ArticulacaoParser.load(action.articulacao));
};

export const elementoReducer = (state = {}, action: any): any => {
  switch (action.type) {
    case ATUALIZAR_ELEMENTO:
      return atualizaElemento(state, action);
    case ADICIONAR_ELEMENTO:
      return adicionaElemento(state, action);
    case AGRUPAR_ELEMENTO:
      return agruparElemento(state, action);
    case TRANSFORMAR_TIPO_ELEMENTO:
      return transformaTipoElemento(state, action);
    case ELEMENTO_SELECIONADO:
      return selecionaElemento(state, action);
    case MOVER_ELEMENTO_ABAIXO:
      return moveElementoAbaixo(state, action);
    case MOVER_ELEMENTO_ACIMA:
      return moveElementoAcima(state, action);
    case NOVA_ARTICULACAO:
      return novaArticulacao();
    case RENUMERAR_ELEMENTO:
      return renumeraElemento(state, action);
    case ABRIR_ARTICULACAO:
      return openArticulacao(state, action);
    case REDO:
      return redo(state);
    case REMOVER_ELEMENTO:
      return removeElemento(state, action);
    case SHIFT_TAB:
    case TAB:
      return modificaTipoElementoWithTab(state, action);
    case UNDO:
      return undo(state);
    case VALIDAR_ELEMENTO:
      return validaElemento(state, action);
    case VALIDAR_ARTICULACAO:
      return validaArticulacao(state);
    default:
      return state;
  }
};
