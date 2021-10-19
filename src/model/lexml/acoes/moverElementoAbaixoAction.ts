import { Referencia } from '../../elemento';
import { ElementoAction } from './acoes';

export const MOVER_ELEMENTO_ABAIXO = 'MOVER_ELEMENTO_ABAIXO';

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
