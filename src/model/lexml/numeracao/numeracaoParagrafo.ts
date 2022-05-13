import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isParagrafo } from '../../dispositivo/tipo';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { isNumeracaoValida } from './numeracaoUtil';

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
      this.informouParagrafoUnico = /.*[uú]nico/i.test(rotulo);
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

    private getNumeroAndSufixoNumeracao(paraComandoEmenda = false): string {
      if (!this.numero) {
        return '';
      }

      const num = this.numero.search(/[a-zA-Z-]/) === -1 ? parseInt(this.numero) : parseInt(this.numero.substring(0, this.numero.search(/[a-zA-Z-]/)));
      const resto = this.numero.search(/[a-zA-Z-]/) === -1 ? '' : this.numero.substring(this.numero.search(/[a-zA-Z-]/));
      const ordinal = num < 10;

      return (ordinal ? num + this.SUFIXO : num) + (resto?.length > 0 ? resto : '') + (!paraComandoEmenda && (!ordinal || resto?.length) ? '.' : '');
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.paragrafo.descricao?.toLocaleLowerCase() + '';
      }
      return this.isParagrafoUnico() ? 'parágrafo único' : this.getNumeroAndSufixoNumeracao(true);
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.paragrafo.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return this.isParagrafoUnico() ? 'parágrafo único' : '§ ' + this.getNumeroAndSufixoNumeracao(true);
    }

    private isParagrafoUnico(): boolean {
      return (this.isDispositivoAlteracao && this.informouParagrafoUnico) || (!this.isDispositivoAlteracao && this.pai?.filhos.filter(f => isParagrafo(f)).length === 1);
    }
  };
}
