import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ADICIONAR_REMISSAO_INTERNA = 'ADICIONAR_REMISSAO_INTERNA';

class AtualizaRemissaoInterna implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar remissão interna';
  }

  execute(atual: Referencia): any {
    return {
      type: ADICIONAR_REMISSAO_INTERNA,
      atual,
    };
  }
}

export const adicionarRemissaoInternaAction = new AtualizaRemissaoInterna();
