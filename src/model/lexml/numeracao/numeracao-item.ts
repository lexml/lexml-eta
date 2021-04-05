import { Numeracao } from '../../dispositivo/numeracao';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function NumeracaoItem<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Numeracao {
    type = 'NumeracaoItemLcp95';
    private SUFIXO = '.';
    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? undefined : this.numero + this.SUFIXO;
    }
  };
}
