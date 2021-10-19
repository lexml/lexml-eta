import { ElementoAction } from './acoes';

export const VALIDAR_ARTICULACAO = 'VALIDAR_ARTICULACAO';

class ValidarArticulacao implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Articulação validada';
  }

  execute(): any {
    return {
      type: VALIDAR_ARTICULACAO,
    };
  }
}
export const validarArticulacaAction = new ValidarArticulacao();
