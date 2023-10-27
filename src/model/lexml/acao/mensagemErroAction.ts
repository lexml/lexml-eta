import { ElementoAction } from '.';

export const MENSAGEM_ERRO = 'MENSAGEM_ERRO';

export class MensagemErro implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Mensagem erro';
  }

  execute(elemento: any, mensagemErro: string): any {
    return {
      type: MENSAGEM_ERRO,
      mensagemErro,
    };
  }
}

export const mensagemErroAction = new MensagemErro();
