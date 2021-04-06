import { Numeracao } from '../../dispositivo/numeracao';

export function NumeracaoItem<TBase extends Constructor>(Base: TBase): any {
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
