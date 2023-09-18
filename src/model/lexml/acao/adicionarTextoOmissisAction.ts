import { Referencia } from '../../elemento';
import { TEXTO_OMISSIS } from '../conteudo/textoOmissis';
import { atualizarTextoElementoAction } from './atualizarTextoElementoAction';
import { ElementoAction } from './index';

export const ADICIONAR_TEXTO_OMISSIS = 'ADICIONAR_TEXTO_OMISSIS';

export class AdicionarTextoOmissisAction implements ElementoAction {
  descricao: string;

  constructor() {
    this.descricao = 'Linha pontilhada';
  }

  execute(atual: Referencia): any {
    atual.conteudo!.texto = TEXTO_OMISSIS;
    return atualizarTextoElementoAction.execute(atual);
  }
}

export const adicionarTextoOmissisAction = new AdicionarTextoOmissisAction();
