import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isDispositivoGenerico, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipo,
  getDispositivoPosteriorMesmoTipo,
  getDispositivosAnterioresMesmoTipo,
  getDispositivosPosteriores,
  getUltimoFilho,
  irmaosMesmoTipo,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isPrimeiroMesmoTipo,
  isUnicoMesmoTipo,
  validaOrdemDispositivo,
} from '../hierarquia/hierarquiaUtil';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';
import { comparaNumeracao } from './numeracaoUtil';

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
  if (
    dispositivo !== null &&
    !isDispositivoGenerico(dispositivo) &&
    dispositivo.rotulo?.endsWith(dispositivo.tipo) &&
    !(
      dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
      getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1' &&
      getDispositivoPosteriorMesmoTipo(dispositivo)?.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO
    )
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.RENUMERAR_DISPOSITIVO,
      fix: true,
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
  return isDispositivoAlteracao(dispositivo) ? validaNumeracaoDispositivoAlteracao(dispositivo) : validaNumeracaoDispositivo(dispositivo);
};
