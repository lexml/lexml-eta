import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoGenerico, isIncisoCaput, isParagrafo, Tipo } from '../../dispositivo/tipo';
import { omissis } from '../acao/adicionarElementoAction';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { isCaput, isOmissis } from './../../dispositivo/tipo';
import { TipoDispositivo } from './../tipo/tipoDispositivo';

export function getArticulacao(dispositivo: Dispositivo): Articulacao {
  if (!dispositivo) {
    return dispositivo as Articulacao;
  }
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
    let result: any = null;

    const filhos = dispositivo.hasAlteracao() ? dispositivo.alteracoes!.filhos : dispositivo.filhos;

    for (let i = 0; result === null && i < filhos.length; i++) {
      result = getDispositivo(uuid, filhos[i]);
    }
    return result;
  }
  return null;
}

export const findDispositivoByUuid = (dispositivo: Dispositivo, uuid: number): Dispositivo | null => {
  if (uuid === undefined) {
    throw new Error('uuid não foi informado');
  }
  return getDispositivo(uuid, dispositivo);
};

export const getUltimoFilho = (dispositivo: Dispositivo): Dispositivo => {
  if (hasFilhos(dispositivo)) {
    return getUltimoFilho(dispositivo.filhos[dispositivo.filhos.length - 1]);
  } else if (dispositivo?.hasAlteracao() && dispositivo.alteracoes?.filhos.length) {
    return getUltimoFilho(dispositivo.alteracoes.filhos[dispositivo.alteracoes.filhos.length - 1]);
  } else {
    return dispositivo;
  }
};

export const irmaosMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  return isArtigo(dispositivo)
    ? getArticulacao(dispositivo).artigos.filter(f => f.tipo === dispositivo.tipo)
    : dispositivo.pai
    ? dispositivo.pai!.filhos.filter(f => f.tipo === dispositivo.tipo)
    : [dispositivo];
};

export const getAgrupadoresPosterioresTipoAcima = (dispositivo: Dispositivo, tipo: Tipo): Dispositivo[] => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d) && dispositivo.tiposPermitidosPai!.indexOf(tipo.tipo) > 0);
};

export const getAgrupadoresAcima = (pai: Dispositivo, referencia: Dispositivo, agrupadores: Dispositivo[]): Dispositivo[] => {
  if (pai?.filhos) {
    for (let i = pai?.indexOf(referencia); i >= 0; i--) {
      const d = pai?.filhos[i];
      if (isAgrupador(d)) {
        agrupadores.push(d);
      }
    }
    if (pai?.pai) {
      return getAgrupadoresAcima(pai.pai, referencia.pai!, agrupadores);
    }
  }
  return agrupadores;
};

export const hasAgrupador = (pai: Dispositivo): boolean => {
  return pai.filhos.filter(a => isAgrupador(a)).length > 0;
};

export const hasAgrupadoresAcima = (dispositivo: Dispositivo): boolean => {
  const agrupadores: Dispositivo[] = [];
  if (dispositivo.pai?.pai === undefined) {
    return false;
  }

  return getAgrupadoresAcima(dispositivo.pai!.pai!, dispositivo.pai, agrupadores).length > 0;
};

export const getAgrupadorAcimaByTipo = (referencia: Dispositivo, tipo: string): Dispositivo | undefined => {
  return [...new Set(getAgrupadoresAcima(referencia.pai!, referencia, []))].filter(a => a.tipo === tipo).reverse()[0];
};

export const hasAgrupadoresAnterioresByTipo = (dispositivo: Dispositivo, tipo: string): boolean => {
  return getAgrupadoresAcima(dispositivo.pai!.pai!, dispositivo.pai!, []).filter(d => d.tipo === tipo).length > 0;
};

export const getAgrupadoresAcimaByTipo = (dispositivo: Dispositivo, tipo: string): Dispositivo | undefined => {
  if (!dispositivo || !dispositivo.pai) {
    return undefined;
  }
  if (dispositivo.pai && dispositivo.pai.tipo === tipo) {
    return dispositivo.pai;
  }
  return getAgrupadoresAcimaByTipo(dispositivo.pai!, tipo);
};

