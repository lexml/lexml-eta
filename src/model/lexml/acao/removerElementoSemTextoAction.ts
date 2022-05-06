import { Referencia } from '../../elemento';

export const REMOVER_ELEMENTO_SEM_TEXTO = 'REMOVER_ELEMENTO_SEM_TEXTO';

export class RemoverElementoSemTexto {
  descricao: string;

  constructor() {
    this.descricao = 'Remover dispositivo sem texto';
  }

  execute(atual: Referencia, key: string): any {
    return {
      type: REMOVER_ELEMENTO_SEM_TEXTO,
      atual,
      key,
    };
  }
}
export const removerElementoSemTextoAction = new RemoverElementoSemTexto();
