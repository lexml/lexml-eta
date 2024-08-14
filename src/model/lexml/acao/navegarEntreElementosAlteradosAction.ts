import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const NAVEGAR_ENTRE_ELEMENTOS_ALTERADOS = 'NAVEGAR_ENTRE_ELEMENTOS_ALTERADOS';

export type TDirecao = 'proximo' | 'anterior';

class NavegarEntreElementosAlterados implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Navegar entre elementos alterados';
  }

  execute(atual: Referencia, direcao: TDirecao): any {
    return {
      type: NAVEGAR_ENTRE_ELEMENTOS_ALTERADOS,
      atual,
      direcao,
    };
  }
}

export const navegarEntreElementosAlteradosAction = new NavegarEntreElementosAlterados();
