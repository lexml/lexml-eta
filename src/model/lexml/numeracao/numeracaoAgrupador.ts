import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { converteNumeroArabicoParaRomano, converteNumeroRomanoParaArabico, isNumeracaoValida, trataComplemento } from './numeracaoUtil';

export function NumeracaoAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAgrupadorLcp95';
    numero?: string;
    rotulo?: string;

    private getNomeAgrupadorUnico(dispositivo: Dispositivo): string {
      return `${dispositivo.tipo} únic${dispositivo.artigoDefinido}`.toLocaleUpperCase();
    }
    private normalizaNumeracao(numero: string): string {
      return numero.trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataComplemento(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      const prefixo = dispositivo.descricao === undefined ? dispositivo.name ?? '' : dispositivo.descricao.toLocaleUpperCase();

      if (this.numero === undefined) {
        this.rotulo = '\u201C' + dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = prefixo + this.numero;
      } else if (dispositivo.isDispositivoAlteracao && isDispositivoCabecaAlteracao(dispositivo)) {
        this.rotulo = '\u201C' + (this.informouAgrupadorUnico ? this.getNomeAgrupadorUnico(dispositivo) : prefixo + trataComplemento(this.numero, converteNumeroArabicoParaRomano));
      } else {
        irmaosMesmoTipo(dispositivo).length === 1
          ? (this.rotulo = this.getNomeAgrupadorUnico(dispositivo))
          : (this.rotulo = prefixo + ' ' + trataComplemento(this.numero, converteNumeroArabicoParaRomano));
      }
    }
  };
}
