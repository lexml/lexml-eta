import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ADICIONAR_ELEMENTOS_FROM_CLIPBOARD = 'ADICIONAR_ELEMENTOS_FROM_CLIPBOARD';

export class AdicionarElementosFromClipboardAction implements ElementoAction {
  descricao: string;
  isDispositivoAlteracao = false;
  constructor() {
    this.descricao = `Adicionar Elemento from Clipboard`;
  }
  execute(atual: Referencia, conteudo?: string): any {
    return {
      type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
      atual,
      novo: {
        isDispositivoAlteracao: this.isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
    };
  }
}

export const adicionarElementoFromClipboardAction = new AdicionarElementosFromClipboardAction();
