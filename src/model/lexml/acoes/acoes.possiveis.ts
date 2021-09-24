import {
  acoesDisponiveis,
  acoesPossiveisDispositivo,
  adicionarAlinea,
  adicionarArtigo,
  adicionarCapitulo,
  adicionarElementoAction,
  adicionarInciso,
  adicionarItem,
  ElementoAction,
  finalizarBlocoAlteracao,
  getAcaoAgrupamento,
  iniciarBlocoAlteracao,
  moverElementoAbaixo,
  moverElementoAcima,
  renumerarElemento,
  transformaAlineaEmItem,
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  transformarArtigoEmParagrafo,
  TransformarElemento,
  transformarEmOmissisAlinea,
  transformarEmOmissisIncisoCaput,
  transformarEmOmissisIncisoParagrafo,
  transformarEmOmissisItem,
  transformarEmOmissisParagrafo,
  transformarIncisoCaputEmAlinea,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
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
  getAgrupadorPosterior,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosterior,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasAgrupadoresPosteriores,
  hasDispositivosPosterioresAlteracao,
  hasFilhos,
  irmaosMesmoTipo,
  isPrimeiroMesmoTipo,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
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

  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
    acoes.push(moverElementoAbaixo);
  }
  if (!isAgrupador(dispositivo) && !isDispositivoGenerico(dispositivo) && getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
    acoes.push(moverElementoAcima);
  }

  //
  // Agrupador
  //
  if (isAgrupador(dispositivo) && dispositivo.pai && isArticulacao(dispositivo.pai) && irmaosMesmoTipo(dispositivo)[0] === dispositivo) {
    dispositivo.tiposPermitidosPai?.filter(tipo => tipo !== dispositivo.pai!.tipo).forEach(t => acoes.push(getAcaoAgrupamento(t)));
  }

  if (isAgrupador(dispositivo) && dispositivo.pai && !isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && dispositivo.pai!.indexOf(dispositivo) === 0) {
    const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
    dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
  }

  if (isAgrupador(dispositivo) && dispositivo.pai && dispositivo.pai!.indexOf(dispositivo) > 0 && isAgrupador(dispositivo.pai!) && !isArticulacao(dispositivo.pai)) {
    acoes.push(getAcaoAgrupamento(dispositivo.pai!.tipo));
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
  if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    acoes.push(isParagrafo(dispositivo.pai!.pai!) ? transformarAlineaEmIncisoParagrafo : transformarAlineaEmIncisoCaput);
  }
  if (isAlinea(dispositivo) && (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && isOmissis(getDispositivoAnterior(dispositivo)!)))) {
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
  if (
    isArtigo(dispositivo) &&
    dispositivo.pai &&
    !isDispositivoAlteracao(dispositivo) &&
    isArticulacao(dispositivo.pai) &&
    dispositivo.pai!.filhos.filter(d => isAgrupador(d)).length === 0
  ) {
    acoes.push(adicionarCapitulo);
  }
  if (isArtigo(dispositivo) && !isDispositivoAlteracao(dispositivo) && dispositivo.pai && hasAgrupadoresPosteriores(dispositivo)) {
    acoes.push(getAcaoAgrupamento(getAgrupadorPosterior(dispositivo).tipo));
  }
  if (isArtigo(dispositivo) && !isDispositivoAlteracao(dispositivo) && isAgrupador(dispositivo.pai!)) {
    const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo) ?? 0;
    dispositivo.tiposPermitidosPai
      ?.filter(() => pos > 0)
      .filter((tipo, index) => (dispositivo.pai!.indexOf(dispositivo) > 0 ? index >= pos! : index > pos!))
      .forEach(t => acoes.push(getAcaoAgrupamento(t)));
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
    acoes.push(acoesDisponiveis.filter(a => a instanceof TransformarElemento && a.nomeAcao === 'transformarDispositivoGenericoEm' + dispositivo.pai!.tipoProvavelFilho)[0]);
  }

  //
  // Inciso
  //
  if (isIncisoCaput(dispositivo) && (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && isOmissis(getDispositivoAnterior(dispositivo)!)))) {
    acoes.push(transformarIncisoCaputEmAlinea);
  }
  if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    acoes.push(transformarIncisoCaputEmParagrafo);
  }
  if (isIncisoCaput(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisIncisoCaput);
  }
  if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isPrimeiroMesmoTipo(dispositivo))) {
    acoes.push(transformarEmOmissisIncisoParagrafo);
  }
  if (
    isIncisoParagrafo(dispositivo) &&
    (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && isOmissis(getDispositivoAnterior(dispositivo)!)))
  ) {
    acoes.push(transformarIncisoParagrafoEmAlinea);
  }
  if (isIncisoParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisIncisoParagrafo);
  }
  if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    acoes.push(transformarIncisoParagrafoEmParagrafo);
  }

  //
  // Item
  //
  if (isItem(dispositivo)) {
    acoes = acoes.filter(a => a !== adicionarElementoAction);
  }
  if (isItem(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
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
  if (isParagrafo(dispositivo) && (isPrimeiroMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo))) {
    acoes.push(transformarParagrafoEmIncisoCaput);
  }
  if (isParagrafo(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))) {
    acoes.push(transformarParagrafoEmIncisoParagrafo);
  }
  if (isParagrafo(dispositivo) && (isUltimoMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo))) {
    acoes.push(transformarParagrafoEmArtigo);
  }
  if (isParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
    acoes.push(transformarEmOmissisParagrafo);
  }

  const acoesSemDuplicidade = [...new Set(acoes)];

  return acoesSemDuplicidade
    .filter(a => a !== undefined)
    .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
    .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
};

