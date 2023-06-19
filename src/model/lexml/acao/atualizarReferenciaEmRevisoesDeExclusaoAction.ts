import { ElementoAction } from '.';
import { Elemento } from '../../elemento';

export const ATUALIZAR_REFERENCIA_EM_REVISOES_EXCLUSAO = 'ATUALIZAR_REFERENCIA_EM_REVISOES_EXCLUSAO';

export class AtualizarReferenciaEmRevisoesDeExclusao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar referência em revisões de exclusão';
  }

  execute(elementos: any): any {
    return {
      type: ATUALIZAR_REFERENCIA_EM_REVISOES_EXCLUSAO,
      elementos: elementos as Elemento[],
    };
  }
}

export const atualizarReferenciaEmRevisoesDeExclusaoAction = new AtualizarReferenciaEmRevisoesDeExclusao();
