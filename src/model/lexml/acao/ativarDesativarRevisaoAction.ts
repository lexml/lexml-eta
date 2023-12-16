export const ATIVAR_DESATIVAR_REVISAO = 'ATIVAR_DESATIVAR_REVISAO';

export class AtivarDesativarRevisao {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Ativar/Desativar revisão';
  }

  execute(quantidade = 0): any {
    return {
      type: ATIVAR_DESATIVAR_REVISAO,
      quantidade: quantidade,
    };
  }
}

export const ativarDesativarRevisaoAction = new AtivarDesativarRevisao();
