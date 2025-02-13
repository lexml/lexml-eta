import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isParagrafo } from '../../dispositivo/tipo';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { isDispositivoNovoNaNormaAlterada } from './../hierarquia/hierarquiaUtil';
import { converteLetrasComplementoParaNumero, converteNumeroArabicoParaLetra, isNumeracaoValida, trataNumeroAndComplemento } from './numeracaoUtil';

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

    private isNumeracaoComComplementoAlfabetico(numero: string): boolean {
      return /^\d{1,}[º]?(([-]?[a-zA-Z]+){0,2})$/.test(numero);
    }

    private isNumeracaoComComplementoNumerico(numero: string): boolean {
      return /^\d{1,}[º]?(([-]?[1-9]+){0,2})$/.test(numero);
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouParagrafoUnico = /.*[uú]nico/i.test(rotulo);
      this.numero = this.informouParagrafoUnico
        ? '1'
        : this.isNumeracaoComComplementoAlfabetico(temp)
        ? trataNumeroAndComplemento(temp, undefined, converteLetrasComplementoParaNumero)
        : this.isNumeracaoComComplementoNumerico(temp)
        ? temp
        : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      if (this.numero === undefined || !dispositivo) {
        this.rotulo = TipoDispositivo.paragrafo.name;
      } else if (!isNumeracaoValida(this.numero)) {
        this.rotulo = this.getNumeroAndSufixoNumeracao(dispositivo);
      } else if (dispositivo.isDispositivoAlteracao) {
        if (isDispositivoNovoNaNormaAlterada(dispositivo)) {
          dispositivo.pai?.filhos.filter(f => isParagrafo(f)).length === 1
            ? (this.rotulo = this.PARAGRAFO_UNICO)
            : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao(dispositivo));
        } else {
          this.rotulo = this.informouParagrafoUnico ? this.PARAGRAFO_UNICO : this.PREFIXO + this.getNumeroAndSufixoNumeracao(dispositivo);
        }
      } else {
        dispositivo.pai?.filhos.filter(f => isParagrafo(f)).length === 1
          ? (this.rotulo = this.PARAGRAFO_UNICO)
          : (this.rotulo = this.PREFIXO + this.numero === undefined ? undefined : this.PREFIXO + this.getNumeroAndSufixoNumeracao(dispositivo));
      }
    }

    private getNumeroAndSufixoNumeracao(dispositivo: Dispositivo, paraComandoEmenda = false): string {
      const partes = this.numero?.split('-');
      const [num, ...remaining] = partes!;
      const ordinal = parseInt(num ?? '1', 10) < 10;
      return (
        (ordinal ? num + this.SUFIXO : num) +
        (remaining.length > 0
          ? '-' +
            remaining
              ?.map(str => (dispositivo.isDispositivoAlteracao ? converteNumeroArabicoParaLetra(str) : str))
              .join('-')
              .toUpperCase()
          : '') +
        (!paraComandoEmenda && (!ordinal || remaining.length) ? '.' : '')
      );
    }

    getNumeracaoParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.paragrafo.descricao?.toLocaleLowerCase() + '';
      }
      return this.isParagrafoUnico() ? 'parágrafo único' : this.getNumeroAndSufixoNumeracao(dispositivo, true);
    }

    getNumeracaoComRotuloParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return TipoDispositivo.paragrafo.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return this.isParagrafoUnico() ? 'parágrafo único' : '§ ' + this.getNumeroAndSufixoNumeracao(dispositivo, true);
    }

    private isParagrafoUnico(): boolean {
      return (this.isDispositivoAlteracao && this.rotulo?.includes('único')) || (!this.isDispositivoAlteracao && this.pai?.filhos.filter(f => isParagrafo(f)).length === 1);
    }
  };
}
