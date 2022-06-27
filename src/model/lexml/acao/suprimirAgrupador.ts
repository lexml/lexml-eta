import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const SUPRIMIR_AGRUPADOR = 'SUPRIMIR_AGRUPADOR';

class SuprimirAgrupador implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Suprimir apenas o Agrupador';
  }

  execute(atual: Referencia): any {
    return {
      type: SUPRIMIR_AGRUPADOR,
      atual,
    };
  }
}
export const suprimirAgrupadorAction = new SuprimirAgrupador();
