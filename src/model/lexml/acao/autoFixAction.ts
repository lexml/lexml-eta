import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const AUTO_FIX = 'AUTO_FIX';

export class AutoFixAction implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Corrigir automaticamente';
  }

  execute(atual: Referencia, mensagem: string): any {
    return {
      type: AUTO_FIX,
      atual,
      mensagem,
    };
  }
}
export const autofixAction = new AutoFixAction();
