import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ADICIONAR_ELEMENTOS_FROM_CLIPBOARD = 'ADICIONAR_ELEMENTOS_FROM_CLIPBOARD';

export class AdicionarElementosFromClipboardAction implements ElementoAction {
  descricao: string;
  constructor() {
    this.descricao = `Adicionar Elemento from Clipboard`;
  }
  execute(atual: Referencia, conteudo?: string, _?: Referencia, isDispositivoAlteracao = false, isColarSubstituindo = true, posicao = 'depois'): any {
    return {
      type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
      atual,
      novo: {
        isDispositivoAlteracao,
        conteudo: {
          texto: conteudo,
        },
      },
      isColarSubstituindo,
      posicao,
    };
  }
}

export const adicionarElementoFromClipboardAction = new AdicionarElementosFromClipboardAction();
