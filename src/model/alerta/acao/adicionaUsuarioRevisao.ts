import { Usuario } from '../../revisao/usuario';

export const ADICIONA_ATUALIZA_USUARIO_REVISAO = 'ADICIONA_ATUALIZA_USUARIO_REVISAO';

export function adicionaUsuarioRevisao(usuario: Usuario): any {
  return {
    type: ADICIONA_ATUALIZA_USUARIO_REVISAO,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
    },
  };
}
