import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { converteLetraParaNumeroArabico, converteNumeroArabicoParaLetra, trataComplemento, isNumeracaoZero } from './numeracaoUtil';

export function NumeracaoAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAlineaLcp95';
    private SUFIXO = ')';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      const num = /[a-z]+(-[a-zA-Z]+)*/.exec(numero.trim());
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/\)$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      this.numero = trataComplemento(this.normalizaNumeracao(rotulo!), isNumeracaoZero(rotulo) ? null : converteLetraParaNumeroArabico);
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.alinea.name : trataComplemento(this.numero, converteNumeroArabicoParaLetra) + this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerada]'; // TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + '';
      }
      return '“' + trataComplemento(this.numero, converteNumeroArabicoParaLetra) + '”';
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + ' [ainda não numerada]';
      }
      return TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
