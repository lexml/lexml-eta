import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const mensagemErro = (state: any, action: any): State => {
  return {
    ...retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.INFO,
      descricao: action.mensagemErro,
    }),
  };
};
