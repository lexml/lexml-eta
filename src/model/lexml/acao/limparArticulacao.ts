import { ElementoAction } from '.';
import { Revisao } from '../../revisao/revisao';

export const LIMPAR_ARTICULACAO = 'LIMPAR_ARTICULACAO';

export class LimparArticulacao implements ElementoAction {
  tipo?: string;

  execute(): any {
    const revisoes: Revisao[] = [];
    return {
      type: LIMPAR_ARTICULACAO,
      revisoes,
    };
  }
}

export const limparArticulacaoAction = new LimparArticulacao();
