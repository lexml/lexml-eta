import { ElementoAction } from '.';
import { Elemento } from '../../elemento/elemento';

export const REJEITAR_REVISAO = 'REJEITAR_REVISAO';

export class RejeitarRevisao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Rejeitar revisão';
  }

  execute(elemento: Elemento, revisao: any): any {
    return {
      type: REJEITAR_REVISAO,
      elemento,
      revisao,
    };
  }
}

export const rejeitarRevisaoAction = new RejeitarRevisao();
