import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isAgrupador, isCaput } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { buildListaElementosRenumerados, createElemento, criaListaElementosAfinsValidados, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getDispositivoAnterior, getUltimoFilho, isArtigoUnico, isParagrafoUnico } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { StateEvent, StateType } from '../../state';
import { ajustaReferencia, getElementosDoDispositivo } from '../util/reducerUtil';
import { Eventos } from './eventos';

export const buildEventoAdicionarElemento = (atual: Dispositivo, novo: Dispositivo): Eventos => {
  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementosDoDispositivo(novo));
  eventos.add(StateType.ElementoRenumerado, buildListaElementosRenumerados(novo));
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(novo, false));

  return eventos;
};

export const buildEventoAtualizacaoElemento = (dispositivo: Dispositivo): Eventos => {
  const eventos = new Eventos();

  const elemento = createElemento(dispositivo);
  elemento.mensagens = validaDispositivo(dispositivo);

  eventos.add(StateType.ElementoModificado, [elemento]);
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(dispositivo));

  return eventos;
};

export const buildUpdateEvent = (dispositivo: Dispositivo, original?: Elemento): StateEvent[] => {
  dispositivo.mensagens = validaDispositivo(dispositivo);
  const elemento = createElemento(dispositivo);

  const elementos = original ? [original] : [];
  elementos.push(elemento);

  return [
    {
      stateType: StateType.ElementoModificado,
      elementos: elementos,
    },
    {
      stateType: StateType.ElementoValidado,
      elementos: criaListaElementosAfinsValidados(dispositivo, true),
    },
  ];
};

export const buildEventoExclusaoElemento = (elementosRemovidos: Elemento[], elementosRenumerados: Elemento[], elementosValidados: Elemento[]): Eventos => {
  const eventos = new Eventos();

  eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  eventos.add(StateType.ElementoRenumerado, elementosRenumerados);
  eventos.add(StateType.ElementoValidado, elementosValidados);

  return eventos;
};

export const buildEventoTransformacaooElemento = (
  atual: Dispositivo,
  novo: Dispositivo,
  elementosRemovidos: Elemento[],
  elementosRenumerados: Elemento[],
  elementosValidados: Elemento[]
): Eventos => {
  const eventos = new Eventos();

  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementos(novo));
  eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  eventos.add(StateType.ElementoRenumerado, elementosRenumerados);
  eventos.add(
    StateType.ElementoValidado,
    elementosValidados.filter(e => e.mensagens!.length > 0)
  );

  return eventos;
};

export const removeAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  const removidos = getElementos(dispositivo);
  const dispositivosRenumerados = listaDispositivosRenumerados(dispositivo);
  const dispositivoAnterior = getDispositivoAnterior(dispositivo);

  const pai = dispositivo.pai!;
  pai.removeFilho(dispositivo);
  pai.renumeraFilhos();

  const modificados = dispositivosRenumerados.map(d => createElemento(d));

  const dispositivoValidado =
    dispositivoAnterior && (isArtigoUnico(dispositivoAnterior) || isParagrafoUnico(dispositivoAnterior)) ? dispositivoAnterior : isCaput(pai!) ? pai!.pai! : pai!;

  if (articulacao.artigos.length === 1) {
    modificados.push(createElemento(articulacao.artigos[0]));
  }

  const eventos = buildEventoExclusaoElemento(removidos, modificados, criaListaElementosAfinsValidados(dispositivoValidado, false));
  return eventos.build();
};

export const removeAgrupadorAndBuildEvents = (articulacao: Articulacao, atual: Dispositivo): StateEvent[] => {
  let pos = atual.pai!.indexOf(atual);
  const agrupadoresAnteriorMesmoTipo = atual.pai!.filhos.filter((d, i) => i < pos && isAgrupador(d));

  const removidos = [...getElementos(atual)];

  const pai = agrupadoresAnteriorMesmoTipo?.length > 0 ? agrupadoresAnteriorMesmoTipo.reverse()[0] : atual.pai!;
  const dispositivoAnterior = agrupadoresAnteriorMesmoTipo?.length > 0 ? agrupadoresAnteriorMesmoTipo.reverse()[0] : pos > 0 ? getUltimoFilho(pai.filhos[pos - 1]) : pai;

  const dispositivos = atual.filhos.map(d => {
    const novo = agrupadoresAnteriorMesmoTipo?.length > 0 ? DispositivoLexmlFactory.create(pai!, d.tipo) : DispositivoLexmlFactory.create(pai, d.tipo, undefined, pos++);
    novo.texto = d.texto;
    novo.numero = d.numero;
    novo.rotulo = d.rotulo;
    novo.mensagens = d.mensagens;
    DispositivoLexmlFactory.copiaFilhos(d, novo);

    d.pai!.removeFilho(d);
    return novo;
  });

  atual.pai!.removeFilho(atual);
  pai.renumeraFilhos();

  const incluidos = dispositivos.map(d => getElementos(d)).flat();

  const renumerados = pai!.filhos
    .filter((f, index) => index >= pos)
    .map(d => getElementos(d))
    .flat()
    .filter(e => e.agrupador);

  const eventos = new Eventos();
  eventos.setReferencia(createElemento(dispositivoAnterior));
  eventos.add(StateType.ElementoIncluido, incluidos);
  eventos.add(StateType.ElementoRemovido, removidos);

  eventos.add(StateType.ElementoRenumerado, renumerados);
  return eventos.build();
};

export const getEvento = (eventos: StateEvent[], stateType: StateType): StateEvent => {
  return eventos?.filter(ev => ev.stateType === stateType)[0];
};

export const getEventosQuePossuemElementos = (eventos: StateEvent[]): StateEvent[] => {
  return eventos?.filter(ev => ev?.elementos && ev.elementos?.length > 0);
};

export const addElementosAoEvento = (evento: StateEvent, elementos: Elemento[]): void => {
  elementos.forEach(elemento => (evento.elementos?.filter(atual => atual.uuid === elemento.uuid).length === 0 ? evento.elementos.push(elemento) : undefined));
};

export const eventoContem = (stateEvents: StateEvent, elemento: Elemento): boolean => {
  return (
    stateEvents?.elementos!.map(ev => ev.uuid === elemento!.uuid && ev.rotulo === elemento!.rotulo && ev.conteudo?.texto === elemento.conteudo?.texto).filter(value => value)
      .length > 0
  );
};

export const createEventos = (): StateEvent[] => {
  return [
    {
      stateType: StateType.ElementoIncluido,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRemovido,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoModificado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRenumerado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoValidado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoSelecionado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
  ];
};
