import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isArticulacao, isCaput } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { buildListaElementosRenumerados, createElemento, criaListaElementosAfinsValidados, getElementos, listaDispositivosRenumerados } from '../../../model/elemento/elementoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  getDispositivoAndFilhosAsLista,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  getUltimoFilho,
  irmaosMesmoTipo,
  isArticulacaoAlteracao,
  isArtigoUnico,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isParagrafoUnico,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoOriginal } from '../../../model/lexml/situacao/dispositivoOriginal';
import { DispositivoSuprimido } from '../../../model/lexml/situacao/dispositivoSuprimido';
import { StateEvent, StateType } from '../../state';
import { ajustaReferencia, getElementosDoDispositivo, resetUuidTodaArvore } from '../util/reducerUtil';
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

export const buildEventoExclusaoElemento = (elementosRemovidos: Elemento[], dispositivosRenumerados: Dispositivo[], elementosValidados: Elemento[]): Eventos => {
  const eventos = new Eventos();

  eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  eventos.add(
    StateType.ElementoRenumerado,
    dispositivosRenumerados.map(d => createElemento(d))
  );
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

  if (isArticulacaoAlteracao(pai) && pai.filhos.length === 0) {
    pai.pai!.alteracoes = undefined;
  }

  const dispositivoValidado =
    dispositivoAnterior && (isArtigoUnico(dispositivoAnterior) || isParagrafoUnico(dispositivoAnterior)) ? dispositivoAnterior : isCaput(pai!) ? pai!.pai! : pai!;

  if (articulacao.artigos.length === 1) {
    dispositivosRenumerados.push(articulacao.artigos[0]);
  }

  const eventos = buildEventoExclusaoElemento(removidos, dispositivosRenumerados, criaListaElementosAfinsValidados(dispositivoValidado, false));
  return eventos.build();
};

export const removeAgrupadorAndBuildEvents = (articulacao: Articulacao, atual: Dispositivo): StateEvent[] => {
  let pos = atual.pai!.indexOf(atual);
  const agrupadoresAnteriorMesmoTipo = atual.pai!.filhos.filter((d, i) => i < pos && isAgrupador(d));
  const paiOriginal = atual.pai;
  const removidos = [...getElementos(atual)];
  const irmaoAnterior = getDispositivoAnteriorMesmoTipo(atual);

  const pai = agrupadoresAnteriorMesmoTipo?.length > 0 && !isDispositivoAlteracao(atual) ? agrupadoresAnteriorMesmoTipo.reverse()[0] : atual.pai!;
  const dispositivoAnterior =
    agrupadoresAnteriorMesmoTipo?.length > 0 && !isDispositivoAlteracao(atual) ? agrupadoresAnteriorMesmoTipo.reverse()[0] : pos > 0 ? getUltimoFilho(pai.filhos[pos - 1]) : pai;
  const referencia = isArticulacao(dispositivoAnterior) ? pai : getUltimoFilho(dispositivoAnterior);

  const dispositivos = atual.filhos.map(d => {
    d.pai = pai;
    paiOriginal!.removeFilho(d);

    resetUuidTodaArvore(d);
    if (agrupadoresAnteriorMesmoTipo?.length > 0) {
      pai!.addFilho(d);
    } else {
      pai!.addFilhoOnPosition(d, pos++);
    }
    return d;
  });

  atual.pai!.removeFilho(atual);
  pai?.renumeraFilhos();
  paiOriginal!.renumeraFilhos();

  const incluidos = dispositivos.map(d => getElementos(d)).flat();

  const renumerados = pai!.filhos
    .filter((f, index) => index >= pos && (isAgrupador(f) || isDispositivoCabecaAlteracao(f)))
    .map(d => createElemento(d))
    .flat();

  if (irmaoAnterior && irmaosMesmoTipo(irmaoAnterior).length === 1) {
    renumerados.unshift(createElemento(irmaoAnterior));
  }

  const eventos = new Eventos();
  eventos.setReferencia(isArticulacao(referencia) && isArticulacaoAlteracao(referencia as Articulacao) ? createElemento(referencia.pai!) : createElemento(referencia));
  eventos.add(StateType.ElementoIncluido, incluidos);
  eventos.add(StateType.ElementoRemovido, removidos);

  eventos.add(StateType.ElementoRenumerado, renumerados);
  return eventos.build();
};

export const restauraAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  const aRestaurar = getDispositivoAndFilhosAsLista(dispositivo).filter(f => f.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL);

  aRestaurar.forEach(d => {
    d.numero = d.situacao.dispositivoOriginal?.numero ?? '';
    d.rotulo = d.situacao.dispositivoOriginal?.rotulo ?? '';
    d.texto = d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ? d.situacao.dispositivoOriginal?.conteudo?.texto ?? '' : d.texto;
    d.situacao = new DispositivoOriginal();
  });

  const eventos = new Eventos();

  eventos.add(
    StateType.ElementoRestaurado,
    aRestaurar.map(a => createElemento(a))
  );

  return eventos.build();
};

export const suprimeAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  getDispositivoAndFilhosAsLista(dispositivo).forEach(d => (d.situacao = new DispositivoSuprimido(createElemento(d))));

  if (dispositivo.alteracoes && dispositivo.alteracoes.filhos.length > 0) {
    dispositivo.alteracoes.filhos.forEach(f => getDispositivoAndFilhosAsLista(f).forEach(d => (d.situacao = new DispositivoSuprimido(createElemento(d)))));
  }
  const eventos = new Eventos();

  eventos.add(StateType.ElementoSuprimido, getElementos(dispositivo));

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
      stateType: StateType.ElementoRestaurado,
      referencia: undefined,
      pai: undefined,
      posicao: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoSuprimido,
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
