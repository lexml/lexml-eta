import { Revisao } from '../../revisao/revisao';

export const APLICAR_REVISOES = 'APLICAR_REVISOES';

export class AplicarRevisoes {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar';
  }

  execute(revisoes: Revisao[] = []): any {
    return {
      type: APLICAR_REVISOES,
      revisoes,
    };
  }
}

export const aplicarRevisoesAction = new AplicarRevisoes();