export const hasAgrupadoresAcimaByTipo = (dispositivo: Dispositivo, tipo: string): boolean => {
  return getAgrupadoresAcimaByTipo(dispositivo, tipo) !== undefined;
};

export const getArtigo = (dispositivo: Dispositivo): Dispositivo => {
  if (isArtigo(dispositivo.pai!)) {
    return dispositivo.pai!;
  }
  return getArtigo(dispositivo.pai!);
};

export const getArtigoDoProjeto = (dispositivo: Dispositivo): Dispositivo => {
  const pai = dispositivo.pai!;
  if (isArtigo(pai) && !isDispositivoAlteracao(pai)) {
    return dispositivo.pai!;
  }
  return getArtigoDoProjeto(dispositivo.pai!);
};

export const getArtigosPosterioresIndependenteAgrupador = (dispositivo: Dispositivo): Dispositivo[] => {
  const pos = getArticulacao(dispositivo).indexOfArtigo(dispositivo);

  if (pos === -1 || getArticulacao(dispositivo).artigos.length === pos + 1) {
    return [];
  }
  return getArticulacao(dispositivo).artigos.filter((artigo, index) => index > pos);
};

export const getProximoArtigoAnterior = (pai: Dispositivo, referencia: Dispositivo): Dispositivo | undefined => {
  if (pai?.filhos) {
    for (let i = pai?.indexOf(referencia) - 1; i >= 0; i--) {
      const d = pai?.filhos[i];
      if (isArtigo(d)) {
        return d;
      }
      if (isAgrupador(d)) {
        return buscaArtigoAnteriorAbaixo(d);
      }
    }
    if (pai?.pai) {
      return getProximoArtigoAnterior(pai.pai, referencia.pai!);
    }
  }
  return undefined;
};

const buscaArtigoAnteriorAbaixo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  if (dispositivo === undefined) {
    return undefined;
  }

  if (dispositivo.filhos) {
    for (let i = dispositivo.filhos.length - 1; i >= 0; i--) {
      const d = dispositivo.filhos[i];
      if (isArtigo(d)) {
        return d;
      }
      if (isAgrupador(d)) {
        return buscaArtigoAnteriorAbaixo(d);
      }
    }
  }
  return undefined;
};

export const getAgrupadorPosterior = (dispositivo: Dispositivo): Dispositivo => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d))[0];
};

export const hasAgrupadoresPosteriores = (dispositivo: Dispositivo): boolean => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d)).length > 0;
};

export const hasFilhoGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos?.filter(d => isDispositivoGenerico(d)).length > 0;
};

export const isUnicoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f.length === 1;
};

export const isUltimoMesmoTipo = (dispositivo: Dispositivo): boolean => {
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
  const pos = dispositivo.pai?.indexOf(dispositivo);
  return pos && pos > 0 ? dispositivo.pai!.filhos[pos - 1] : undefined;
};

export const getDispositivoAnteriorMesmoTipo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const irmaos = irmaosMesmoTipo(dispositivo);
  const pos = irmaos.indexOf(dispositivo);
  return pos > 0 ? irmaos[pos - 1] : undefined;
};

export const getDispositivoAnteriorMesmoTipoInclusiveOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);

  if (pos === 0) {
    return undefined;
  }

  const irmaos = dispositivo.pai!.filhos.filter((f, index) => index < pos && (f.tipo === dispositivo.tipo || f.tipo === omissis.tipo));
  return irmaos.pop();
};

export const getDispositivoPosterior = (dispositivo: Dispositivo): Dispositivo | undefined => {
  if (!dispositivo.pai) {
    return undefined;
  }
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return pos < dispositivo.pai!.filhos.length - 1 ? dispositivo.pai!.filhos[pos + 1] : undefined;
};

export const getDispositivoPosteriorMesmoTipo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const irmaos = irmaosMesmoTipo(dispositivo);
  const pos = irmaos.indexOf(dispositivo);
  return pos < irmaos.length - 1 ? irmaos[pos + 1] : undefined;
};

