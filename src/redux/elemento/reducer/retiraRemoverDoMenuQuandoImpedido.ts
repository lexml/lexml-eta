import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { removerElementoAction } from '../../../model/lexml/acao/removerElementoAction';
import { State, StateType } from '../../state';
import { isRemocaoImpedidaPorSubordinadoRevisado } from '../util/revisaoUtil';

// As ações do menu vêm das regras do tipo, que não conhecem as revisões: "Remover" só pode sair aqui, onde o estado de revisão existe.
export const retiraRemoverDoMenuQuandoImpedido = (state: State): State => {
  if (!state.emRevisao || !state.revisoes?.length || !state.articulacao) {
    return state;
  }

  state.ui?.events
    .filter(se => se.stateType !== StateType.ElementoRemovido)
    .forEach(se =>
      se.elementos?.filter(Boolean).forEach(e => {
        if (!e.acoesPossiveis?.includes(removerElementoAction)) {
          return;
        }
        const dispositivo = getDispositivoFromElemento(state.articulacao!, e, true);
        if (dispositivo && isRemocaoImpedidaPorSubordinadoRevisado(state, dispositivo)) {
          e.acoesPossiveis = e.acoesPossiveis.filter(acao => acao !== removerElementoAction);
        }
      })
    );

  return state;
};
