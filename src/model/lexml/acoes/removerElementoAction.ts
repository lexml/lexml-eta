import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const REMOVER_ELEMENTO = 'REMOVER_ELEMENTO';

class RemoverElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Remover dispositivo';
  }

  execute(atual: Referencia): any {
    return {
      type: REMOVER_ELEMENTO,
      atual,
    };
  }
}
export const removerElementoAction = new RemoverElemento();
