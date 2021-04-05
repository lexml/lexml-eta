import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao, isArtigo, isParagrafo } from '../../dispositivo/tipo';

export function getArticulacao(dispositivo: Dispositivo): Articulacao {
  if (isArticulacao(dispositivo)) {
    return dispositivo as Articulacao;
  }
  if (dispositivo.pai === undefined) {
    throw new Error('Não foi encontrada a articulação');
  }
  return getArticulacao(dispositivo.pai);
}

export function getDispositivo(uuid: number, dispositivo: Dispositivo | Articulacao): Dispositivo | Articulacao | null {
  if (dispositivo.uuid === uuid) {
    return dispositivo;
  } else if (dispositivo.filhos !== null) {
    let i;
    let result = null;

    for (i = 0; result === null && i < dispositivo.filhos.length; i++) {
      result = getDispositivo(uuid, dispositivo.filhos[i]);
    }
    return result;
  }
  return null;
}

export const findDispositivoById = (articulacao: Articulacao, uuid: number): Dispositivo | null => {
  if (uuid === undefined) {
    throw new Error('uuid não foi informado');
  }

  return getDispositivo(uuid, articulacao);
};

export const getUltimoFilho = (dispositivo: Dispositivo): Dispositivo => {
  if (dispositivo.filhos.length === 0) {
    return dispositivo;
  }

  const ultimoFilho = dispositivo.filhos[dispositivo.filhos.length - 1];

  return ultimoFilho!.filhos.length === 0 ? ultimoFilho : getUltimoFilho(ultimoFilho);
};

export const irmaosMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  return isArtigo(dispositivo) ? getArticulacao(dispositivo).artigos.filter(f => f.tipo === dispositivo.tipo) : dispositivo.pai!.filhos.filter(f => f.tipo === dispositivo.tipo);
};

export const getArtigo = (dispositivo: Dispositivo): Dispositivo => {
  if (isArtigo(dispositivo.pai!)) {
    return dispositivo.pai!;
  }
  return getArtigo(dispositivo.pai!);
};

export const isUnicoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f.length === 1;
};

export const isLastMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f[f.length - 1] === dispositivo;
};

export const isPenultimoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f.length > 1 && f[f.length - 2] === dispositivo;
};

export const isPrimeiroMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f[0] === dispositivo;
};

export const hasFilhos = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos && dispositivo.filhos.length > 0;
};

export const getDispositivoAnterior = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return pos > 0 ? dispositivo.pai!.filhos[pos - 1] : undefined;
};

export const getDispositivosPosteriores = (dispositivo: Dispositivo, isExclusao = false): Dispositivo[] => {
  if (isArtigo(dispositivo)) {
    const articulacao = getArticulacao(dispositivo);
    const pos = getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo);
    return articulacao.artigos.filter((artigo, index) => index > pos);
  }
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter(d => dispositivo.tipo === d.tipo).filter((disp, index) => (isExclusao ? index > pos : index >= pos));
};

export const getFilhosDispositivoAsLista = (dispositivos: Dispositivo[], filhos: Dispositivo[]): void => {
  filhos?.forEach(f => {
    dispositivos.push(f);
    if (hasFilhos(f)) {
      getFilhosDispositivoAsLista(dispositivos, f.filhos);
    }
  });
};

export const getDispositivoAndFilhosAsLista = (dispositivo: Dispositivo): Dispositivo[] => {
  const lista: Dispositivo[] = [];

  lista.push(dispositivo);
  getFilhosDispositivoAsLista(lista, dispositivo.filhos);

  return lista;
};

export const isDispositivoAlteracao = (dispositivo: Dispositivo): boolean => {
  const articulacao = getArticulacao(dispositivo);
  return articulacao !== undefined && !!articulacao.isBlocoAlteracao;
};

export const getDispositivosAlteracao = (articulacao?: Articulacao): Dispositivo[] => {
  const ff: Dispositivo[] = [];

  articulacao && articulacao.isBlocoAlteracao && hasFilhos(articulacao) ? getFilhosDispositivoAsLista(ff, articulacao.filhos) : undefined;

  return ff;
};

export const isArtigoUnico = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};

export const isParagrafoUnico = (dispositivo: Dispositivo): boolean => {
  return isParagrafo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};
