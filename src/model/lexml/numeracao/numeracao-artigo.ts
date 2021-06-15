import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
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
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = '\u201C' + TipoDispositivo.artigo.name;
      } else if (this.numero !== undefined && dispositivo.isDispositivoAlteracao) {
        this.rotulo = '\u201C' + this.PREFIXO + this.numero + this.getSufixoNumeracao();
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
      const partes = this.numero?.split('-');
      return parseInt(partes![0] ?? '1', 10) > 9 ? '.' : this.SUFIXO;
    }
  };
}
