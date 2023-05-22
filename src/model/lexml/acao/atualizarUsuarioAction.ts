import { ElementoAction } from '.';

export const ATUALIZAR_USUARIO = 'ATUALIZAR_USUARIO';

export class AtualizarUsuario implements ElementoAction {
  descricao: string;

  constructor() {
    this.descricao = 'Atualizar o usuário da revisão.';
  }

  execute(usuario: any): any {
    return {
      type: ATUALIZAR_USUARIO,
      usuario: usuario,
    };
  }
}

export const atualizarUsuarioAction = new AtualizarUsuario();
