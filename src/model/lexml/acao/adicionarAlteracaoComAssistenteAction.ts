import { Referencia } from '../../elemento';

export const ASSISTENTE_ALTERACAO = 'ASSISTENTE_ALTERACAO';

export class AdicionarAlteracaoComAssistenteAction {
  descricao: string;

  constructor() {
    this.descricao = 'Inserir Alteração com Assistente';
  }

  execute(atual: Referencia, tipo?: string, numero?: string, ano?: string, dispositivos?: string): any {
    return {
      type: ASSISTENTE_ALTERACAO,
      atual,
      norma: {
        tipo,
        numero,
        ano,
      },
      dispositivos,
    };
  }
}

export const adicionarAlteracaoComAssistenteAction = new AdicionarAlteracaoComAssistenteAction();
