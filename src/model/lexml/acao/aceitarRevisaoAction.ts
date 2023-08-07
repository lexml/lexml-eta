import { ElementoAction } from '.';
import { Elemento } from '../../elemento/elemento';

export const ACEITAR_REVISAO = 'ACEITAR_REVISAO';

export class AceitarRevisao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Aceitar revisão';
  }

  execute(elemento: Elemento, revisao: any): any {
    return {
      type: ACEITAR_REVISAO,
      elemento,
      revisao,
    };
  }
}

export const aceitarRevisaoAction = new AceitarRevisao();
