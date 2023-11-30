import { isDispositivoCabecaAlteracao } from './../hierarquia/hierarquiaUtil';
/* eslint-disable indent */
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArtigo, isCaput, isParagrafo } from '../../dispositivo/tipo';
import { hasIndicativoFimAlteracao, normalizaSeForOmissis } from '../conteudo/conteudoUtil';
import {
  getArtigo,
  getDispositivoAnterior,
  isDispositivoAlteracao,
  isPrimeiroMesmoTipo,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { criaDispositivo } from './dispositivoLexmlFactory';
import { validaDispositivo } from './dispositivoValidator';

const converteFilhos = (atual: Dispositivo, destino: Dispositivo): void => {
  if (destino.tipoProvavelFilho! === undefined) {
    return;
  }
  atual.filhos.forEach((filho, index) => {
    const novo = criaDispositivo(
      isArtigo(destino) && TipoDispositivo.inciso.name === destino.tipoProvavelFilho! ? (destino as Artigo).caput! : destino,
      destino.tipoProvavelFilho!
    );
    novo.texto = filho.texto ?? '';
    novo.situacao = filho.situacao;
    novo.mensagens = validaDispositivo(novo);
    novo.createRotulo(novo);
    filho.filhos ? converteFilhos(filho, novo) : undefined;
    index === atual.filhos.length - 1 ? destino.renumeraFilhos() : undefined;
  });
};

export const converteDispositivo = (atual: Dispositivo, action: any): Dispositivo => {
  const paiAtual = atual.pai;
  let novo: Dispositivo;
  let paiNovo: Dispositivo;

  switch (action.subType) {
    case 'transformarAlineaEmItem':
    case 'transformarIncisoCaputEmAlinea':
    case 'transformarIncisoParagrafoEmAlinea':
    case 'transformarParagrafoEmIncisoParagrafo':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = criaDispositivo(paiNovo, action.novo.tipo);
      break;
    case 'transformarDispositivoGenericoEmInciso':
    case 'transformarDispositivoGenericoEmAlinea':
    case 'transformarDispositivoGenericoEmItem':
    case 'transformarOmissisEmAlinea':
    case 'transformarOmissisEmArtigo':
    case 'transformarOmissisEmIncisoCaput':
    case 'transformarOmissisEmIncisoParagrafo':
    case 'transformarOmissisEmItem':
    case 'transformarOmissisEmParagrafo':
    case 'transformarAlineaEmOmissisAlinea':
    case 'transformarItemEmOmissisItem':
    case 'transformarParagrafoEmOmissisParagrafo':
    case 'transformarParagrafoEmOmissisArtigo':
    case 'transformarIncisoCaputEmOmissisIncisoCaput':
    case 'transformarIncisoParagrafoEmOmissisIncisoParagrafo':
      paiNovo = paiAtual!;
      novo = criaDispositivo(paiAtual!, action.novo.tipo, undefined, paiAtual?.indexOf(atual));
      break;
    case 'transformarParagrafoEmInciso':
      if (isParagrafo(atual) && (isPrimeiroMesmoTipo(atual) || isUnicoMesmoTipo(atual))) {
        paiNovo = paiAtual!;
        novo = criaDispositivo((paiNovo as Artigo).caput!, action.novo.tipo);
        break;
      }
      paiNovo = getDispositivoAnterior(atual)!;
      novo = criaDispositivo(paiNovo, action.novo.tipo);
      break;
    case 'transformarParagrafoEmIncisoCaput':
      paiNovo = paiAtual!;
      novo = criaDispositivo((paiNovo as Artigo).caput!, action.novo.tipo);
      break;
    case 'transformarArtigoEmParagrafo':
      paiNovo = getDispositivoAnterior(atual)!;
      novo = criaDispositivo(paiNovo, action.novo.tipo);
      break;
    default:
      paiNovo = atual.pai!.pai!;
      novo = criaDispositivo(paiNovo, action.novo.tipo, atual.pai!);
      break;
  }
  novo!.texto = action.atual.conteudo?.texto ?? atual.texto;
  novo.createRotulo(novo);
  novo.situacao = atual.situacao;
  if (isDispositivoCabecaAlteracao(novo)) {
    novo.notaAlteracao = 'NR';
  }
  novo.mensagens = validaDispositivo(novo);
  paiAtual?.removeFilho(atual);
  paiAtual?.renumeraFilhos();
  paiNovo?.renumeraFilhos();
  converteFilhos(atual, novo!);

  return novo!;
};

export const copiaFilhos = (atual: Dispositivo, destino: Dispositivo): void => {
  if (atual.tipo !== destino.tipo) {
    return;
  }
  atual.filhos.forEach(filho => {
    const novo = criaDispositivo(isArtigo(destino) && isCaput(filho.pai!) ? (destino as Artigo).caput! : destino, filho.tipo);
    filho.rotulo ? (novo.rotulo = filho.rotulo) : novo.createRotulo(novo);
    novo.texto = filho.texto ?? '';
    novo.situacao = filho.situacao;
    atual.removeFilho(filho);
    novo.mensagens = validaDispositivo(filho);

    filho.filhos ? (atual.tipo === destino.tipo ? copiaFilhos(filho, novo) : converteFilhos(filho, novo)) : undefined;

    atual.filhos.length === 0 ? destino.renumeraFilhos() : undefined;
  });
};

export const podeSerUltimaalteracao = (dispositivo: Dispositivo, action: any): boolean => {
  if (!isDispositivoAlteracao(dispositivo)) {
    return false;
  }
  const artigo = getArtigo(dispositivo);
  return isUltimoMesmoTipo(artigo) && hasIndicativoFimAlteracao(normalizaSeForOmissis(action.atual?.conteudo?.texto ?? '')) && isUltimaAlteracao(dispositivo);
};
