import { Articulacao, Artigo, Dispositivo } from '../dispositivo/dispositivo';
import { DescricaoSituacao } from '../dispositivo/situacao';
import { isAgrupador, isArticulacao, isArtigo, isCaput, isDispositivoDeArtigo, isDispositivoGenerico, isIncisoCaput, isOmissis, isParagrafo } from '../dispositivo/tipo';
import { validaDispositivo } from '../lexml/dispositivo/dispositivoValidator';
import {
  buildListaDispositivos,
  findDispositivoByUuid,
  getArticulacao,
  getDispositivoAnterior,
  getDispositivosPosteriores,
  hasFilhos,
  irmaosMesmoTipo,
  isArticulacaoAlteracao,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isOriginal,
  verificaNaoPrecisaInformarSituacaoNormaVigente,
} from '../lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../lexml/situacao/dispositivoAdicionado';
import { DispositivoSuprimido } from '../lexml/situacao/dispositivoSuprimido';
import { TipoDispositivo } from '../lexml/tipo/tipoDispositivo';
import { buildId } from '../lexml/util/idUtil';
import { getDispositivoCabecaAlteracao, isUltimaAlteracao } from './../lexml/hierarquia/hierarquiaUtil';
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
  const fechaAspas = dispositivo.tipo !== 'Articulacao' && isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo);
  let notaAlteracao: string | undefined;

  if (fechaAspas) {
    const cabecaAlteracao = getDispositivoCabecaAlteracao(dispositivo);
    // TODO: confirmar se deve ter 'NR' como valor default
    notaAlteracao = cabecaAlteracao?.notaAlteracao || 'NR';
  }

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
    lexmlId: dispositivo.numero && buildId(dispositivo),
    numero: dispositivo.numero,
    rotulo: dispositivo.rotulo ?? '',
    conteudo: {
      texto: dispositivo.texto,
    },
    norma: dispositivo.alteracoes?.base,
    existeNaNormaAlterada:
      dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ? (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada : undefined,
    index: 0,
    acoesPossiveis: acoes ? dispositivo.getAcoesPossiveis(dispositivo) : [],
    descricaoSituacao: dispositivo.situacao?.descricaoSituacao,
    mensagens: isOriginal(dispositivo) ? [] : dispositivo.mensagens,
    abreAspas: isDispositivoCabecaAlteracao(dispositivo),
    fechaAspas,
    notaAlteracao,
    dispositivoAlteracao: isDispositivoAlteracao(dispositivo),
    tipoOmissis: dispositivo.tipo === 'Omissis' ? tipoOmissis(pai) : undefined,
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
    const ref = articulacao.pai
      ? articulacao.pai
      : getDispositivoFromElemento(articulacao, {
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

  const dispositivo = referencia?.tipo === TipoDispositivo.articulacao.tipo || referencia?.uuid === undefined ? articulacao : findDispositivoByUuid(articulacao, referencia.uuid!);

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

  const anterior = getDispositivoAnterior(dispositivo);
  if (anterior !== undefined && isOmissis(anterior)) {
    criaElementoValidadoSeNecessario(validados, anterior, false);
  }

  return validados;
};

export const listaDispositivosRenumerados = (dispositivo: Dispositivo): Dispositivo[] => {
  return (isArtigo(dispositivo) || isParagrafo(dispositivo)) && irmaosMesmoTipo(dispositivo).length <= 2
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

export const hasElementoAscendenteAdicionado = (articulacao: Articulacao, referencia: Partial<Elemento>): boolean => {
  const d = getDispositivoFromElemento(articulacao, referencia);

  return d ? verificaNaoPrecisaInformarSituacaoNormaVigente(d) : false;
};

export const tipoOmissis = (pai: Dispositivo | undefined): string => {
  switch (pai?.tipo) {
    case 'Caput':
      return 'inciso-caput';
    case 'Inciso':
      return 'alinea';
    case 'Alinea':
      return 'item';
    case 'Artigo':
      return 'paragrafo';
    case 'Paragrafo':
      return 'inciso-paragrafo';
    default:
      return '';
  }
};
