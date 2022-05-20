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

// export function removerAlerta(stringID: string): any {
//   return {
//     type: 'REMOVER_ALERTA',
//     id: stringID,
//   };
// }

export function limparAlertas(): any {
  return {
    type: 'LIMPAR_ALERTAS',
  };
}
