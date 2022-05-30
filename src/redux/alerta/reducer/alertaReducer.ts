export const alertaReducer = (state = { alertas: [] }, action: any): any => {
  switch (action.type) {
    case 'ADICIONAR_ALERTA':
      if (state.alertas.filter(({ id }) => id === action.alerta.id).length > 0) {
        return {
          alertas: [...state.alertas],
        };
      } else {
        return {
          alertas: [...state.alertas, action.alerta],
        };
      }
    case 'REMOVER_ALERTA':
      return {
        alertas: state.alertas?.filter(({ id }) => id !== action.id),
      };
    case 'LIMPAR_ALERTAS':
      return {
        alertas: [],
      };
    default:
      return state;
  }
};
