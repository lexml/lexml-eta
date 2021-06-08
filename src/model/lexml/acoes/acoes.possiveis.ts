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
  transformaEmDispositivoAlteracaoNorma,
  transformaEmOmissisAlinea,
  transformaEmOmissisIncisoCaput,
  transformaEmOmissisIncisoParagrafo,
  transformaEmOmissisItem,
  transformaEmOmissisParagrafo,
  transformaIncisoCaputEmParagrafo,
  transformaIncisoEmAlinea,
  transformaIncisoEmParagrafo,
  transformaItemEmAlinea,
  transformaOmissisEmAlinea,
  transformaOmissisEmArtigo,
  transformaOmissisEmIncisoCaput,
  transformaOmissisEmIncisoParagrafo,
  transformaOmissisEmItem,
  transformaOmissisEmParagrafo,
  transformaParagrafoEmArtigo,
  transformaParagrafoEmIncisoCaput,
  transformaParagrafoEmIncisoParagrafo,
} from '../../../redux/elemento-actions';
import { isDispositivoAlteracao } from '../../../redux/elemento-reducer-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import {
  isAgrupador,
  isAlinea,
  isArticulacao,
  isArtigo,
  isCaput,
  isDispositivoGenerico,
  isInciso,
  isIncisoCaput,
  isIncisoParagrafo,
  isItem,
  isOmissis,
  isParagrafo,
  TipoDispositivo,
} from '../../dispositivo/tipo';
import { getDispositivoAnterior, getDispositivoPosterior, isLastMesmoTipo, isPrimeiroMesmoTipo, isUnicoMesmoTipo } from '../hierarquia/hierarquia-util';

const podeConverterEmOmissis = (dispositivo: Dispositivo): boolean => {
  return (
    isDispositivoAlteracao(dispositivo.pai!) &&
    dispositivo.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoAnterior(dispositivo) !== TipoDispositivo.omissis.name &&
    getDispositivoPosterior(dispositivo) !== TipoDispositivo.omissis.name
  );
};

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
  if (isAlinea(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformaEmOmissisAlinea);
  }

  if (isArtigo(dispositivo) && !dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo)) {
    acoes.push(transformaEmDispositivoAlteracaoNorma);
  }
  if (isArtigo(dispositivo) && dispositivo.pai!.indexOf(dispositivo) > 0) {
    acoes.push(transformaArtigoEmParagrafo);
  }
  if (
    isDispositivoGenerico(dispositivo) &&
    (isParagrafo(dispositivo.pai!) || isCaput(dispositivo.pai!) || isInciso(dispositivo.pai!) || isAlinea(dispositivo.pai!)) &&
    dispositivo.pai!.tipoProvavelFilho!.length > 0
  ) {
    acoes.push(acoesDisponiveis.filter(a => a instanceof ChangeElemento && a.nomeAcao === 'transformaDispositivoGenericoEm' + dispositivo.pai!.tipoProvavelFilho)[0]);
  }

  if (isInciso(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaIncisoEmAlinea);
  }
  if (isInciso(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaIncisoEmParagrafo);
  }
  if (isIncisoCaput(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformaEmOmissisIncisoCaput);
  }
  if (
    isIncisoParagrafo(dispositivo) &&
    dispositivo.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoAnterior(dispositivo) !== TipoDispositivo.omissis.name &&
    getDispositivoPosterior(dispositivo) !== TipoDispositivo.omissis.name
  ) {
    acoes.push(transformaEmOmissisIncisoParagrafo);
  }

  if (isItem(dispositivo)) {
    acoes = acoes.filter(a => a !== addElementoAction);
  }
  if (isItem(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformaItemEmAlinea);
  }
  if (isItem(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformaEmOmissisItem);
  }
  if (isOmissis(dispositivo) && isArticulacao(dispositivo.pai!) && getDispositivoAnterior(dispositivo) !== undefined) {
    acoes.push(transformaOmissisEmArtigo);
  }
  if (isOmissis(dispositivo) && isCaput(dispositivo.pai!)) {
    acoes.push(transformaOmissisEmIncisoCaput);
  }
  if (isOmissis(dispositivo) && isArtigo(dispositivo.pai!)) {
    acoes.push(transformaOmissisEmParagrafo);
  }
  if (isOmissis(dispositivo) && isParagrafo(dispositivo.pai!)) {
    acoes.push(transformaOmissisEmIncisoParagrafo);
  }
  if (isOmissis(dispositivo) && isInciso(dispositivo.pai!)) {
    acoes.push(transformaOmissisEmAlinea);
  }
  if (isOmissis(dispositivo) && isAlinea(dispositivo.pai!)) {
    acoes.push(transformaOmissisEmItem);
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
  if (isParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformaEmOmissisParagrafo);
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
