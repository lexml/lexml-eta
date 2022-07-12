import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const REMOVER_ELEMENTO = 'REMOVER_ELEMENTO';

export class RemoverElemento implements ElementoAction {
  descricao: string;
  tipo?: string;
  hotkey = '(Ctrl+Del)';

  constructor() {
    this.descricao = 'Remover';
  }

  execute(atual: Referencia): any {
    return {
      type: REMOVER_ELEMENTO,
      atual,
    };
  }
}
export const removerElementoAction = new RemoverElemento();
