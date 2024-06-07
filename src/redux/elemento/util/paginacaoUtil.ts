import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isCaput } from '../../../model/dispositivo/tipo';
import { ConfiguracaoPaginacao, PaginaArticulacao, RangeArtigos } from '../../../model/paginacao/paginacao';
import { Paginacao } from '../../state';
import {
  getArtigo,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnteriorNaSequenciaDeLeitura,
  getDispositivoPosteriorNaSequenciaDeLeitura,
  getUltimoFilho,
  hasEmenta,
  isDispositivoAlteracao,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Elemento } from '../../../model/elemento';
import { getElementos } from '../../../model/elemento/elementoUtil';
import { Revisao, RevisaoElemento } from '../../../model/revisao/revisao';
import { isRevisaoElemento, isRevisaoDeExclusao } from './revisaoUtil';

const MAX_DISPOSITIVOS_PAGINA = 1250;

export const configurarPaginacao = (articulacao: Articulacao, config?: ConfiguracaoPaginacao): Paginacao => {
  const paginasArticulacao = getPaginasArticulacao(articulacao, config);
  return {
    paginasArticulacao,
    paginaSelecionada: paginasArticulacao[0],
  };
};

const getPaginasArticulacao = (articulacao: Articulacao, config?: ConfiguracaoPaginacao): PaginaArticulacao[] => {
  const dispositivosAgrupadosPorPagina = config?.rangeArtigos
    ? paginarArticulacaoByNumerosArtigos(articulacao, config.rangeArtigos)
    : paginarArticulacao(articulacao, config?.maxItensPorPagina);
  return dispositivosAgrupadosPorPagina.map((dispositivos, index) => buildPaginaArticulacao(dispositivos, index + 1));
};

const buildPaginaArticulacao = (dispositivos: Dispositivo[], numPagina: number): PaginaArticulacao => {
  const artigos = dispositivos.filter(isArtigo);
  const artInicial = artigos[0];
  const artFinal = artigos[artigos.length - 1];
  return {
    descricao: `Pág. ${numPagina} (arts. ${artInicial.numero} a ${artFinal.numero})`,
    rangeArtigos: {
      numInicial: parseInt(artInicial.numero!.split('.')[0]),
      numFinal: parseInt(artFinal.numero!.split('.')[0]),
    },
    dispositivos,
    ids: dispositivos.map(d => d.id!),
  };
};

// ---

const getIndexFinal = (indexInicial: number, maxItensPorPagina: number, dispositivos: Dispositivo[]): number => {
  const indexFinal = indexInicial + maxItensPorPagina;
  if (indexFinal >= dispositivos.length) {
    return dispositivos.length;
  }
  let dispFinal = dispositivos[indexFinal];
  dispFinal = dispFinal.id?.startsWith('art')
    ? getUltimoFilho(isArtigo(dispFinal) ? dispFinal : getArtigo(dispFinal))
    : getDispositivoAnteriorNaSequenciaDeLeitura(dispFinal, d => !!d.id?.startsWith('art') && !isCaput(d))!;
  return dispositivos.indexOf(dispFinal) + 1;
};

const getArtigoFinal = (artigoInicial: Dispositivo, maxItensPorPagina: number, dispositivos: Dispositivo[]): Dispositivo => {
  const indexInicial = dispositivos.indexOf(artigoInicial);
  const indexFinal = getIndexFinal(indexInicial, maxItensPorPagina, dispositivos);
  const dispFinal = dispositivos[indexFinal - 1];
  const artigo = isArtigo(dispFinal) ? dispFinal : getArtigo(dispFinal);
  return isDispositivoAlteracao(artigo) ? getArtigo(artigo) : artigo;
};

export const paginarArticulacao = (articulacao: Articulacao, maxItensPorPagina = MAX_DISPOSITIVOS_PAGINA): Dispositivo[][] => {
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao);
  const rangeArtigos: RangeArtigos[] = [];

  const numPaginas = Math.ceil(dispositivos.length / maxItensPorPagina);

  let artInicialDaPagina = articulacao.artigos[0];
  for (let i = 0; i < numPaginas; i++) {
    const artFinalDaPagina = getArtigoFinal(artInicialDaPagina, maxItensPorPagina, dispositivos);
    rangeArtigos.push({
      numInicial: parseInt(artInicialDaPagina.numero!.split('.')[0]),
      numFinal: parseInt(artFinalDaPagina.numero!.split('.')[0]),
    });

    artInicialDaPagina = getDispositivoPosteriorNaSequenciaDeLeitura(artFinalDaPagina, d => isArtigo(d))!;

    if (!artInicialDaPagina) {
      break;
    }
  }

  return paginarArticulacaoByNumerosArtigos(articulacao, rangeArtigos);
};

