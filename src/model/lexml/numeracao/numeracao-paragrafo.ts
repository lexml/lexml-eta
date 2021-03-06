import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isParagrafo } from '../../dispositivo/tipo';

export function NumeracaoParagrafo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoParagrafoLcp95';
    private PREFIXO = '§ ';
    private SUFIXO = 'º';
    private PARAGRAFO_UNICO = 'Parágrafo único.';
    numero?: string;
    rotulo?: string;

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined) {
        this.rotulo = undefined;
      } else {
        dispositivo.pai!.filhos.filter(f => isParagrafo(f)).length === 1
          ? (this.rotulo = this.PARAGRAFO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.numero + this.getSufixoNumeracao());
      }
    }

    private getSufixoNumeracao(): string {
      return parseInt(this.numero ?? '1', 10) > 9 ? '' : this.SUFIXO;
    }
  };
}
