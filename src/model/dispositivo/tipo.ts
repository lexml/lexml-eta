import { TipoDispositivo } from '../lexml/tipo/tipoDispositivo';
import { Dispositivo } from './dispositivo';

export interface Tipo {
  tipo: string;
  name?: string;
  tagId?: string;
  descricao?: string;
  descricaoPlural?: string;

  tiposPermitidosPai?: string[];
  tiposPermitidosFilhos?: string[];

  tipoProvavelFilho?: string;

  INDICADOR_SEQUENCIA?: string[];
  INDICADOR_FIM_SEQUENCIA?: string[];
  INDICADOR_DESDOBRAMENTO?: string[];
}

export const isArticulacao = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.articulacao.tipo;
};

export const isDispositivoGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.generico.tipo;
};

export const isArtigo = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.artigo.tipo;
};

export const isCaput = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.caput.tipo;
};

export const isParagrafo = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.paragrafo.tipo;
};

export const isInciso = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.inciso.tipo;
};

export const isIncisoCaput = (dispositivo: Dispositivo): boolean => {
  return isInciso(dispositivo) && isCaput(dispositivo.pai!);
};

export const isIncisoParagrafo = (dispositivo: Dispositivo): boolean => {
  return isInciso(dispositivo) && isParagrafo(dispositivo.pai!);
};

export const isAlinea = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.alinea.tipo;
};

export const isItem = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.item.tipo;
};

export const isOmissis = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.omissis.tipo;
};

export const isAgrupador = (dispositivo: Dispositivo): boolean => {
  return [
    TipoDispositivo.articulacao.tipo,
    TipoDispositivo.agrupadorGenerico.tipo,
    TipoDispositivo.capitulo.tipo,
    TipoDispositivo.livro.tipo,
    TipoDispositivo.parte.tipo,
    TipoDispositivo.secao.tipo,
    TipoDispositivo.subsecao.tipo,
    TipoDispositivo.titulo.tipo,
  ].includes(dispositivo.tipo);
};

export const isAgrupadorNaoArticulacao = (dispositivo: Dispositivo): boolean => {
  return isAgrupador(dispositivo) && !isArticulacao(dispositivo);
};

export const isAgrupadorGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.tipo === TipoDispositivo.agrupadorGenerico.tipo;
};

export const isDispositivoDeArtigo = (dispositivo: Dispositivo): boolean => {
  return [TipoDispositivo.paragrafo.tipo, TipoDispositivo.inciso.tipo, TipoDispositivo.alinea.tipo, TipoDispositivo.item.tipo].includes(dispositivo.tipo);
};
