import { Numeracao } from '../../dispositivo/numeracao';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function NumeracaoIndisponivel<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIndisponivel';

    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = undefined;
    }
  };
}
