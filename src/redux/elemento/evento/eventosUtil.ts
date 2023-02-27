import { hasFilhos, getAgrupadorAntes } from './../../../model/lexml/hierarquia/hierarquiaUtil';
import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isArticulacao, isArtigo, isCaput } from '../../../model/dispositivo/tipo';
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
import { ajustaReferencia, getElementosDoDispositivo } from '../util/reducerUtil';
import { Eventos } from './eventos';

export const buildEventoAdicionarElemento = (atual: Dispositivo, novo: Dispositivo): Eventos => {
  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(atual, novo)));
  eventos.add(StateType.ElementoIncluido, getElementosDoDispositivo(novo));
  eventos.add(StateType.ElementoRenumerado, buildListaElementosRenumerados(novo));
  eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(novo, false));

  if (isDispositivoAlteracao(atual)) {
    eventos.add(StateType.SituacaoElementoModificada, [createElemento(atual)]);
  }

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
  eventos.add(StateType.ElementoValidado, elementosValidados);

  return eventos;
};

export const removeAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  const removidos = getElementos(dispositivo);
  const dispositivosRenumerados = listaDispositivosRenumerados(dispositivo);
  const dispositivoAnterior = getDispositivoAnterior(dispositivo);

  const ehDispositivoAlteracao = isDispositivoAlteracao(dispositivo);

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

  if (ehDispositivoAlteracao) {
    eventos.add(StateType.ElementoValidado, criaListaElementosAfinsValidados(pai, true));

    if (dispositivoAnterior || pai) {
      try {
        const dispositivoParaAtualizar = dispositivoAnterior || (pai.tipo === 'Caput' ? pai.pai! : pai);
        eventos.add(StateType.SituacaoElementoModificada, getElementos(dispositivoParaAtualizar));
      } catch (error) {
        eventos.add(StateType.SituacaoElementoModificada, []);
      }
    }
  }

  return eventos.build();
};

export const removeAgrupadorAndBuildEvents = (articulacao: Articulacao, atual: Dispositivo): StateEvent[] => {
  let pos = atual.pai!.indexOf(atual);
  const agrupadoresAnteriorMesmoTipo = atual.pai!.filhos.filter((d, i) => i < pos && isAgrupador(d));
  const paiOriginal = atual.pai;
  const removido = createElemento(atual);
  const irmaoAnterior = getDispositivoAnteriorMesmoTipo(atual);

  const agrupadorAntes = getAgrupadorAntes(atual);

  const pai = agrupadoresAnteriorMesmoTipo?.length > 0 ? agrupadoresAnteriorMesmoTipo.reverse()[0] : atual.pai!;

  const dispositivoAnterior = agrupadoresAnteriorMesmoTipo?.length > 0 ? agrupadoresAnteriorMesmoTipo.reverse()[0] : pos > 0 ? getUltimoFilho(pai.filhos[pos - 1]) : pai;

  const referencia = isArticulacao(dispositivoAnterior) || (hasFilhos(pai) && pai.filhos[0].id === atual.id) ? pai : getUltimoFilho(dispositivoAnterior);

  const transferidosParaOutroPai: Elemento[] = [];
  let posNoPaiNovo = pai.filhos.length;
  atual.filhos.forEach(d => {
    let novoPai: Dispositivo;
    if (isArtigo(d)) {
      novoPai = agrupadorAntes ?? articulacao;
    } else if (pai.tiposPermitidosFilhos?.includes(d.tipo)) {
      novoPai = pai;
    } else if (dispositivoAnterior.tiposPermitidosFilhos?.includes(d.tipo)) {
      novoPai = dispositivoAnterior;
    } else {
      novoPai = getPaiQuePodeReceberFilhoDoTipo(atual.pai!, d.tipo, [])!;
    }

    d.pai = novoPai;
    atual.removeFilho(d);

    if (agrupadoresAnteriorMesmoTipo?.length > 0) {
      // TODO: revisar valor de "posNoPaiNovo" e "pos" (novoPai pode variar, como fica a posição???)
      novoPai!.addFilhoOnPosition(d, posNoPaiNovo++);
    } else {
      novoPai!.addFilhoOnPosition(d, pos++);
    }

    transferidosParaOutroPai.push(createElemento(d));
    return d;
  });

  atual.pai!.removeFilho(atual);
  pai?.renumeraFilhos();
  paiOriginal!.renumeraFilhos();

  const renumerados = pai!.filhos
    .filter((f, index) => index >= pos && (isAgrupador(f) || isDispositivoCabecaAlteracao(f)))
    .map(d => createElemento(d))
    .flat();

  const renumeradosPaiOriginal =
    paiOriginal?.filhos
      .filter(f => f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_NOVO)
      .map(d => createElemento(d)) || [];

  if (irmaoAnterior && irmaosMesmoTipo(irmaoAnterior).length === 1) {
    renumerados.unshift(createElemento(irmaoAnterior));
  }

  const eventos = new Eventos();
  eventos.setReferencia(isArticulacao(referencia) && isArticulacaoAlteracao(referencia as Articulacao) ? createElemento(referencia.pai!) : createElemento(referencia));

  eventos.add(StateType.ElementoRemovido, [removido]);
  eventos.add(StateType.SituacaoElementoModificada, transferidosParaOutroPai);
  eventos.add(StateType.ElementoRenumerado, [...renumerados, ...renumeradosPaiOriginal]);
  return eventos.build();
};

