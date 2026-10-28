import { Numeracao } from '../../dispositivo/numeracao';
import { ROTULO_PENA_PADRAO } from './rotuloPena';

// O rótulo da pena é escolhido pelo usuário: preserva o atual em vez de recalculá-lo.
export function NumeracaoPena<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoPena';

    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.rotulo ?? ROTULO_PENA_PADRAO;
    }

    createNumeroFromRotulo(): void {
      //
    }
  };
}
