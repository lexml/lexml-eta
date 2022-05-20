import { Alerta } from '../../../model/alerta/alerta';

export function adicionaAlerta(alerta: Alerta): any {
  return {
    type: 'ADICIONAR_ALERTA',
    alerta: {
      id: alerta.id,
      tipo: alerta.tipo,
      mensagem: alerta.mensagem,
      podeFechar: alerta.podeFechar,
    },
  };
}
