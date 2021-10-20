import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const SUPRIMIR_ELEMENTO = 'SUPRIMIR_ELEMENTO';

class SuprimirElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Suprimir dispositivo';
  }

  execute(atual: Referencia): any {
    return {
      type: SUPRIMIR_ELEMENTO,
      atual,
    };
  }
}
export const suprimirElementoAction = new SuprimirElemento();
