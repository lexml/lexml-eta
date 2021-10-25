import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const MOVER_ELEMENTO_ACIMA = 'Mover para cima';

class MoverElementoAcima implements ElementoAction {
  descricao: string;
  tipo?: string;

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
