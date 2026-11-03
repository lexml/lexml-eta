export class Usuario {
  nome = 'Anônimo';
  id: any;
  sigla?: string;

  constructor(nome?: string, id?: any, sigla?: string) {
    this.nome = nome || 'Anônimo';
    this.id = id;
    this.sigla = sigla;
  }
}

// `idUsuario` gravado em `lexedit:Usuarios`; sem identificador do host, vale o nome (especificação 12).
export const getIdUsuario = (usuario: Usuario): string => String(usuario.id ?? usuario.nome);
