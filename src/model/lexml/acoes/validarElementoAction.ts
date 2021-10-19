import { Referencia } from '../../elemento';
import { ElementoAction } from './acoes';

export const VALIDAR_ELEMENTO = 'VALIDAR_ELEMENTO';

class ValidarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Elemento validado';
  }

  execute(atual: Referencia): any {
    return {
      type: VALIDAR_ELEMENTO,
      atual,
    };
  }
}
export const validarElementoAction = new ValidarElemento();