export const getDispositivosAnterioresMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  const pos = dispositivo.pai?.indexOf(dispositivo);
  return dispositivo.pai?.filhos.filter((f, index) => index < pos! && f.tipo === dispositivo.tipo && f.pai === dispositivo.pai) ?? [];
};

export const getDispositivosPosterioresMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  const pos = dispositivo.pai?.indexOf(dispositivo);
  return dispositivo.pai?.filhos.filter((f, index) => index > pos! && f.tipo === dispositivo.tipo) ?? [];
};

export const getDispositivoPosteriorMesmoTipoInclusiveOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);

  if (pos === dispositivo.pai!.filhos.length - 1) {
    return undefined;
  }

  const irmaos = dispositivo.pai!.filhos.filter((f, index) => index > pos && (f.tipo === dispositivo.tipo || f.tipo === omissis.tipo));
  return irmaos[0];
};

export const getDispositivosAnteriores = (dispositivo: Dispositivo, isExclusao = false): Dispositivo[] => {
  if (isArtigo(dispositivo)) {
    const articulacao = getArticulacao(dispositivo);
    const pos = getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo);
    return articulacao.artigos.filter((artigo, index) => index < pos);
  }
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((disp, index) => (isExclusao ? index > pos : index >= pos)).filter(d => dispositivo.tipo === d.tipo);
};

export const getDispositivosPosteriores = (dispositivo: Dispositivo, isExclusao = false): Dispositivo[] => {
  if (isArtigo(dispositivo)) {
    const articulacao = getArticulacao(dispositivo);
    const pos = getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo);
    return articulacao.artigos.filter((artigo, index) => index > pos);
  }
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((disp, index) => (isExclusao ? index > pos : index >= pos)).filter(d => dispositivo.tipo === d.tipo);
};

export const isArtigoUnico = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};

export const isParagrafoUnico = (dispositivo: Dispositivo): boolean => {
  return isParagrafo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};

export const getDispositivoCabecaAlteracao = (dispositivo: Dispositivo): Dispositivo => {
  return dispositivo.cabecaAlteracao || isDispositivoCabecaAlteracao(dispositivo) ? dispositivo : getDispositivoCabecaAlteracao(dispositivo.pai!);
};

export const isDispositivoCabecaAlteracao = (dispositivo: Dispositivo): boolean => {
  return isDispositivoAlteracao(dispositivo) && isArticulacao(dispositivo.pai!) && dispositivo.pai!.pai !== undefined;
};

export const isAntesDoPrimeiroDispositivoOriginal = (dispositivo: Dispositivo): boolean => {
  return getDispositivosPosterioresMesmoTipo(dispositivo).filter(d => isOriginal(d) && d.numero === '1').length > 0;
};

export const isUltimaAlteracao = (dispositivo: Dispositivo): boolean => {
  const atual = getDispositivoCabecaAlteracao(dispositivo);
  const lista = getDispositivoAndFilhosAsLista(atual);

  return lista.length > 0 && lista[lista.length - 1] === dispositivo;
};

export const hasDispositivosPosterioresAlteracao = (dispositivo: Dispositivo): boolean => {
  const atual = getArticulacao(dispositivo).pai;

  if (!atual) {
    return false;
  }

  const articulacao = getArticulacao(atual!);

  return isUnicoMesmoTipo(atual) || articulacao.indexOfArtigo(atual) < articulacao.artigos.length - 1;
};

export const isArticulacaoAlteracao = (articulacao: Dispositivo): boolean => {
  return isArticulacao(articulacao) && articulacao.pai !== undefined;
};

export const isDispositivoAlteracao = (dispositivo: Dispositivo): boolean => {
  const r = !!dispositivo.isDispositivoAlteracao;

  if (r) {
    return true;
  }

  try {
    return getArticulacao(dispositivo).pai !== undefined;
  } catch (error) {
    return false;
  }
};

export const podemSerRenumerados = (dispositivos: Dispositivo[]): boolean => {
  return (
    dispositivos?.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_NOVO).length === dispositivos.length ||
    dispositivos?.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO).length === dispositivos.length
  );
};

