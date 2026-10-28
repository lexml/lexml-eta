import { getVocabularioDaCasa } from '.';
import { TipoDocumento } from './tiposVocabulario';

export const proposicoes = (): TipoDocumento[] => getVocabularioDaCasa().tiposDocumento.filter(t => t.sigla);

export const getTiposDocumentoAtivos = (): TipoDocumento[] => getVocabularioDaCasa().tiposDocumentoAtivos;

export const getTiposDocumentoInativos = (): TipoDocumento[] => proposicoes().filter(t => !t.ativo);

export const getTipoPorSigla = (sigla: string): TipoDocumento | undefined => {
  const maiuscula = (sigla ?? '').toUpperCase();
  return getVocabularioDaCasa().tiposDocumentoAtivos.find(t => t.sigla === maiuscula);
};
