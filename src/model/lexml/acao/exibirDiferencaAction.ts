import { ElementoAction } from '.';
import { Elemento } from '../../elemento/elemento';

export const EXIBIR_DIFERENCA = 'EXIBIR_DIFERENCA';

export class ExibirDiferenca implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Exibir diferenças';
  }

  execute(elemento: Elemento): any {
    return {
      type: EXIBIR_DIFERENCA,
      elemento,
    };
  }
}

export const exibirDiferencaAction = new ExibirDiferenca();
