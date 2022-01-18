import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ATUALIZAR_TEXTO_ELEMENTO = 'ATUALIZAR_TEXTO_ELEMENTO';

export class AtualizarTextoElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar dispositivo';
  }

  execute(atual: Referencia): any {
    this.tipo = atual.tipo;
    return {
      type: ATUALIZAR_TEXTO_ELEMENTO,
      atual,
    };
  }
}

export const atualizarTextoElementoAction = new AtualizarTextoElemento();
