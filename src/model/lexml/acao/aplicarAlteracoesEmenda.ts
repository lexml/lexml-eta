import { Revisao } from '../../revisao/revisao';
import { DispositivosEmenda } from './../../emenda/emenda';

export const APLICAR_ALTERACOES_EMENDA = 'APLICAR_ALTERACOES_EMENDA';

export class AplicarAlteracoesEmenda {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar';
  }

  execute(alteracoesEmenda: DispositivosEmenda, revisoes: Revisao[] = []): any {
    return {
      type: APLICAR_ALTERACOES_EMENDA,
      alteracoesEmenda,
      revisoes,
    };
  }
}

export const aplicarAlteracoesEmendaAction = new AplicarAlteracoesEmenda();
