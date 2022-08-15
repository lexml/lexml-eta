import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const RENUMERAR_ELEMENTO = 'RENUMERAR_ELEMENTO';

export class RenumerarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;
  hotkey = '(Ctrl+Alt+R)';

  constructor() {
    this.descricao = 'Numerar e criar rótulo';
  }

  execute(atual: Referencia, numero: string): any {
    this.tipo = atual.tipo;
    return {
      type: RENUMERAR_ELEMENTO,
      atual,
      novo: {
        numero,
      },
    };
  }
}
export const renumerarElementoAction = new RenumerarElemento();
