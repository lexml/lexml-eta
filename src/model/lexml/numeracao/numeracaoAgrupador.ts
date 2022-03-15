import { isDispositivoRaiz } from './../hierarquia/hierarquiaUtil';
import { removeEspacosDuplicados, StringBuilder } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { converteNumeroArabicoParaRomano, isNumeracaoValida, trataComplemento, isRomano, converteNumeroRomanoParaArabico } from './numeracaoUtil';

export function NumeracaoAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAgrupadorLcp95';
    numero?: string;
    rotulo?: string;
    informouAgrupadorUnico = false;
    private getNomeAgrupadorUnico(dispositivo: Dispositivo): string {
      return `${dispositivo.descricao} únic${dispositivo.artigoDefinido}`.toLocaleUpperCase();
    }

    private normalizaNumeracao(rotulo: string): string {
      const partes = rotulo.trim().split(/\s+/);
      if (partes.length !== 2) {
        return '';
      }
      const numeroRotulo = partes[1];
      const partesRotulo = numeroRotulo.split('-');
      if (!isRomano(partesRotulo[0])) {
        return '';
      }
      partesRotulo[0] = converteNumeroRomanoParaArabico(partesRotulo[0]);
      return partesRotulo.join('-');
    }

    createNumeroFromRotulo(rotulo: string): void {
      this.informouAgrupadorUnico = /.*[uú]nic[ao]/i.test(rotulo);
      if (this.informouAgrupadorUnico) {
        this.numero = '1';
      } else {
        const temp = this.normalizaNumeracao(rotulo!);
        this.numero = this.informouAgrupadorUnico ? '1' : isNumeracaoValida(temp) ? temp : undefined;
      }
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
      const sb = new StringBuilder();

      const numero = this.numero ? trataComplemento(this.numero!, converteNumeroArabicoParaRomano) : '???';
      sb.append(this.descricao + ' ' + numero);

      const pai = this.pai as Dispositivo;
      if (!!pai && !isDispositivoRaiz(pai)) {
        sb.append(pai.pronomePossessivoSingular);
        sb.append(' ');
        sb.append(pai.getNumeracaoParaComandoEmenda());
      }

      return sb.toString();
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      return this.getNumeracaoParaComandoEmenda();
    }
  };
}
