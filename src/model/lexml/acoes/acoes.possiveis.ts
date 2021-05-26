import {
  acoesDisponiveis,
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
import { isAgrupador, isAlinea, isArtigo, isCaput, isDispositivoGenerico, isInciso, isIncisoCaput, isItem, isParagrafo } from '../../dispositivo/tipo';
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

  if (
    isDispositivoGenerico(dispositivo) &&
    (isParagrafo(dispositivo.pai!) || isCaput(dispositivo.pai!) || isInciso(dispositivo.pai!) || isAlinea(dispositivo.pai!)) &&
    dispositivo.pai!.tipoProvavelFilho!.length > 0
  ) {
    acoes.push(acoesDisponiveis.filter(a => a instanceof ChangeElemento && a.nomeAcao === 'transformaDispositivoGenericoEm' + dispositivo.pai!.tipoProvavelFilho)[0]);
  }

  if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaAlineaEmInciso);
  }
  if (isAlinea(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaAlineaEmItem);
  }
  if (isArtigo(dispositivo) && dispositivo.pai!.indexOf(dispositivo) > 0) {
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
  if (isParagrafo(dispositivo) && (isLastMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo))) {
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

export const ajustaAcaoSeCasoEspecialForInciso = (dispositivo: Dispositivo, acao: any): void => {
  const acaoNormalizada = acoesPossiveis(dispositivo).filter(a => a instanceof ChangeElemento && acao.subType && acao.subType.endsWith('EmInciso'))[0];

  acao.subType = acaoNormalizada && (acaoNormalizada as ChangeElemento).nomeAcao?.startsWith(acao.subType) ? (acaoNormalizada as ChangeElemento).nomeAcao : acao.subType;
};

export const isAcaoTransformacaoPermitida = (dispositivo: Dispositivo, acao: any): boolean => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return false;
  }
  return acoesPossiveis(dispositivo).filter(a => a instanceof ChangeElemento && a.nomeAcao === acao.subType).length > 0;
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
