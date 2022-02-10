import { DOCUMENTO_EM_EDICAO } from '../../model/lexml/acao/getDocumentoEmEdicaoAction';
import { State } from '../state';

const recuperaDocumentoEmEdicao = (state: any): State => {
  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [],
    },
  };
};

export const documentoReducer = (state = {}, action: any): any => {
  switch (action.type) {
    case DOCUMENTO_EM_EDICAO:
      recuperaDocumentoEmEdicao(state);
      break;
    default:
      return state;
  }
};
