import { endsWithWord } from '../../../util/string-util';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isArtigo } from '../../dispositivo/tipo';

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
