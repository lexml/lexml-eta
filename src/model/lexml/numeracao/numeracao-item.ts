import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';

export function NumeracaoItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoItemLcp95';
    private SUFIXO = '.';
    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = (this.numero === undefined ? TipoDispositivo.item.name : this.numero) + this.SUFIXO;
    }
  };
}
