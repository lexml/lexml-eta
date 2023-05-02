import { Referencia } from '../../elemento';
import { ElementoAction } from './index';

export const ADICIONAR_TEXTO_OMISSIS = 'ADICIONAR_TEXTO_OMISSIS';

export class AdicionarTextoOmissisAction implements ElementoAction {
  descricao: string;

  constructor() {
    this.descricao = 'Omitir texto do dispositivo';
  }

  execute(atual: Referencia): any {
    return {
      type: ADICIONAR_TEXTO_OMISSIS,
      atual,
    };
  }
}

export const adicionarTextoOmissisAction = new AdicionarTextoOmissisAction();
