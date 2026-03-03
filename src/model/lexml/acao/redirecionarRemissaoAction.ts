import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const REDIRECIONAR_REMISSAO = 'REDIRECIONAR_REMISSAO';

class RedirecionarRemissao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Redirecionar para dispositivo referenciado';
  }

  execute(atual: Referencia): any {
    return {
      type: REDIRECIONAR_REMISSAO,
      uuid: atual.uuid,
    };
  }
}

export const redirecionarRemissaoAction = new RedirecionarRemissao();