export const paginarArticulacaoByNumerosArtigos = (articulacao: Articulacao, rangeArtigos: RangeArtigos[]): Dispositivo[][] => {
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao);
  const result: Dispositivo[][] = [];

  for (const range of rangeArtigos) {
    const artInicial = range.numInicial;
    const artFinal = range.numFinal;

    const idArtInicial = 'art' + artInicial;
    const idArtFinal = 'art' + artFinal;

    const indexArtInicial = dispositivos.findIndex(d => d.id === idArtInicial);
    const indexArtFinal = dispositivos.indexOf(getUltimoFilho(dispositivos.find(d => d.id === idArtFinal)!));

    const dispositivosPagina = dispositivos.slice(indexArtInicial, indexArtFinal + 1);

    // // Adiciona pais do primeiro artigo
    // dispositivosPagina.unshift(...getPaisDoPrimeiroArtigo(dispositivosPagina[0]));

    if (!result.length) {
      // Adiciona pais do primeiro artigo
      dispositivosPagina.unshift(...getPaisDoPrimeiroArtigo(dispositivosPagina[0]));
      if (hasEmenta(articulacao)) {
        dispositivosPagina.unshift(articulacao.projetoNorma!.ementa!);
      }
    } else {
      // Adicionar dispositivos entre o ultimo artigo anterior e o primeiro artigo da pagina atual
      dispositivosPagina.unshift(...getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina(dispositivos, indexArtInicial));
    }

    result.push(dispositivosPagina);
  }

  return result;
};

const getPaisDoPrimeiroArtigo = (dispositivo: Dispositivo): Dispositivo[] => {
  const pais: Dispositivo[] = [];
  let pai = dispositivo.pai;
  while (pai) {
    pais.unshift(pai);
    pai = pai.pai;
  }
  return pais;
};

const getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina = (dispositivos: Dispositivo[], indexArtInicial: number): Dispositivo[] => {
  const artigoAnterior = getDispositivoAnteriorNaSequenciaDeLeitura(dispositivos[indexArtInicial], d => isArtigo(d));
  if (!artigoAnterior) {
    return [];
  }
  const indexUltimoFilhoArtigoAnterior = dispositivos.indexOf(getUltimoFilho(artigoAnterior));
  const dispositivosEntreArtigos = dispositivos.slice(indexUltimoFilhoArtigoAnterior + 1, indexArtInicial);
  return dispositivosEntreArtigos;
};

// export const findPaginaByDispositivo = (paginacao: Paginacao, dispositivo: Dispositivo): PaginaArticulacao | undefined => {
//   return paginacao.paginasArticulacao?.find(p => p.ids.includes(dispositivo.id!));
// };

export const findPaginaByIdDispositivo = (paginacao: Paginacao, id: string): PaginaArticulacao | undefined => {
  return paginacao.paginasArticulacao?.find(p => p.ids.includes(id));
};

export const findPaginaByUuidDispositivo = (paginacao: Paginacao, uuid: number): PaginaArticulacao | undefined => {
  return paginacao.paginasArticulacao?.find(p => p.dispositivos.find(d => d.uuid === uuid));
};

export const isPaginaUnica = (state: any): boolean => {
  return state.ui?.paginacao?.paginasArticulacao?.length === 1;
};

export const findPaginaDoDispositivoAnterior = (paginacao: Paginacao, dispositivo: Dispositivo): PaginaArticulacao | undefined => {
  let pagina: PaginaArticulacao | undefined = undefined;
  let dRef: Dispositivo | undefined = dispositivo;

  // Existem casos em que o dispositivo anterior ao novo[0] é um dos dispositivos que estão sendo inseridos.
  // Ele está no array "novos", mas não aparece na ordem "correta".
  // Para estes casos, é preciso encontrar o dispositivo anterior que esteja em alguma página da paginacao.
  while (!pagina && dRef) {
    dRef = getDispositivoAnteriorNaSequenciaDeLeitura(dRef, d => !isCaput(d))!;
    dRef && (pagina = findPaginaByUuidDispositivo(paginacao, dRef.uuid!));
  }

  return pagina;
};

export const insereElementosExcluidosEmModoDeRevisaoNaLista = (elementos: Elemento[], elementosExcluidosEmModoDeRevisao: Elemento[]): void => {
  elementosExcluidosEmModoDeRevisao.forEach(eExc => {
    const indexElementoAnterior = elementos.findIndex(ea => ea.uuid === eExc.elementoAnteriorNaSequenciaDeLeitura?.uuid);
    indexElementoAnterior > -1 && elementos.splice(indexElementoAnterior + 1, 0, eExc);
  });
};

export const getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao = (state: any): Elemento[] => {
  const elementosExcluidosEmModoDeRevisao = state.revisoes
    .filter((r: Revisao) => isRevisaoElemento(r) && isRevisaoDeExclusao(r as RevisaoElemento))
    .map((r: RevisaoElemento) => r.elementoAntesRevisao);
  const elementos = getElementos(state.articulacao!);
  elementosExcluidosEmModoDeRevisao.length && insereElementosExcluidosEmModoDeRevisaoNaLista(elementos, elementosExcluidosEmModoDeRevisao);
  return elementos;
};
