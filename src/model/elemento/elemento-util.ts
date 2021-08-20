import { getArticulacaoFromElemento, isDispositivoAlteracao, isElementoDispositivoAlteracao } from '../../redux/elemento-reducer-util';
import { Articulacao, Artigo, Dispositivo } from '../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput, isParagrafo, TipoDispositivo } from '../dispositivo/tipo';
import { acoesPossiveis } from '../lexml/acoes/acoes.possiveis';
import { validaDispositivo } from '../lexml/dispositivo/dispositivo-validator';
import { findDispositivoById, getArticulacao, getDispositivosPosteriores, hasFilhos, irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../lexml/hierarquia/hierarquia-util';
import { Elemento, Referencia } from './elemento';

export const isValid = (elemento?: Referencia): void => {
  if (elemento === undefined || elemento.uuid === undefined) {
    throw new Error('Não foi informado um elemento válido');
  }
};

const getNivel = (dispositivo: Dispositivo, atual = 0): number => {
  if (dispositivo?.pai === undefined || isAgrupador(dispositivo)) {
    return atual;
  }

  if (isArtigo(dispositivo)) {
    return isDispositivoCabecaAlteracao(dispositivo) ? ++atual : atual;
  }

  atual = isDispositivoCabecaAlteracao(dispositivo?.pai) ? atual + 2 : ++atual;
  return isArtigo(dispositivo?.pai) ? atual : getNivel(dispositivo.pai, atual);
};

const buildElementoPai = (dispositivo: Dispositivo): Referencia | undefined => {
  const pai = dispositivo.pai ? (isCaput(dispositivo.pai) ? dispositivo.pai.pai : dispositivo.pai) : undefined;
  return {
    tipo: pai?.tipo,
    uuid: pai?.uuid,
    uuidAlteracao: pai && isDispositivoAlteracao(dispositivo) ? getArticulacao(dispositivo).pai?.uuid : undefined,
  };
};

export const createElemento = (dispositivo: Dispositivo, acoes = false): Elemento => {
  const pai = dispositivo.pai!;
  return {
    tipo: dispositivo.tipo,
    nivel: getNivel(dispositivo),
    agrupador: isAgrupador(dispositivo),
    hierarquia: {
      pai: pai ? buildElementoPai(dispositivo) : undefined,
      posicao: pai ? pai.indexOf(dispositivo) : undefined,
      numero: dispositivo.numero,
    },
    editavel: true,
    sendoEditado: false,
    uuid: dispositivo.uuid,
    numero: dispositivo.numero,
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

  if (isArtigo(dispositivo) && (dispositivo as Artigo).hasAlteracao()) {
    if (isArtigo(dispositivo) && (dispositivo as Artigo).hasAlteracao()) {
      (dispositivo as Artigo).alteracoes?.filhos.forEach(f => {
        elementos.push(createElemento(f));
        createElementos(elementos, f);
      });
    }
  }

  createElementos(elementos, dispositivo);

  return elementos;
};

export const buildListaDispositivos = (dispositivo: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  dispositivos.push(dispositivo);
  dispositivo.filhos?.forEach(f => (!hasFilhos(f) ? dispositivos.push(f) : buildListaDispositivos(f, dispositivos)));
  return dispositivos;
};

export const getDispositivoFromElemento = (art: Articulacao, referencia: Partial<Elemento>, ignorarElementoAlteracao = false): Dispositivo | undefined => {
  const articulacao = getArticulacaoFromElemento(art, referencia);

  if (!ignorarElementoAlteracao && isElementoDispositivoAlteracao(referencia)) {
    const ref = getDispositivoFromElemento(articulacao, { uuid: referencia.hierarquia!.pai!.uuidAlteracao });

    if (!ref?.alteracoes) {
      return undefined;
    }

    return ref.alteracoes?.filhos
      .flatMap(f => {
        const lista: Dispositivo[] = [];
        buildListaDispositivos(f, lista);
        return lista;
      })
      .filter(el => el.uuid === referencia.uuid)[0];
  }

  if (referencia.tipo === TipoDispositivo.artigo.tipo) {
    return articulacao.artigos!.filter(a => a.uuid === referencia.uuid)[0];
  }

  const dispositivo = referencia.uuid === undefined ? articulacao : findDispositivoById(articulacao, referencia.uuid!);

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
