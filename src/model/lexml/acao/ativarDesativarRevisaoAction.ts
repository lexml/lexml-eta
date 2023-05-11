import { ElementoAction } from '.';

export const ATIVAR_DESATIVAR_REVISAO = 'ATIBAR_DESATIVAR_REVISAO';

export class AtivarDesativarRevisao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Ativar/Desativar revisão';
  }

  execute(): any {
    return {
      type: ATIVAR_DESATIVAR_REVISAO,
    };
  }
}

export const ativarDesativarRevisaoAction = new AtivarDesativarRevisao();
