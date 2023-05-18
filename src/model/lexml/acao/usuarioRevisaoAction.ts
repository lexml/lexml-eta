import { ElementoAction } from '.';

export const ADICIONA_ATUALIZA_USUARIO_REVISAO = 'ADICIONA_ATUALIZA_USUARIO_REVISAO';

export class AdicionaAtualizaUsuarioRevisao implements ElementoAction {
  descricao: string;

  constructor() {
    this.descricao = 'Adiciona ou atualiza o usuário da revisão.';
  }

  execute(usuario: any): any {
    return {
      type: ADICIONA_ATUALIZA_USUARIO_REVISAO,
      usuario: usuario,
    };
  }
}

export const adicionaAtualizaUsuarioRevisaoAction = new AdicionaAtualizaUsuarioRevisao();
