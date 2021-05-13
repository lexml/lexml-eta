import {
  acoesPossiveisDispositivo,
  addElementoAction,
  ChangeElemento,
  ElementoAction,
  moverElementoAbaixo as moveElementoAbaixo,
  moverElementoAcima as moveElementoAcima,
  transformaAlineaEmInciso,
  transformaAlineaEmItem,
  transformaArtigoEmParagrafo,
  transformaIncisoCaputEmParagrafo,
  transformaIncisoEmAlinea,
  transformaIncisoEmParagrafo,
  transformaItemEmAlinea,
  transformaParagrafoEmArtigo,
  transformaParagrafoEmIncisoCaput,
  transformaParagrafoEmIncisoParagrafo,
} from '../../../redux/elemento-actions';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isAlinea, isArtigo, isDispositivoGenerico, isInciso, isIncisoCaput, isItem, isParagrafo } from '../../dispositivo/tipo';
import { isLastMesmoTipo, isPrimeiroMesmoTipo, isUnicoMesmoTipo } from '../hierarquia/hierarquia-util';

export const acoesPossiveis = (dispositivo: Dispositivo): ElementoAction[] => {
  let acoes: ElementoAction[] = [];

  acoes.push(...acoesPossiveisDispositivo);

  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && !isUnicoMesmoTipo(dispositivo) && !isLastMesmoTipo(dispositivo)) {
    acoes.push(moveElementoAbaixo);
  }
  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && !isUnicoMesmoTipo(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(moveElementoAcima);
  }

  if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaAlineaEmInciso);
  }
  if (isAlinea(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaAlineaEmItem);
  }
  if (isArtigo(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaArtigoEmParagrafo);
  }
  if (isInciso(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaIncisoEmAlinea);
  }
  if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaIncisoEmParagrafo);
  }
  if (isItem(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaItemEmAlinea);
  }
  if (isParagrafo(dispositivo) && isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaParagrafoEmIncisoCaput);
  }
  if (isParagrafo(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))) {
    acoes.push(transformaParagrafoEmIncisoParagrafo);
  }
  if (isParagrafo(dispositivo) && isLastMesmoTipo(dispositivo)) {
    acoes.push(transformaParagrafoEmArtigo);
  }
  if (isItem(dispositivo)) {
    acoes = acoes.filter(a => a !== addElementoAction);
  }

  if (isAgrupador(dispositivo)) {
    const i: number = acoes.findIndex((acao: ElementoAction) => acao.descricao === 'Remover dispositivo');
    if (i > -1) {
      acoes = acoes.slice(i, 1);
    }
  }

  return acoes.filter((acao: ElementoAction): boolean => {
    return acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo';
  });
};

export const getAcaoPossivelShift = (dispositivo: Dispositivo): ElementoAction | undefined => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  if (isParagrafo(dispositivo) && isPrimeiroMesmoTipo(dispositivo)) {
    return transformaParagrafoEmIncisoCaput;
  }

  return dispositivo.tiposPermitidosFilhos.map(tipoPermitido => {
    const acao = 'transforma' + dispositivo.tipo + 'Em' + tipoPermitido;
    return acoesPossiveis(dispositivo).filter(a => a instanceof ChangeElemento && a.nomeAcao && a.nomeAcao === acao)[0];
  })[0];
};

export const getAcaoPossivelShiftTab = (dispositivo: Dispositivo): ElementoAction | undefined => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    return transformaIncisoCaputEmParagrafo;
  }

  const acao = 'transforma' + dispositivo.tipo + 'Em' + dispositivo.pai!.tipo;
  return acoesPossiveis(dispositivo).filter(a => a instanceof ChangeElemento && a.nomeAcao && a.nomeAcao === acao)[0];
};
