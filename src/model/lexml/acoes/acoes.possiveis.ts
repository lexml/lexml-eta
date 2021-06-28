import {
  acoesDisponiveis,
  acoesPossiveisDispositivo,
  adicionarAlinea,
  adicionarArtigo,
  adicionarElementoAction,
  adicionarInciso,
  adicionarItem,
  ElementoAction,
  finalizarBlocoAlteracao,
  iniciarBlocoAlteracao,
  moverElementoAbaixo,
  moverElementoAcima,
  renumerarElemento,
  transformaAlineaEmItem,
  transformarAlineaEmInciso,
  transformarArtigoEmParagrafo,
  TransformarElemento,
  transformarEmOmissisAlinea,
  transformarEmOmissisIncisoCaput,
  transformarEmOmissisIncisoParagrafo,
  transformarEmOmissisItem,
  transformarEmOmissisParagrafo,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoEmAlinea,
  transformarItemEmAlinea,
  transformarOmissisEmAlinea,
  transformarOmissisEmArtigo,
  transformarOmissisEmIncisoCaput,
  transformarOmissisEmIncisoParagrafo,
  transformarOmissisEmItem,
  transformarOmissisEmParagrafo,
  transformarParagrafoEmArtigo,
  transformarParagrafoEmIncisoCaput,
  transformarParagrafoEmIncisoParagrafo,
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
import { hasIndicativoContinuacaoSequencia, hasIndicativoDesdobramento } from '../conteudo/conteudo-util';
import {
  getDispositivoAnterior,
  getDispositivoPosterior,
  hasDispositivosPosterioresAlteracao,
  hasFilhos,
  isLastMesmoTipo,
  isPrimeiroMesmoTipo,
  isUltimaAlteracao,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquia-util';

const podeConverterEmOmissis = (dispositivo: Dispositivo): boolean => {
  return (
    isDispositivoAlteracao(dispositivo.pai!) &&
    dispositivo.filhos.length === 0 &&
    dispositivo.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoAnterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoPosterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name
  );
};

export const acoesPossiveis = (dispositivo: Dispositivo): ElementoAction[] => {
  let acoes: ElementoAction[] = [];

  acoes.push(...acoesPossiveisDispositivo);

  //
  // Agrupador
  //
  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && !isUnicoMesmoTipo(dispositivo) && !isLastMesmoTipo(dispositivo)) {
    acoes.push(moverElementoAbaixo);
  }
  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && !isUnicoMesmoTipo(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(moverElementoAcima);
  }
  if (isAgrupador(dispositivo)) {
    const i: number = acoes.findIndex((acao: ElementoAction) => acao.descricao === 'Remover dispositivo');
    if (i > -1) {
      acoes = acoes.slice(i, 1);
    }
  }

  //
  // Alínea
  //
  if (isAlinea(dispositivo) && (dispositivo.texto.length === 0 || hasIndicativoContinuacaoSequencia(dispositivo))) {
    acoes.push(adicionarAlinea);
  }
  if (isAlinea(dispositivo) && (dispositivo.texto.length === 0 || hasIndicativoDesdobramento(dispositivo))) {
    acoes.push(adicionarItem);
  }
  if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformarAlineaEmInciso);
  }
  if (isAlinea(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformaAlineaEmItem);
  }
  if (isAlinea(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisAlinea);
  }

  //
  // Artigo
  //
  if (
    isArtigo(dispositivo) &&
    !dispositivo.hasAlteracao() &&
    !isDispositivoAlteracao(dispositivo) &&
    (dispositivo.texto.length === 0 || !hasIndicativoDesdobramento(dispositivo))
  ) {
    acoes.push(adicionarArtigo);
  }
  if (isArtigo(dispositivo) && !dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && (dispositivo.texto.length === 0 || hasIndicativoDesdobramento(dispositivo))) {
    acoes.push(adicionarInciso);
  }
  if (isArtigo(dispositivo) && !dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && !hasFilhos(dispositivo)) {
    acoes.push(iniciarBlocoAlteracao);
  }
  if (isArtigo(dispositivo) && dispositivo.pai!.indexOf(dispositivo) > 0) {
    acoes.push(transformarArtigoEmParagrafo);
  }

  //
  // Dispositivo de alteração
  //
  if (isDispositivoAlteracao(dispositivo) && !isDispositivoGenerico(dispositivo)) {
    acoes.push(renumerarElemento);
  }
  if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
    acoes.push(iniciarBlocoAlteracao);
    if (hasDispositivosPosterioresAlteracao(dispositivo)) {
      acoes.push(finalizarBlocoAlteracao);
    }
  }

  //
  // Dispositivo genérico
  //
  if (
    isDispositivoGenerico(dispositivo) &&
    (isParagrafo(dispositivo.pai!) || isCaput(dispositivo.pai!) || isInciso(dispositivo.pai!) || isAlinea(dispositivo.pai!)) &&
    dispositivo.pai!.tipoProvavelFilho!.length > 0
  ) {
    acoes.push(acoesDisponiveis.filter(a => a instanceof TransformarElemento && a.nomeAcao === 'transformaDispositivoGenericoEm' + dispositivo.pai!.tipoProvavelFilho)[0]);
  }

  //
  // Inciso
  //
  if (isInciso(dispositivo) && !isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformarIncisoEmAlinea);
  }
  if (isInciso(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformarIncisoCaputEmParagrafo);
  }
  if (isIncisoCaput(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisIncisoCaput);
  }
  if (isIncisoParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisIncisoParagrafo);
  }

  //
  // Item
  //
  if (isItem(dispositivo)) {
    acoes = acoes.filter(a => a !== adicionarElementoAction);
  }
  if (isItem(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    acoes.push(transformarItemEmAlinea);
  }
  if (isItem(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisItem);
  }

  //
  // Omissis
  //
  if (isOmissis(dispositivo) && isArticulacao(dispositivo.pai!) && getDispositivoAnterior(dispositivo) !== undefined) {
    acoes.push(transformarOmissisEmArtigo);
  }
  if (isOmissis(dispositivo) && isCaput(dispositivo.pai!)) {
    acoes.push(transformarOmissisEmIncisoCaput);
  }
  if (isOmissis(dispositivo) && isArtigo(dispositivo.pai!)) {
    acoes.push(transformarOmissisEmParagrafo);
  }
  if (isOmissis(dispositivo) && isParagrafo(dispositivo.pai!)) {
    acoes.push(transformarOmissisEmIncisoParagrafo);
  }
  if (isOmissis(dispositivo) && isInciso(dispositivo.pai!)) {
    acoes.push(transformarOmissisEmAlinea);
  }
  if (isOmissis(dispositivo) && isAlinea(dispositivo.pai!)) {
    acoes.push(transformarOmissisEmItem);
  }

  //
  // Parágrafo
  //
  if (isParagrafo(dispositivo) && isPrimeiroMesmoTipo(dispositivo)) {
    acoes.push(transformarParagrafoEmIncisoCaput);
  }
  if (isParagrafo(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))) {
    acoes.push(transformarParagrafoEmIncisoParagrafo);
  }
  if (isParagrafo(dispositivo) && (isLastMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo))) {
    acoes.push(transformarParagrafoEmArtigo);
  }
  if (isParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisParagrafo);
  }

  return acoes
    .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
    .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
};

