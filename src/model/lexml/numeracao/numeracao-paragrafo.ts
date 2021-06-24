import { addSpaceRegex } from '../../../util/string-util';
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

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero)
        .trim()
        .replace(/\./g, '')
        .replace(/§/i, '')
        .replace(/par[aá]grafo [uú]nico/i, '1')
        .replace(/[º]/i, '')
        .trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = TipoDispositivo.paragrafo.name;
      } else if (!isNumeracaoValida(this.numero)) {
        this.rotulo = this.numero + this.SUFIXO;
      } else {
        dispositivo.pai!.filhos.filter(f => isParagrafo(f)).length === 1
          ? (this.rotulo = this.PARAGRAFO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.numero + this.getSufixoNumeracao());
      }
    }

    private getSufixoNumeracao(): string {
      const partes = this.numero?.split('-');
      return parseInt(partes![0] ?? '1', 10) > 9 ? '' : this.SUFIXO;
    }
  };
}
