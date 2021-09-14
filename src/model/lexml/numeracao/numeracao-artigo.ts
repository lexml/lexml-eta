import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
import { getArticulacao } from '../hierarquia/hierarquia-util';
import { isNumeracaoValida } from './numeracao-util';

export function NumeracaoArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoArtigoLcp95';
    PREFIXO = 'Art. ';
    SUFIXO = 'º';
    private ARTIGO_UNICO = 'Artigo único.';
    numero?: string;
    rotulo?: string;
    informouArtigoUnico = false;

    private normalizaNumeracao(numero: string): string {
      return numero
        .replace(/\./g, '')
        .replace(/artigo [uú]nico/i, '1')
        .replace(/(art[.]{1})/i, '')
        .replace(/[º]/i, '')
        .trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouArtigoUnico = /.[uú]nico/i.test(rotulo);
      this.numero = this.informouArtigoUnico ? '1' : isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = '\u201C' + TipoDispositivo.artigo.name;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = this.numero + this.SUFIXO;
      } else if (dispositivo.isDispositivoAlteracao) {
        this.rotulo = '\u201C' + (this.informouArtigoUnico ? this.ARTIGO_UNICO : this.PREFIXO + this.getNumeroAndSufixoNumeracao());
      } else {
        getArticulacao(dispositivo).artigos.length === 1
          ? (this.rotulo = this.ARTIGO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao());
      }
    }

    private getNumeroAndSufixoNumeracao(): string {
      const partes = this.numero?.split('-');
      const [num, ...remaining] = partes!;

      return (
        (parseInt(num ?? '1', 10) < 10 ? num + this.SUFIXO : num) +
        (remaining.length > 0 ? '-' + remaining?.join('-').toUpperCase() : '') +
        (parseInt(num ?? '1', 10) > 9 ? '.' : '')
      );
    }
  };
}
