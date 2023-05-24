import { Referencia } from '../../elemento';
import { atualizarTextoElementoAction } from './atualizarTextoElementoAction';
import { ElementoAction } from './index';

export const REMOVER_TEXTO_OMISSIS = 'REMOVER_TEXTO_OMISSIS';

export class RemoverTextoOmissisAction implements ElementoAction {
  descricao: string;

  constructor() {
    this.descricao = 'Remover linha pontilhada';
  }

  execute(atual: Referencia): any {
    atual.conteudo!.texto = '';
    return atualizarTextoElementoAction.execute(atual);
  }
}

export const removerTextoOmissisAction = new RemoverTextoOmissisAction();