export const normalizaNomeAcao = (dispositivo: Dispositivo, tipo: string): any => {
  let t: string;

  if (tipo.endsWith('EmOmissis')) {
    const tipoDispositivo = tipo.replace('transformar', '').replace('EmOmissis', '');
    t = 'transformar' + tipoDispositivo + 'EmOmissis' + tipoDispositivo;
  } else {
    t = tipo;
  }

  const acoes: any = acoesPossiveis(dispositivo)
    .filter(a => a instanceof TransformarElemento)
    .filter((a: any) => a.nomeAcao === tipo || a.nomeAcao.replaceAll('IncisoCaput', 'Inciso').replaceAll('IncisoParagrafo', 'Inciso') === t);

  return acoes[0]?.nomeAcao;
};

export const isAcaoTransformacaoPermitida = (dispositivo: Dispositivo, nomeAcao: string): boolean => {
  return acoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && a.nomeAcao && a.nomeAcao === nomeAcao).length > 0;
};

export const getAcaoPossivelTab = (dispositivo: Dispositivo): any => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  if (isIncisoCaput(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))) {
    return transformarIncisoCaputEmAlinea;
  }

  if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    return transformarIncisoParagrafoEmAlinea;
  }

  return dispositivo.tiposPermitidosFilhos.map(tipo => {
    const complemento = isInciso(dispositivo) ? dispositivo.pai!.tipo : '';

    const destino = tipo.endsWith(TipoDispositivo.inciso.name!)
      ? isParagrafo(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))
        ? 'IncisoParagrafo'
        : 'IncisoCaput'
      : tipo;

    const acao = 'transformar' + dispositivo.tipo + complemento + 'Em' + destino;
    return acoesPossiveis(dispositivo)
      .filter(a => a instanceof TransformarElemento)
      .filter(a => a instanceof TransformarElemento && a.nomeAcao && acao && a.nomeAcao === acao)[0];
  })[0];
};

export const getAcaoPossivelShiftTab = (dispositivo: Dispositivo): any => {
  if (isAgrupador(dispositivo) || !dispositivo.tiposPermitidosFilhos) {
    return undefined;
  }

  if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    return transformarIncisoCaputEmParagrafo;
  }

  if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    return transformarIncisoParagrafoEmParagrafo;
  }

  if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
    return isParagrafo(dispositivo.pai!.pai!) ? transformarAlineaEmIncisoParagrafo : transformarAlineaEmIncisoCaput;
  }

  return dispositivo.tiposPermitidosPai?.map(tipo => {
    const acao = 'transformar' + dispositivo.tipo + 'Em' + tipo;

    return acoesPossiveis(dispositivo)
      .filter(a => a instanceof TransformarElemento)
      .filter(a => a instanceof TransformarElemento && a.nomeAcao && acao && a.nomeAcao === acao)[0];
  })[0];
};
