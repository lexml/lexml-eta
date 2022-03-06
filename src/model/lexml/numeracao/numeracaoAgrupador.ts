import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { converteNumeroArabicoParaRomano, isNumeracaoValida, trataComplemento } from './numeracaoUtil';

export function NumeracaoAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAgrupadorLcp95';
    numero?: string;
    rotulo?: string;
    informouAgrupadorUnico = false;
    private getNomeAgrupadorUnico(dispositivo: Dispositivo): string {
      return `${dispositivo.descricao} únic${dispositivo.artigoDefinido}`.toLocaleUpperCase();
    }

    private normalizaNumeracao(numero: string): string {
      return numero
        .replace(/\./g, '')
        .replace(/parte [uú]nica/i, '1')
        .replace(/livro [uú]nico/i, '1')
        .replace(/t[íi]tulo [uú]nico/i, '1')
        .replace(/cap[íi]tulo [uú]nico/i, '1')
        .replace(/se[çc][ãa]o [uú]nica/i, '1')
        .replace(/subse[çc][ãa]o [uú]nica/i, '1')
        .replace(/[º]/i, '')
        .trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.informouAgrupadorUnico = /.*[uú]nic[ao]/i.test(rotulo);
      this.numero = this.informouAgrupadorUnico ? '1' : isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      const prefixo = dispositivo.descricao === undefined ? dispositivo.name ?? '' : dispositivo.descricao.toLocaleUpperCase();

      if (this.numero === undefined) {
        this.rotulo = isDispositivoCabecaAlteracao(dispositivo) ? '\u201C' + dispositivo.tipo : dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = prefixo + ' ' + this.numero;
      } else if (dispositivo.isDispositivoAlteracao && isDispositivoCabecaAlteracao(dispositivo)) {
        this.rotulo =
          '\u201C' + (this.informouAgrupadorUnico ? this.getNomeAgrupadorUnico(dispositivo) : prefixo + ' ' + trataComplemento(this.numero, converteNumeroArabicoParaRomano));
      } else {
        irmaosMesmoTipo(dispositivo).length === 1
          ? (this.rotulo = this.getNomeAgrupadorUnico(dispositivo))
          : (this.rotulo = prefixo + ' ' + trataComplemento(this.numero, converteNumeroArabicoParaRomano));
      }
    }

    getNumeracaoParaComandoEmenda(): string {
      return this.rotulo + '';
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      return this.getNumeracaoParaComandoEmenda();
    }
  };
}
