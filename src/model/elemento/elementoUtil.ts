import { Articulacao, Artigo, Dispositivo } from '../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput, isParagrafo } from '../dispositivo/tipo';
import { validaDispositivo } from '../lexml/dispositivo/dispositivoValidator';
import {
  findDispositivoById,
  buildListaDispositivos,
  getArticulacao,
  getDispositivosPosteriores,
  hasFilhos,
  irmaosMesmoTipo,
  isArticulacaoAlteracao,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isOriginal,
} from '../lexml/hierarquia/hierarquiaUtil';
import { DispositivoSuprimido } from '../lexml/situacao/dispositivoSuprimido';
import { TipoDispositivo } from '../lexml/tipo/tipoDispositivo';
import { Elemento, Referencia } from './elemento';

export const isValid = (elemento?: Referencia): void => {
  if (elemento === undefined || elemento.uuid === undefined) {
    throw new Error('Não foi informado um elemento válido');
  }
};

export const isElementoDispositivoAlteracao = (elemento: Partial<Elemento>): boolean => {
  return elemento.hierarquia?.pai?.uuidAlteracao !== undefined || elemento.uuidAlteracao !== undefined;
};

const getNivel = (dispositivo: Dispositivo, atual = 0): number => {
  if (dispositivo?.pai === undefined || isAgrupador(dispositivo)) {
    return atual;
  }

  if (isArtigo(dispositivo)) {
    return isDispositivoAlteracao(dispositivo) ? ++atual : atual;
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

export const createElemento = (dispositivo: Dispositivo, acoes = true): Elemento => {
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
    editavel: isArticulacao(dispositivo) || dispositivo.situacao instanceof DispositivoSuprimido ? false : true,
    sendoEditado: false,
    uuid: dispositivo.uuid,
    numero: dispositivo.numero,
    rotulo: dispositivo.rotulo ?? '',
    conteudo: {
      texto: dispositivo.texto,
    },
    norma: dispositivo.alteracoes?.base,
    index: 0,
    acoesPossiveis: acoes ? dispositivo.getAcoesPossiveis(dispositivo) : [],
    descricaoSituacao: dispositivo.situacao?.descricaoSituacao,
    mensagens: isOriginal(dispositivo) ? [] : dispositivo.mensagens,
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

    if (isArtigo(d) && (d as Artigo).hasAlteracao()) {
      (d as Artigo).alteracoes?.filhos.forEach(f => {
        elementos.push(createElemento(f));
        createElementos(elementos, f);
      });
    }
    createElementos(elementos, d);
  });
};

export const getElementos = (dispositivo: Dispositivo): Elemento[] => {
  const elementos: Elemento[] = [];
  elementos.push(createElemento(dispositivo, true));

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

export const getArticulacaoFromElemento = (articulacao: Articulacao, elemento: Elemento | Referencia): Articulacao => {
  if (!isElementoDispositivoAlteracao(elemento) || isArticulacaoAlteracao(articulacao)) {
    return articulacao;
  }

  return (
    getDispositivoFromElemento(articulacao!, {
      uuid: (elemento as Elemento).hierarquia ? (elemento as Elemento).hierarquia!.pai!.uuidAlteracao : elemento.uuidAlteracao,
    })?.alteracoes ?? articulacao
  );
};

export const getDispositivoFromElemento = (art: Articulacao, referencia: Partial<Elemento>, ignorarElementoAlteracao = false): Dispositivo | undefined => {
  const articulacao = getArticulacaoFromElemento(art, referencia);

  if (!ignorarElementoAlteracao && isElementoDispositivoAlteracao(referencia)) {
    const ref = getDispositivoFromElemento(articulacao, {
      uuid: referencia.hierarquia ? referencia.hierarquia!.pai!.uuidAlteracao : referencia.uuidAlteracao,
    });

    if (!ref?.alteracoes) {
      return undefined;
    }

    return ref.alteracoes?.filhos
      .flatMap(f => {
        const lista: Dispositivo[] = [];
        buildListaDispositivos(f, lista);
        return lista;
      })
      .filter((el: Referencia) => el.uuid === referencia.uuid)[0];
  }

  if (referencia?.tipo === TipoDispositivo.artigo.tipo) {
    const artigo = articulacao.filhos!.find(a => a.uuid === referencia.uuid);
    if (artigo) {
      return artigo;
    }
  }

  const dispositivo = referencia?.tipo === TipoDispositivo.articulacao.tipo || referencia?.uuid === undefined ? articulacao : findDispositivoById(articulacao, referencia.uuid!);

  if (dispositivo === null) {
    return undefined;
  }
  return dispositivo;
};

const criaElementoValidadoSeNecessario = (validados: Elemento[], dispositivo: Dispositivo, incluiAcoes?: boolean): void => {
  const mensagens = validaDispositivo(dispositivo);

  if (mensagens.length > 0 || (dispositivo.mensagens && dispositivo.mensagens?.length > 0)) {
    dispositivo.mensagens = mensagens;
    const elemento = createElemento(dispositivo, incluiAcoes);
    elemento.mensagens = validaDispositivo(dispositivo);
    validados.push(elemento);
  }
};

export const criaListaElementosAfinsValidados = (dispositivo: Dispositivo | undefined, incluiDispositivo = true): Elemento[] => {
  const validados: Elemento[] = [];

  if (!dispositivo) {
    return [];
  }
  if (isDispositivoAlteracao(dispositivo) && hasFilhos(dispositivo) && dispositivo.filhos.filter(d => d.tipo === TipoDispositivo.omissis.tipo).length > 0) {
    criaElementoValidadoSeNecessario(validados, dispositivo);
    dispositivo.filhos.filter(d => d.tipo === TipoDispositivo.omissis.tipo).forEach(o => criaElementoValidadoSeNecessario(validados, o));
  }

  if (isDispositivoDeArtigo(dispositivo) || isDispositivoGenerico(dispositivo)) {
    const parent = isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!;
    criaElementoValidadoSeNecessario(validados, parent);
    if (isAgrupador(parent)) {
      criaElementoValidadoSeNecessario(validados, isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!);
    }
    irmaosMesmoTipo(dispositivo).forEach(filho => {
      !incluiDispositivo && filho === dispositivo ? undefined : criaElementoValidadoSeNecessario(validados, filho, true);
    });
  } else if (incluiDispositivo && !isArticulacao(dispositivo) && !isAgrupador(dispositivo)) {
    criaElementoValidadoSeNecessario(validados, dispositivo, true);
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

export const validaFilhos = (validados: Elemento[], filhos: Dispositivo[]): void => {
  filhos.forEach(filho => {
    criaElementoValidadoSeNecessario(validados, filho);
    filhos ? validaFilhos(validados, filho.filhos) : undefined;
  });
};
