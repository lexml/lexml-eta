export const REMOVER_ALERTA = 'REMOVER_ALERTA';

export function removerAlerta(id: string): any {
  return {
    type: 'REMOVER_ALERTA',
    id,
  };
}
