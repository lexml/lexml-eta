import { Numeracao } from '../../dispositivo/numeracao';

export function NumeracaoGenerico<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoDispositivoGenericoLcp95';
    private SUFIXO = ' -';

    numero?: string;
    rotulo?: string;

    createNumeroFromRotulo(): void {
      //
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? 'dg' : this.numero + this.SUFIXO;
    }
  };
}
