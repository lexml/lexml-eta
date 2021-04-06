import { Numeracao } from '../../dispositivo/numeracao';

export function NumeracaoAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAlineaLcp95';
    private SUFIXO = ')';
    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.converteNumeroParaRotulo() + this.SUFIXO;
    }

    converteNumeroParaRotulo(): string | undefined {
      if (this.numero !== undefined && this.numero?.trim().length > 0) {
        const n = parseInt(this.numero, 10);
        return String.fromCharCode(96 + n);
      } else {
        return this.numero;
      }
    }
  };
}
