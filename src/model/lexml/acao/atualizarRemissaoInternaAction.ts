import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const ATUALIZAR_REMISSAO_INTERNA = 'ATUALIZAR_REMISSAO_INTERNA';

class AtualizaRemissaoInterna implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Atualizar remissão interna';
  }

  execute(atual: Referencia): any {
    return {
      type: ATUALIZAR_REMISSAO_INTERNA,
      atual,
    };
  }
}

export const atualizarRemissaoInternaAction = new AtualizaRemissaoInterna();
