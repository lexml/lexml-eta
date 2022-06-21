import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import {
  converteLetrasComplementoParaNumero,
  converteNumeroArabicoParaRomano,
  converteNumeroRomanoParaArabico,
  converteNumerosComplementoParaLetra,
  isNumeracaoValida,
  isNumeracaoZero,
  trataNumeroAndComplemento,
} from './numeracaoUtil';

export function NumeracaoInciso<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIncisoLcp95';
    private SUFIXO = ' –';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      const num = /[CDILMVX]+(-[a-zA-Z]+)*/.exec(numero);
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataNumeroAndComplemento(
        this.normalizaNumeracao(rotulo!),
        isNumeracaoZero(rotulo) ? null : converteNumeroRomanoParaArabico,
        converteLetrasComplementoParaNumero
      );
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.inciso.name
          : trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, converteNumerosComplementoParaLetra) + this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + '';
      }
      return trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, converteNumerosComplementoParaLetra);
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
