import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';

export function NumeracaoAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAlineaLcp95';
    private SUFIXO = ')';
    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.alinea.name : this.converteNumeroParaRotulo() + this.SUFIXO;
    }

    converteNumeroParaRotulo(): string | undefined {
      if (this.numero!.trim().length > 0) {
        const partes = this.numero?.split('-');
        const n = parseInt(partes![0], 10);
        return String.fromCharCode(96 + n) + (partes!.length > 1 ? '-' + partes![1] : '');
      } else {
        return this.numero;
      }
    }
  };
}
