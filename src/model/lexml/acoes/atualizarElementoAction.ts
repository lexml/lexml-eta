import { Referencia } from '../../elemento';
import { ElementoAction } from './acoes';

export const ATUALIZAR_ELEMENTO = 'ATUALIZAR_ELEMENTO';

export class AtualizarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar dispositivo';
  }

  execute(atual: Referencia): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_ELEMENTO,
      atual,
    };
  }
}

export const atualizarElementoAction = new AtualizarElemento();
