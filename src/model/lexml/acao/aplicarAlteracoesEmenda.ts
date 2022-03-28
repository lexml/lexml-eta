import { AlteracoesEmenda } from '../../emenda/alteracoesEmenda';

export const APLICAR_ALTERACOES_EMENDA = 'APLICAR_ALTERACOES_EMENDA';

export class AplicarAlteracoesEmenda {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar dispositivo';
  }

  execute(alteracoesEmenda: AlteracoesEmenda): any {
    return {
      type: APLICAR_ALTERACOES_EMENDA,
      alteracoesEmenda,
    };
  }
}

export const aplicarAlteracoesEmendaAction = new AplicarAlteracoesEmenda();
