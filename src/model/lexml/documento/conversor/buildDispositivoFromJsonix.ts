import { TextoArticulado } from '../../../documento';
import { getTextoArticulado } from './buildProjetoNormaFromJsonix';

export const buildDispositivoFromJsonix = (documentoLexml: any): TextoArticulado => {
  if (!documentoLexml?.value?.projetoNorma) {
    throw new Error('Não se trata de um documento lexml válido');
  }

  return {
    ...getTextoArticulado(documentoLexml.value.projetoNorma.norma ? documentoLexml.value.projetoNorma.norma : documentoLexml.value.projetoNorma.projeto),
  };
};
