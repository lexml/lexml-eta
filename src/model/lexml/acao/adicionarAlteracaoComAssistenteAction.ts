import { Referencia } from '../../elemento';

export const ASSISTENTE_ALTERACAO = 'ASSISTENTE_ALTERACAO';

export class AdicionarAlteracaoComAssistenteAction {
  descricao: string;

  constructor() {
    this.descricao = 'Alteração com Assistente';
  }

  execute(atual: Referencia, norma?: string, dispositivos?: string): any {
    return {
      type: ASSISTENTE_ALTERACAO,
      atual,
      norma,
      dispositivos,
    };
  }
}

export const adicionarAlteracaoComAssistenteAction = new AdicionarAlteracaoComAssistenteAction();
