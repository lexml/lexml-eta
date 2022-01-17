import { ElementoAction } from '.';
import { Referencia } from '../../elemento';
export const INFORMAR_NORMA = 'INFORMAR_NORMA';

class InformarNorma implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Informar norma alterada';
  }

  execute(atual: Referencia): any {
    return {
      type: INFORMAR_NORMA,
      atual,
    };
  }
}
export const informarNormaAction = new InformarNorma();