export const getPaiQuePodeReceberFilhoDoTipo = (dispositivo: Dispositivo, tipoFilho: string, dispositivosPermitidos: Dispositivo[]): Dispositivo | undefined => {
  return dispositivo.tiposPermitidosFilhos?.includes(tipoFilho)
    ? dispositivosPermitidos.length === 0 || dispositivosPermitidos.includes(dispositivo)
      ? dispositivo
      : undefined
    : getPaiQuePodeReceberFilhoDoTipo(dispositivo.pai!, tipoFilho, dispositivosPermitidos);
};

const restaura = (d: Dispositivo): void => {
  d.numero = d.situacao.dispositivoOriginal?.numero ?? '';
  d.rotulo = d.situacao.dispositivoOriginal?.rotulo ?? '';
  d.id = d.situacao.dispositivoOriginal?.lexmlId ?? '';
  d.texto = d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ? d.situacao.dispositivoOriginal?.conteudo?.texto ?? '' : d.texto;
  d.situacao = new DispositivoOriginal();
};

export const restauraAndBuildEvents = (articulacao: Articulacao, dispositivo: Dispositivo): StateEvent[] => {
  const elementosRestaurados: Elemento[] = [];

  if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
    const aRestaurar = getDispositivoAndFilhosAsLista(dispositivo).filter(f => f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
    aRestaurar.forEach(d => {
      restaura(d);
      elementosRestaurados.push(createElemento(d));
    });
  } else {
    restaura(dispositivo);
    elementosRestaurados.push(createElemento(dispositivo));
  }

  const eventos = new Eventos();

  eventos.add(StateType.ElementoRestaurado, elementosRestaurados);

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
      elementos: [],
    },
    {
      stateType: StateType.ElementoRemovido,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoModificado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRenumerado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoRestaurado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoSuprimido,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoValidado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoSelecionado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoMarcado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.SituacaoElementoModificada,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
    {
      stateType: StateType.ElementoReferenciado,
      referencia: undefined,
      pai: undefined,
      elementos: [],
    },
  ];
};

export const getElementosRemovidosEIncluidos = (eventos: StateEvent[]): Elemento[] => {
  const map = new Map();
  eventos.filter(ev => [StateType.ElementoRemovido, StateType.ElementoIncluido].includes(ev.stateType)).forEach(ev => ev.elementos?.forEach(el => map.set(el.lexmlId!, el)));
  return Array.from(map.values());
};
