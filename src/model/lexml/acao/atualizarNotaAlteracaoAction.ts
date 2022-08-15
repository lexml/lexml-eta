import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ATUALIZAR_NOTA_ALTERACAO = 'ATUALIZAR_NOTA_ALTERACAO';

export class AtualizarNotaAlteracao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar nota de alteração';
  }

  execute(atual: Referencia, notaAlteracao: string): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_NOTA_ALTERACAO,
      atual,
      notaAlteracao,
    };
  }
}

export const atualizarNotaAlteracaoAction = new AtualizarNotaAlteracao();
