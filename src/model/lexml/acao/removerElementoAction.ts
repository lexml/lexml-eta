import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const REMOVER_ELEMENTO = 'REMOVER_ELEMENTO';

export class RemoverElemento implements ElementoAction {
  descricao: string;
  tipo?: string;
  hotkey = '(Ctrl+D)';

  constructor() {
    this.descricao = 'Remover';
  }

  execute(atual: Referencia, elementoLinhaAnterior: any): any {
    return {
      type: REMOVER_ELEMENTO,
      atual,
      elementoLinhaAnterior,
    };
  }
}
export const removerElementoAction = new RemoverElemento();
