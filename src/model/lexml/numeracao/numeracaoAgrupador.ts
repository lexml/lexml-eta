import { addSpaceRegex, StringBuilder } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { isArticulacao } from '../../dispositivo/tipo';
import { irmaosMesmoTipo, isDispositivoCabecaAlteracao } from '../hierarquia/hierarquiaUtil';
import { isDispositivoRaiz } from './../hierarquia/hierarquiaUtil';
import {
  converteLetrasComplementoParaNumero,
  converteNumeroArabicoParaRomano,
  converteNumeroRomanoParaArabico,
  converteNumerosComplementoParaLetra,
  isNumeracaoValida,
  isNumeracaoZero,
  isRomano,
  trataNumeroAndComplemento,
} from './numeracaoUtil';

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
      const num = /[CDILMVX]+(-[a-zA-Z]+)*/.exec(numero);
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      if (!rotulo) {
        return;
      }
      this.informouAgrupadorUnico = /.*[uú]nic[ao]/i.test(rotulo);
      if (this.informouAgrupadorUnico) {
        this.numero = '1';
      } else {
        const temp = trataNumeroAndComplemento(
          this.normalizaNumeracao(rotulo!),
          isNumeracaoZero(rotulo) ? null : converteNumeroRomanoParaArabico,
          converteLetrasComplementoParaNumero
        );
        this.numero = isNumeracaoValida(temp) ? temp : undefined;
      }
    }

    createRotulo(dispositivo: Dispositivo): void {
      const prefixo = dispositivo.descricao === undefined ? dispositivo.name ?? '' : dispositivo.descricao.toLocaleUpperCase();

      if (this.numero === undefined) {
        this.rotulo = dispositivo.tipo;
      } else if (this.numero !== undefined && !isNumeracaoValida(this.numero)) {
        this.rotulo = prefixo + ' ' + this.numero;
      } else if (dispositivo.isDispositivoAlteracao && isDispositivoCabecaAlteracao(dispositivo)) {
        this.rotulo = this.informouAgrupadorUnico
          ? this.getNomeAgrupadorUnico(dispositivo)
          : prefixo + ' ' + trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, converteNumerosComplementoParaLetra);
      } else {
        irmaosMesmoTipo(dispositivo).length === 1
          ? (this.rotulo = this.getNomeAgrupadorUnico(dispositivo))
          : (this.rotulo = prefixo + ' ' + trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, converteNumerosComplementoParaLetra));
      }
    }

    setMaiusculaPrimeiraLetraDaDescricao(s: string): string {
      const partes = s.split('-');
      const [main, ...remaining] = partes!;
      const palavras = main.toLocaleLowerCase().split(' ');

      for (let i = 0; i < palavras.length; i++) {
        palavras[i] = isRomano(palavras[i]) ? palavras[1].toUpperCase() : palavras[i].charAt(0).toUpperCase() + palavras[i].slice(1);
      }

      return palavras.join(' ') + (remaining.length > 0 ? '-' + remaining.join('') : '');
    }

    getNumeracaoParaComandoEmenda(): string {
      const sb = new StringBuilder();

      sb.append(this.setMaiusculaPrimeiraLetraDaDescricao(this.rotulo!));

      const pai = this.pai as Dispositivo;
      if (!!pai && !isDispositivoRaiz(pai) && !isArticulacao(pai)) {
        sb.append(pai.pronomePossessivoSingular);
        sb.append(' ');
        sb.append(pai.getNumeracaoParaComandoEmenda(pai));
      }

      return sb.toString();
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      return this.getNumeracaoParaComandoEmenda();
    }
  };
}
