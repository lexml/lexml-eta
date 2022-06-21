import { addSpaceRegex, endsWithWord, escapeRegex } from '../../../util/string-util';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArtigo } from '../../dispositivo/tipo';
import { TEXTO_OMISSIS } from './textoOmissis';

export const hasIndicativoDesdobramento = (dispositivo: Dispositivo): boolean => {
  const d = isArtigo(dispositivo) ? (dispositivo as Artigo).caput! : dispositivo;

  return endsWithWord(d.texto, d.INDICADOR_DESDOBRAMENTO ?? []);
};

export const hasIndicativoFinalSequencia = (dispositivo: Dispositivo): boolean => {
  const d = isArtigo(dispositivo) ? (dispositivo as Artigo).caput! : dispositivo;

  return endsWithWord(d.texto, d.INDICADOR_FIM_SEQUENCIA ?? []);
};

export const hasIndicativoContinuacaoSequencia = (dispositivo: Dispositivo): boolean => {
  const d = isArtigo(dispositivo) ? (dispositivo as Artigo).caput! : dispositivo;

  return endsWithWord(d.texto, d.INDICADOR_SEQUENCIA ?? []);
};

export const TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO = TEXTO_OMISSIS; // + '.” (NR)';

export const hasIndicativoInicioAlteracao = (texto: string): boolean => {
  return (
    new RegExp(addSpaceRegex(escapeRegex('o seguinte acréscimo:')) + '\\s*$').test(texto) ||
    new RegExp(addSpaceRegex(escapeRegex('os seguintes acréscimos:')) + '\\s*$').test(texto) ||
    new RegExp(addSpaceRegex(escapeRegex('passa a vigorar com a seguinte alteração:')) + '\\s*$').test(texto) ||
    new RegExp(addSpaceRegex(escapeRegex('passa a vigorar com as seguintes alterações:')) + '\\s*$').test(texto)
  );
};

export const normalizaSeForOmissis = (texto: string): string => {
  if (/^[.]*(?:\s*)["”“]?(\s*)?\(NR\)\s*$/.test(texto)) {
    return TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO;
  }

  if (/["”]?(\s*)?\(NR\)?\s*$/.test(texto)) {
    return texto.replace(/["“](?!.*["”])/, '”');
  }

  if (texto === TEXTO_OMISSIS || texto === TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO || !new RegExp('^[.]+$').test(texto)) {
    return texto;
  }

  return TEXTO_OMISSIS;
};

export const hasIndicativoFimAlteracao = (texto: string): boolean => {
  return /\.["”](?:\s*\(NR\))\s*$/.test(texto);
};
