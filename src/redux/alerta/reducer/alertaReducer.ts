export const alertaReducer = (state = { alertas: [] }, action: any): any => {
  switch (action.type) {
    case 'ADICIONAR_ALERTA':
      return {
        ...state,
        alertas: [
          ...state.alertas,
          {
            tipo: action.alerta.tipo,
            mensagem: action.alerta.mensagem,
            podeFechar: action.alerta.podeFechar,
            id: action.alerta.id,
          },
        ],
      };
    case 'REMOVER_ALERTA':
      return state.alertas.filter(({ id }) => id !== action.id);
    case 'LIMPAR_ALERTAS':
      return {
        alertas: [],
      };
    default:
      return state;
  }
};
