import { Numeracao } from '../../dispositivo/numeracao';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function NumeracaoGenerico<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Numeracao {
    type = 'NumeracaoDispositivoGenericoLcp95';
    private SUFIXO = ' -';

    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? 'desconhecido' : this.numero + this.SUFIXO;
    }
  };
}
