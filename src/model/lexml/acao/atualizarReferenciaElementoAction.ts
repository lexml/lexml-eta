import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ATUALIZAR_REFERENCIA_ELEMENTO = 'ATUALIZAR_REFERENCIA_ELEMENTO';

export class AtualizarReferenciaElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar Norma Referenciada';
  }

  execute(atual: Referencia): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_REFERENCIA_ELEMENTO,
      atual,
    };
  }
}

export const atualizarReferenciaElementoAction = new AtualizarReferenciaElemento();
