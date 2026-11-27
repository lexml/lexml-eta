import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArtigo, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  getDispositivoAnteriorNaSequenciaDeLeitura,
  getDispositivoPosteriorMesmoTipo,
  getDispositivosAnterioresMesmoTipo,
  getDispositivosPosteriores,
  getUltimoFilho,
  irmaosMesmoTipo,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isPrimeiroMesmoTipo,
  isUnicoMesmoTipo,
  podeRenumerarFilhosAutomaticamente,
  validaOrdemDispositivo,
} from '../hierarquia/hierarquiaUtil';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';
import { comparaNumeracao, hasRotuloPendente, podeRenumerarDispositivo } from './numeracaoUtil';
import { getIrregularidadeNumeracao, NumeracaoIrregular } from './numeracaoRepetida';
import { isValidacaoNumeracaoFlexivel } from './validacaoNumeracao';

const AUTOFIX_DA_IRREGULARIDADE: Record<NumeracaoIrregular, AutoFix> = {
  repetida: AutoFix.NUMERACAO_REPETIDA,
  complemento: AutoFix.NUMERACAO_COMPLEMENTO,
  lacuna: AutoFix.NUMERACAO_LACUNA,
  foraDeOrdem: AutoFix.NUMERACAO_FORA_DE_ORDEM,
};

export const getDispositivoAnteriorIgnorandoOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const d = getDispositivoAnteriorMesmoTipo(dispositivo);

  if (!d) {
    return d;
  }
  return getDispositivoAnteriorIgnorandoOmissis(d);
};

export const getDispositivoPosteriorIgnorandoOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const d = getDispositivoPosteriorMesmoTipo(dispositivo);

  if (!d) {
    return d;
  }
  return getDispositivoPosteriorIgnorandoOmissis(d);
};

export const validaNumeracaoDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (dispositivo === null) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não foi informado',
    });
  }
  if (dispositivo !== null && dispositivo.numero && dispositivo.numero.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém numeração',
    });
  }
  if (dispositivo !== null && !isOmissis(dispositivo) && dispositivo.rotulo && dispositivo.rotulo.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém rótulo',
    });
  }
  return mensagens;
};

export const validaNumeracaoDispositivoAlteracao = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (dispositivo === null) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não foi informado',
    });
  }
  if (dispositivo !== null && dispositivo.numero !== undefined && dispositivo.numero.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém numeração',
    });
  }
  if (dispositivo !== null && !isOmissis(dispositivo) && dispositivo.rotulo?.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém rótulo',
    });
  }

  if (dispositivo !== null && hasRotuloPendente(dispositivo)) {
    mensagens.push({
      tipo: TipoMensagem.CRITICAL,
      descricao: AutoFix.RENUMERAR_DISPOSITIVO,
      fix: podeRenumerarDispositivo(dispositivo),
    });
  }
  if (dispositivo !== null && isDispositivoAlteracao(dispositivo) && isParagrafo(dispositivo) && !isUnicoMesmoTipo(dispositivo) && dispositivo.rotulo?.endsWith('único.')) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Quando houver mais de um ${dispositivo.descricao}, não pode se tratar de '${dispositivo.descricao} único'`,
    });
  }

  if (
    dispositivo !== null &&
    !isDispositivoCabecaAlteracao(dispositivo) &&
    dispositivo.numero !== undefined &&
    isPrimeiroMesmoTipo(dispositivo) &&
    !isAgrupador(dispositivo.pai!) &&
    !isOmissis(dispositivo) &&
    (!getDispositivoAnterior(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && !isOmissis(getUltimoFilho(getDispositivoAnterior(dispositivo)!)))) &&
    dispositivo.numero !== '1' &&
    dispositivo.numero !== '1u'
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_ANTES,
      fix: true,
    });
  }

  if (
    dispositivo !== null &&
    !isDispositivoCabecaAlteracao(dispositivo) &&
    dispositivo.numero !== undefined &&
    dispositivo.pai!.indexOf(dispositivo) > 0 &&
    getDispositivoAnteriorMesmoTipo(dispositivo) &&
    dispositivo.tipo !== getDispositivoAnteriorMesmoTipo(dispositivo)?.rotulo &&
    !isOmissis(getDispositivoAnterior(dispositivo)!) &&
    !isOmissis(getDispositivoAnteriorNaSequenciaDeLeitura(dispositivo)!) &&
    !validaOrdemDispositivo(getDispositivoAnterior(dispositivo)!, dispositivo) &&
    dispositivo.numero !== getDispositivoAnteriorMesmoTipo(dispositivo)?.numero
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_ANTES,
      fix: true,
    });
  }

  if (
    dispositivo !== null &&
    dispositivo.numero !== undefined &&
    dispositivo.pai!.indexOf(dispositivo) > 0 &&
    getDispositivosAnterioresMesmoTipo(dispositivo)
      .filter(d => d.numero !== undefined)
      .filter(d => d !== dispositivo)
      .filter(anterior => dispositivo.numero !== anterior.numero && comparaNumeracao(dispositivo.numero, anterior.numero) === 1).length > 0
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número menor ao de algum dispositivo anterior',
    });
  }

  if (
    dispositivo !== null &&
    dispositivo.numero !== undefined &&
    !dispositivo.pai!.isLastFilho(dispositivo) &&
    getDispositivosPosteriores(dispositivo)
      .filter(d => d !== dispositivo && dispositivo.pai === d.pai && d.numero !== undefined)
      .filter(posterior => comparaNumeracao(posterior.numero, dispositivo.numero) === 1).length > 0
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número maior do que algum dispositivo posterior',
    });
  }
  if (dispositivo !== null && dispositivo.numero !== undefined && irmaosMesmoTipo(dispositivo).filter(d => d.numero && d.numero === dispositivo.numero).length > 1) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número igual ao de outro dispositivo',
    });
  }

  return mensagens;
};

export const validaNumeracao = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens = isDispositivoAlteracao(dispositivo) ? validaNumeracaoDispositivoAlteracao(dispositivo) : validaNumeracaoDispositivo(dispositivo);
  const encontrada = getIrregularidadeNumeracao(dispositivo);
  // A repetição só é avisada no modo flexível; no rígido, o arquivo com ids repetidos nem é aberto.
  const irregularidade = encontrada === 'repetida' && !isValidacaoNumeracaoFlexivel() ? undefined : encontrada;
  if (irregularidade) {
    // A repetição só tem correção onde a renumeração automática existe; os demais casos só são avaliados nesses grupos.
    const fix = irregularidade !== 'repetida' || (isArtigo(dispositivo) ? !isDispositivoAlteracao(dispositivo) : podeRenumerarFilhosAutomaticamente(dispositivo.pai!));
    mensagens.push({ tipo: TipoMensagem.ERROR, descricao: AUTOFIX_DA_IRREGULARIDADE[irregularidade], fix });
  }
  return mensagens;
};
