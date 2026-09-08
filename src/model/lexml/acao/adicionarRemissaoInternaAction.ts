import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ADICIONAR_REMISSAO_INTERNA = 'ADICIONAR_REMISSAO_INTERNA';

class AdicionarRemissaoInterna implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Adicionar remissão interna';
  }

  execute(atual: Referencia): any {
    return { type: ADICIONAR_REMISSAO_INTERNA, atual, precisaReemitirMensagemInvalida: false };
  }

  // Usar quando precedido por atualizarTextoElementoAction no mesmo fluxo (digitação,
  // desmembramento, criação/edição de remissão manual). Permite re-emissão da mensagem
  // de remissão inválida, que foi limpa pelo ElementoValidado sem mensagens do atualizarTexto.
  executeComReemissao(atual: Referencia): any {
    return { type: ADICIONAR_REMISSAO_INTERNA, atual, precisaReemitirMensagemInvalida: true };
  }
}

export const adicionarRemissaoInternaAction = new AdicionarRemissaoInterna();
