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
