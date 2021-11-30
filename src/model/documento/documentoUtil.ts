import { SubTipoDocumento } from './tipoDocumento';

export const getSubTipo = (urn: string): SubTipoDocumento | undefined => {
  const tipo = urn.replace('urn:lex:br:federal:', '')?.split(':');

  if (!tipo[0]) {
    return undefined;
  }
  switch (tipo[0]) {
    case 'medida.provisoria':
      return SubTipoDocumento.MEDIDA_PROVISORIA;
    default:
      return undefined;
  }
};