export const getDispositivosAdicionados = (dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos?.filter(d => d.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO);
};

export const hasDispositivosBySituacao = (dispositivos: Dispositivo[], descricaoSituacao: string): boolean => {
  return dispositivos?.filter(d => d.situacao.descricaoSituacao === descricaoSituacao).length > 0;
};

export const isOriginal = (dispositivo: Dispositivo): boolean => {
  return dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL;
};

export const isOriginalAlteradoModificadoOuSuprimido = (dispositivo: Dispositivo): boolean => {
  return dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO || dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO;
};

export const getSomenteFilhosDispositivoAsLista = (dispositivos: Dispositivo[], filhos: Dispositivo[]): Dispositivo[] => {
  filhos?.forEach(f => {
    dispositivos.push(f);
    if (hasFilhos(f)) {
      getSomenteFilhosDispositivoAsLista(dispositivos, f.filhos);
    }
  });

  return dispositivos;
};

export const getDispositivoAndFilhosAsLista = (dispositivo: Dispositivo): Dispositivo[] => {
  return buildListaDispositivos(dispositivo, []);
};

export const buildListaDispositivos = (dispositivo: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  dispositivos.push(dispositivo);
  const filhos = dispositivo.hasAlteracao() ? dispositivo.alteracoes!.filhos : dispositivo.filhos;
  filhos.length ? filhos.forEach(d => buildListaDispositivos(d, dispositivos)) : undefined;
  return dispositivos;
};

export const percorreHierarquiaDispositivos = (d: Dispositivo, visit: (d: Dispositivo) => void): void => {
  if (!d) return;
  visit(d);
  if (d.tipo === TipoDispositivo.artigo.tipo) {
    const artigo = d as Artigo;
    if (artigo.caput) {
      percorreHierarquiaDispositivos(artigo.caput, visit);
      if (d.alteracoes) {
        percorreHierarquiaDispositivos(d.alteracoes, visit);
      }
      d.filhos
        .filter(f => isParagrafo(f) || (isOmissis(f) && !isCaput(f.pai!)))
        .forEach(f => {
          percorreHierarquiaDispositivos(f, visit);
        });
    }
  } else {
    if (d.alteracoes) {
      percorreHierarquiaDispositivos(d.alteracoes, visit);
    }
    d.filhos.forEach(f => {
      percorreHierarquiaDispositivos(f, visit);
    });
  }
};

export const buscaNaHierarquiaDispositivos = (d: Dispositivo, visit: (d: Dispositivo) => any): any => {
  if (!d) return undefined;
  let ret = visit(d);
  if (ret) return ret;
  if (d.tipo === TipoDispositivo.artigo.tipo) {
    const artigo = d as Artigo;
    if (artigo.caput) {
      ret = buscaNaHierarquiaDispositivos(artigo.caput, visit);
      if (ret) return ret;
      if (d.alteracoes) {
        ret = buscaNaHierarquiaDispositivos(d.alteracoes, visit);
        if (ret) return ret;
      }
      for (const f of d.filhos.filter(f => isParagrafo(f) || (isOmissis(f) && !isCaput(f.pai!)))) {
        ret = buscaNaHierarquiaDispositivos(f, visit);
        if (ret) return ret;
      }
    }
  } else {
    if (d.alteracoes) {
      ret = buscaNaHierarquiaDispositivos(d.alteracoes, visit);
      if (ret) return ret;
    }
    for (const f of d.filhos) {
      ret = buscaNaHierarquiaDispositivos(f, visit);
      if (ret) return ret;
    }
  }
};

export const isDispositivoRaiz = (d: Dispositivo): boolean => {
  return d && !d.pai && d.tipo === TipoDispositivo.articulacao.tipo;
};

export const buscaDispositivoById = (articulacao: Articulacao, id: string): Dispositivo | undefined => {
  const idArtigo = extraiIdArtigo(id);
  let raiz: Dispositivo = articulacao;
  if (idArtigo) {
    const artigo = articulacao.artigos.find(a => idArtigo === a.id);
    if (artigo) {
      if (id === idArtigo || id === idArtigo + '_cpt') {
        return artigo;
      } else {
        raiz = artigo;
      }
    }
  }
  return buscaNaHierarquiaDispositivos(raiz, d => {
    return id === d.id ? d : undefined;
  });
};

