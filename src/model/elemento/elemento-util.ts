import { Articulacao, Artigo, Dispositivo } from '../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput, isParagrafo, TipoDispositivo } from '../dispositivo/tipo';
import { acoesPossiveis } from '../lexml/acoes/acoes.possiveis';
import { validaDispositivo } from '../lexml/dispositivo/dispositivo-validator';
import { findDispositivoById, getDispositivosPosteriores, irmaosMesmoTipo } from '../lexml/hierarquia/hierarquia-util';
import { Elemento, Referencia } from './elemento';

export const isValid = (elemento?: Referencia): void => {
  if (elemento === undefined || elemento.uuid === undefined) {
    throw new Error('Não foi informado um elemento válido');
  }
};

const getNivel = (dispositivo: Dispositivo, atual = 0): number => {
  if (dispositivo?.pai === undefined || isArtigo(dispositivo) || isAgrupador(dispositivo)) {
    return atual;
  }
  atual = ++atual;
  return isArtigo(dispositivo?.pai) ? atual : getNivel(dispositivo.pai, atual);
};

const buildElementoPai = (pai: Dispositivo): Referencia => {
  return {
    tipo: pai.tipo,
    uuid: pai.uuid,
  };
};

export const createElemento = (dispositivo: Dispositivo, acoes = false): Elemento => {
  const pai = dispositivo.pai!;
  return {
    tipo: dispositivo.tipo,
    nivel: getNivel(dispositivo),
    agrupador: isAgrupador(dispositivo),
    hierarquia: {
      pai: pai ? (isCaput(pai) ? buildElementoPai(pai.pai!) : buildElementoPai(pai)) : undefined,
      posicao: pai ? pai.indexOf(dispositivo) : undefined,
      numero: dispositivo.numero,
    },
    editavel: true,
    sendoEditado: false,
    uuid: dispositivo.uuid,
    rotulo: dispositivo.rotulo ?? '',
    conteudo: {
      texto: dispositivo.texto,
    },
    index: 0,
    acoesPossiveis: acoes ? acoesPossiveis(dispositivo) : [],
    mensagens: dispositivo.mensagens,
  };
};

export const createElementos = (elementos: Elemento[], dispositivo: Dispositivo): void => {
  if (dispositivo.filhos === undefined) {
    return;
  }
  dispositivo.filhos.forEach(d => {
    const el = createElemento(d);

    if (isArtigo(d)) {
      el.conteudo!.texto = (d as Artigo).caput!.texto;
    }
    elementos.push(el);
    createElementos(elementos, d);
  });
};

export const getElementos = (dispositivo: Dispositivo): Elemento[] => {
  const elementos: Elemento[] = [];
  if (!isArticulacao(dispositivo)) {
    elementos.push(createElemento(dispositivo));
  }
  createElementos(elementos, dispositivo);

  return elementos;
};

export const getDispositivoFromElemento = (articulacao: Articulacao, elemento: Referencia): Dispositivo | undefined => {
  if (elemento.tipo === TipoDispositivo.artigo.tipo) {
    return articulacao.artigos!.filter(a => a.uuid === elemento.uuid)[0];
  }

  const dispositivo = elemento.uuid === undefined ? articulacao : findDispositivoById(articulacao, elemento.uuid!);

  if (dispositivo === null) {
    return undefined;
  }
  return dispositivo;
};

export const criaElementoValidadoSeNecessario = (validados: Elemento[], dispositivo: Dispositivo): void => {
  const mensagens = validaDispositivo(dispositivo);

  if (mensagens.length > 0 || (dispositivo.mensagens && dispositivo.mensagens?.length > 0)) {
    dispositivo.mensagens = mensagens;
    const elemento = createElemento(dispositivo);
    elemento.mensagens = validaDispositivo(dispositivo);
    validados.push(elemento);
  }
};

export const validaDispositivosAfins = (dispositivo: Dispositivo): Elemento[] => {
  const validados: Elemento[] = [];

  if (!dispositivo || isArticulacao(dispositivo) || isAgrupador(dispositivo)) {
    return [];
  }
  if (isDispositivoDeArtigo(dispositivo) || isDispositivoGenerico(dispositivo)) {
    const parent = isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!;
    criaElementoValidadoSeNecessario(validados, parent);
    irmaosMesmoTipo(dispositivo).forEach(filho => criaElementoValidadoSeNecessario(validados, filho));
  } else {
    criaElementoValidadoSeNecessario(validados, dispositivo);
  }

  return validados;
};

export const listaDispositivosRenumerados = (dispositivo: Dispositivo): Dispositivo[] => {
  return (isArtigo(dispositivo) || isParagrafo(dispositivo)) && irmaosMesmoTipo(dispositivo).length === 2
    ? irmaosMesmoTipo(dispositivo).filter(d => dispositivo.uuid !== d.uuid)
    : getDispositivosPosteriores(dispositivo, true).filter(d => d.tipo === dispositivo.tipo);
};

export const buildListaElementosRenumerados = (dispositivo: Dispositivo): Elemento[] => {
  return listaDispositivosRenumerados(dispositivo).map(d => {
    d.mensagens = validaDispositivo(d);
    const el = createElemento(d);
    return el;
  });
};
