import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { TEXTO_OMISSIS } from '../../../model/lexml/conteudo/textoOmissis';
import { State } from '../../state';
import { atualizaTextoElemento } from './atualizaTextoElemento';

export const AdicionarTextoOmissis = (state: any, action: any): State => {
  const dispositivo = getDispositivoFromElemento(state.articulacao, action.atual, true);
  dispositivo!.texto = TEXTO_OMISSIS;

  return atualizaTextoElemento(state, action);
};
