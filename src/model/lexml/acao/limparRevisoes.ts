import { ElementoAction } from '.';
import { Revisao } from '../../revisao/revisao';

export const LIMPAR_REVISAO = 'LIMPAR_REVISAO';

export class LimparRevisao implements ElementoAction {
  tipo?: string;

  execute(): any {
    const revisoes: Revisao[] = [];
    return {
      type: LIMPAR_REVISAO,
      revisoes,
    };
  }
}

export const limparRevisaoAction = new LimparRevisao();
