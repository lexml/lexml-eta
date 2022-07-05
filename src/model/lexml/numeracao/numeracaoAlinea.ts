import { addSpaceRegex } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import {
  converteLetraParaNumeroArabico,
  converteLetrasComplementoParaNumero,
  converteNumeroArabicoParaLetra,
  converteNumerosComplementoParaLetra,
  isNumeracaoZero,
  trataNumeroAndComplemento,
} from './numeracaoUtil';

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
      this.numero = trataNumeroAndComplemento(
        this.normalizaNumeracao(rotulo!),
        isNumeracaoZero(rotulo) ? null : converteLetraParaNumeroArabico,
        converteLetrasComplementoParaNumero
      );
    }

    createRotulo(dispositivo: Dispositivo): void {
      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.alinea.name
          : trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaLetra, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined) +
            this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerada]'; // TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + '';
      }
      return '“' + trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaLetra, converteNumerosComplementoParaLetra) + '”';
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + ' [ainda não numerada]';
      }
      return TipoDispositivo.alinea.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
