import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const MOVER_ELEMENTO_ACIMA = 'Mover para cima';

export class MoverElementoAcima implements ElementoAction {
  descricao: string;
  tipo?: string;
  hotkey = '(Ctrl+⇡)';

  constructor() {
    this.descricao = 'Mover para cima';
  }

  execute(atual: Referencia): any {
    return {
      type: MOVER_ELEMENTO_ACIMA,
      atual,
    };
  }
}
export const moverElementoAcimaAction = new MoverElementoAcima();
