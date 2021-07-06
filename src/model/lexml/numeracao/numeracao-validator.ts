import { isDispositivoAlteracao } from '../../../redux/elemento-reducer-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isDispositivoDeArtigo, isDispositivoGenerico, isOmissis, TipoDispositivo } from '../../dispositivo/tipo';
import { getDispositivoAnterior, getDispositivoAnteriorMesmoTipo, getDispositivoPosterior, getDispositivoPosteriorMesmoTipo, irmaosMesmoTipo } from '../hierarquia/hierarquia-util';
import { Mensagem, TipoMensagem } from '../util/mensagem';
import { comparaNumeracao, isNumero } from './numeracao-util';

const isRotuloConsistente = (dispositivo: Dispositivo): boolean => {
  const rotulo = dispositivo.rotulo;

  dispositivo.numero === undefined ? dispositivo.pai?.renumeraFilhos() : dispositivo.createRotulo(dispositivo);

  return rotulo === dispositivo.rotulo;
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
  if (dispositivo !== null && dispositivo.rotulo && dispositivo.rotulo.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém rótulo',
    });
  }
  if (dispositivo !== null && !isDispositivoGenerico(dispositivo) && dispositivo.rotulo && !isRotuloConsistente(dispositivo)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O rótulo informado não é consistente com a regra de formação de rótulo para este dispositivo',
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
  if (dispositivo !== null && dispositivo.numero && dispositivo.numero.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém numeração',
    });
  }
  if (dispositivo !== null && dispositivo.rotulo && dispositivo.rotulo.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não contém rótulo',
    });
  }
  if (dispositivo !== null && !isDispositivoGenerico(dispositivo) && dispositivo.rotulo && dispositivo.rotulo.endsWith(dispositivo.tipo)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O rótulo informado não é válido. Numere o dispositivo',
    });
  }

  if (dispositivo !== null && isDispositivoDeArtigo(dispositivo) && dispositivo.numero && dispositivo.pai?.indexOf(dispositivo) === 0 && dispositivo.numero !== '1') {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'É necessário um omissis antes deste dispositivo',
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoAlteracao(dispositivo) &&
    isOmissis(dispositivo) &&
    (getDispositivoAnterior(dispositivo)?.tipo === TipoDispositivo.omissis.name || getDispositivoPosterior(dispositivo)?.tipo === TipoDispositivo.omissis.name)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'Não pode haver mais de um omissis sequencialmente',
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoDeArtigo(dispositivo) &&
    dispositivo.numero &&
    dispositivo.pai!.indexOf(dispositivo) > 0 &&
    irmaosMesmoTipo(dispositivo)
      .filter((d, i) => i < dispositivo.pai!.indexOf(dispositivo) && d.numero)
      .filter(d => comparaNumeracao(d.numero, dispositivo.numero) === -1).length > 0
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número menor do que algum dispositivo anterior',
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoDeArtigo(dispositivo) &&
    dispositivo.numero &&
    !dispositivo.pai!.isLastFilho(dispositivo) &&
    irmaosMesmoTipo(dispositivo)
      .filter((d, i) => i > dispositivo.pai!.indexOf(dispositivo) && d.numero)
      .filter(d => comparaNumeracao(d.numero, dispositivo.numero) === 1).length > 0
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número maior do que algum dispositivo posterior',
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoDeArtigo(dispositivo) &&
    dispositivo.numero &&
    irmaosMesmoTipo(dispositivo).filter(d => d.numero && d.numero === dispositivo.numero).length > 1
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo tem número igual a de outro dispositivo',
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoDeArtigo(dispositivo) &&
    dispositivo.numero &&
    isNumero(dispositivo.numero) &&
    parseInt(dispositivo.numero) > 2 &&
    dispositivo.pai!.indexOf(dispositivo) > 0 &&
    getDispositivoAnteriorMesmoTipo(dispositivo) &&
    dispositivo.tipo !== getDispositivoAnteriorMesmoTipo(dispositivo)?.rotulo &&
    irmaosMesmoTipo(dispositivo).filter(d => d.numero && d.numero === dispositivo.numero).length === 0 &&
    parseInt(dispositivo.numero) !== parseInt(getDispositivoAnteriorMesmoTipo(dispositivo)!.numero!) + 1
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'É necessário um omissis antes deste dispositivo',
    });
  }
  return mensagens;
};

export const validaNumeracao = (dispositivo: Dispositivo): Mensagem[] => {
  return isDispositivoAlteracao(dispositivo) ? validaNumeracaoDispositivoAlteracao(dispositivo) : validaNumeracaoDispositivo(dispositivo);
};
