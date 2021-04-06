import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { getArticulacao } from '../hierarquia/hierarquia-util';

export function NumeracaoArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoArtigoLcp95';
    PREFIXO = 'Art. ';
    SUFIXO = 'º';
    private ARTIGO_UNICO = 'Artigo único.';
    numero?: string;
    rotulo?: string;

    createRotulo(dispositivo: Dispositivo): void {
      this.rotulo = this.PREFIXO + this.numero + this.getSufixoNumeracao();

      if (this.numero === undefined) {
        this.rotulo = undefined;
      } else {
        this.rotulo =
          (getArticulacao(dispositivo) as Articulacao).artigos.length === 1
            ? this.ARTIGO_UNICO
            : this.PREFIXO + this.numero === undefined
              ? undefined
              : this.PREFIXO + this.numero + this.getSufixoNumeracao();
      }
    }

    private getSufixoNumeracao(): string {
      return parseInt(this.numero ?? '1', 10) > 9 ? '.' : this.SUFIXO;
    }
  };
}
