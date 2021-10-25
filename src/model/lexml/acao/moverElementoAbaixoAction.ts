import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const MOVER_ELEMENTO_ABAIXO = 'Mover para baixo';

class MoverElementoAbaixo implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Mover para baixo';
  }

  execute(atual: Referencia): any {
    return {
      type: MOVER_ELEMENTO_ABAIXO,
      atual,
    };
  }
}
export const moverElementoAbaixoAction = new MoverElementoAbaixo();
