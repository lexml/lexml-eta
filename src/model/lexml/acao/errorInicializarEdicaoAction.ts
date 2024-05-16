export const ERROR_INICIALIZAR_EDICAO = 'ERROR_INICIALIZAR_EDICAO';

export class ErrorInicializarEdicao {
  descricao: string;

  constructor() {
    this.descricao = 'Erro inicializar edição';
  }

  execute(err: any): any {
    return {
      type: ERROR_INICIALIZAR_EDICAO,
      erro: err,
    };
  }
}

export const errorInicializarEdicaoAction = new ErrorInicializarEdicao();