export const extraiIdArtigo = (id: string): string | undefined => {
  const l = /^art\d+(-\d+)*/.exec(id);
  return l?.length ? l[0] : undefined;
};

export const isAscendente = (d: Dispositivo, dAscendente: Dispositivo): boolean => {
  if (!d || !dAscendente) {
    return false;
  }
  let pai = d.pai;
  while (pai) {
    if (pai === dAscendente) {
      return true;
    }
    pai = pai.pai;
  }
  return false;
};

export const isDescendenteDeSuprimido = (d: Dispositivo): boolean => {
  if (!d) {
    return false;
  }
  let pai = d.pai;
  while (pai) {
    if (pai.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      return true;
    }
    pai = pai.pai;
  }
  return false;
};

export const verificaNaoPrecisaInformarSituacaoNormaVigente = (d: Dispositivo): boolean => {
  const parent = isIncisoCaput(d) ? d.pai!.pai : d.pai;

  if (parent === undefined || !isDispositivoAlteracao(d) || d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    return true;
  }

  if (parent.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
    return false;
  }

  const paiExisteNaNormaAlterada = (parent.situacao as DispositivoAdicionado).existeNaNormaAlterada;
  if (paiExisteNaNormaAlterada !== undefined && !paiExisteNaNormaAlterada) {
    return true;
  }

  return verificaNaoPrecisaInformarSituacaoNormaVigente(parent);
};

export const validaOrdemDispositivo = (anterior: Dispositivo, atual: Dispositivo): boolean => {
  if ((anterior.numero!.indexOf('-') === -1 && atual.numero!.indexOf('-') === -1) || anterior.numero!.indexOf('-') === atual.numero!.indexOf('-')) {
    return +anterior.numero!.charAt(anterior.numero!.length - 1) + 1 === +atual.numero!.charAt(anterior.numero!.length - 1);
  }
  const partesA = anterior.numero!.split('-');
  const partesB = atual.numero!.split('-');

  const [numA, ...remainingA] = partesA!;
  const [numB, ...remainingB] = partesB!;

  if (+numA + 1 === +numB) {
    return true;
  }

  for (let i = 0; i < 3; i++) {
    const rA = i >= remainingA?.length ? 0 : remainingA[i];
    for (let j = 0; i < 3; i++) {
      const rB = j >= remainingB?.length ? 0 : remainingB[j];
      if (+rA === +rB) {
        continue;
      }
      if (+rA + 1 === +rB) {
        return true;
      }
      return false;
    }
  }
  return true;
};

export const buscaProximoOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  if (!dispositivo || !dispositivo.pai || isAgrupador(dispositivo.pai!)) {
    return undefined;
  }

  const posterior = getDispositivoPosterior(dispositivo);

  if (posterior && isOmissis(posterior)) {
    return posterior;
  }

  if (isCaput(dispositivo)) {
    const p = dispositivo.pai.filhos.filter(f => isParagrafo(f) || isOmissis(f));
    if (p.length > 0 && isOmissis(p[0])) {
      return p[0];
    }
    return undefined;
  }

  return dispositivo.pai ? buscaProximoOmissis(dispositivo.pai!) : undefined;
};

export const isDispositivoNovoNaNormaAlterada = (dispositivo: Dispositivo): boolean | undefined => {
  const value = (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada;
  if (!isDispositivoAlteracao(dispositivo) || value === undefined) {
    return;
  }
  const situacoes = [DescricaoSituacao.DISPOSITIVO_ADICIONADO + ''];
  return situacoes.includes(dispositivo.situacao?.descricaoSituacao) && !value;
};

export const podeRenumerarFilhosAutomaticamente = (dispositivo: Dispositivo): boolean => {
  const d = dispositivo.tipo === 'Caput' ? dispositivo.pai! : dispositivo;
  return !!isDispositivoNovoNaNormaAlterada(d);
};