/* export const ajustaAcaoSeCasoEspecialForInciso = (dispositivo: Dispositivo, acao: any): void => {
  const acaoNormalizada = acoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && acao.subType && acao.subType.includes('Inciso'))[0];

  acao.subType = acaoNormalizada && (acaoNormalizada as TransformarElemento).nomeAcao?.startsWith(acao.subType) ? (acaoNormalizada as TransformarElemento).nomeAcao : acao.subType;
}; */

export const isAcaoTransformacaoPermitida = (dispositivo: Dispositivo, acao: any): boolean => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return false;
  }
  return acoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && a.nomeAcao === acao.subType).length > 0;
};

export const getAcaoPossivelShift = (dispositivo: Dispositivo): ElementoAction | undefined => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  return dispositivo.tiposPermitidosFilhos.map(tipoPermitido => {
    const complemento = isInciso(dispositivo) ? dispositivo.pai!.tipo : '';
    const acao = 'transformar' + dispositivo.tipo + complemento + 'Em' + tipoPermitido;

    return acoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && a.nomeAcao && a.nomeAcao === acao)[0];
  })[0];
};

export const getAcaoPossivelShiftTab = (dispositivo: Dispositivo): ElementoAction | undefined => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo))) {
    return transformarIncisoCaputEmParagrafo;
  }
  const complemento = isInciso(dispositivo) ? dispositivo.pai!.tipo : '';
  const acao = 'transformar' + dispositivo.tipo + complemento + 'Em' + dispositivo.pai!.tipo;

  return acoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && a.nomeAcao && a.nomeAcao === acao)[0];
};
