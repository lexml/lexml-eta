import { TipoDocumento } from './tipo';
import { VOCABULARIO } from './vocabulario';

export const getTipo = (urn: string): TipoDocumento | undefined => {
  const tipo = urn.replace('urn:lex:br:', '')?.split(':');
  return VOCABULARIO.tiposDocumento.filter(t => t.urn === tipo[1])[0];
};
