import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State } from '../../state';
import { retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const erroInicializaEdicao = (state: any): State => {
  return {
    ...retornaEstadoAtualComMensagem(state, {
      tipo: TipoMensagem.INFO,
      descricao: 'Ocorreu algum erro ao abrir a emenda',
    }),
  };
};
