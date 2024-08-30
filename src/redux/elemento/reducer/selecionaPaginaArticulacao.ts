import { State, StateType } from '../../state';
import { getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao } from '../util/paginacaoUtil';

export const selecionaPaginaArticulacao = (state: any, action: any): State => {
  return {
    ...state,
    ui: {
      events: [
        {
          stateType: StateType.PaginaArticulacaoSelecionada,
          elementos: getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao(state),
        },
      ],
      alertas: state.ui?.alertas,
      paginacao: {
        ...state.ui?.paginacao,
        paginaSelecionada: state.ui?.paginacao?.paginasArticulacao![action.numPagina - 1],
      },
    },
  };
};
