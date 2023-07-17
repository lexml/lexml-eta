export class Usuario {
  nome = 'Anônimo';
  id: any;

  constructor(nome?: string, id?: any) {
    this.nome = nome || 'Anônimo';
    this.id = id;
  }
}
