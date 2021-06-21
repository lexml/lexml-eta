import { Numeracao } from '../../dispositivo/numeracao';

export function NumeracaoIndisponivel<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIndisponivel';

    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = undefined;
    }

    createNumeroFromRotulo(): void {
      //
    }
  };
}
