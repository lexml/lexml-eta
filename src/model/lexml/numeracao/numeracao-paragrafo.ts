import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isParagrafo, TipoDispositivo } from '../../dispositivo/tipo';
import { isNumeracaoValida } from './numeracao-util';

export function NumeracaoParagrafo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoParagrafoLcp95';
    private PREFIXO = '§ ';
    private SUFIXO = 'º';
    private PARAGRAFO_UNICO = 'Parágrafo único.';
    numero?: string;
    rotulo?: string;
    informouParagrafoUnico = false;

    private normalizaNumeracao(numero: string): string {
      return numero
        .trim()
        .replace(/\./g, '')
        .replace(/§/i, '')
        .replace(/par[aá]grafo [uú]nico/i, '1')
        .replace(/[º]/i, '')
        .trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouParagrafoUnico = /.[uú]nico/i.test(rotulo);
      this.numero = this.informouParagrafoUnico ? '1' : isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = TipoDispositivo.paragrafo.name;
      } else if (!isNumeracaoValida(this.numero)) {
        this.rotulo = this.getNumeroAndSufixoNumeracao();
      } else if (dispositivo.isDispositivoAlteracao) {
        this.rotulo = this.informouParagrafoUnico ? this.PARAGRAFO_UNICO : this.PREFIXO + this.getNumeroAndSufixoNumeracao();
      } else {
        dispositivo.pai?.filhos.filter(f => isParagrafo(f)).length === 1
          ? (this.rotulo = this.PARAGRAFO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao());
      }
    }

    private getNumeroAndSufixoNumeracao(): string {
      const partes = this.numero?.split('-');
      const [num, ...remaining] = partes!;

      return (parseInt(num ?? '1', 10) < 10 ? num + this.SUFIXO : num) + (remaining.length > 0 ? '-' + remaining?.join('-') : '') + (parseInt(num ?? '1', 10) > 9 ? '.' : '');
    }
  };
}
