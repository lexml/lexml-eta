import { Alerta } from '../alerta';

export const ADICIONAR_ALERTA = 'ADICIONAR_ALERTA';

export function adicionarAlerta(alerta: Alerta): any {
  return {
    type: ADICIONAR_ALERTA,
    alerta: {
      id: alerta.id,
      tipo: alerta.tipo,
      mensagem: alerta.mensagem,
      podeFechar: alerta.podeFechar,
      exibirComandoEmenda: alerta.exibirComandoEmenda,
    },
  };
}
