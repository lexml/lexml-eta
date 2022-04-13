import { DispositivosEmenda } from './../../emenda/emenda';

export const APLICAR_ALTERACOES_EMENDA = 'APLICAR_ALTERACOES_EMENDA';

export class AplicarAlteracoesEmenda {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar dispositivo';
  }

  execute(alteracoesEmenda: DispositivosEmenda): any {
    return {
      type: APLICAR_ALTERACOES_EMENDA,
      alteracoesEmenda,
    };
  }
}

export const aplicarAlteracoesEmendaAction = new AplicarAlteracoesEmenda();
