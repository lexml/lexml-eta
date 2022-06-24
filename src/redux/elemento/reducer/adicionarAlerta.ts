import { Alerta } from '../../../model/alerta/alerta';
import { State, StateType } from '../../state';

export const adicionarAlerta = (state: any, action: any): State => {
  let alertas: Alerta[] = state.ui?.alertas || [];
  if (state.ui?.alertas?.filter(({ id }) => id === action.alerta.id).length > 0) {
    alertas = [...alertas];
  } else {
    alertas = [...alertas, action.alerta];
  }

  return {
    articulacao: state.articulacao,
    modo: state.modo,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events: [{ stateType: StateType.AtualizacaoAlertas }],
      message: state.ui?.mensagem,
      alertas: alertas,
    },
  };
};
