import { addSpaceRegex } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
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
      const num = /[CDILMVX]+(-[a-zA-Z0-9]+)*/.exec(numero);
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      // Trata incisos com numeração no formato "1º)", "2º)", "3º)", etc.
      // Exemplo: Ver alteração no Art. 129 da Lei 6015/1973, proposta pelo Art. 11 da Medida Provisória 1085/2021.
      const regexNumeracaoNaoPadrao = /^(\d+)(º\))$/;
      if (rotulo?.match(regexNumeracaoNaoPadrao)) {
        this.numero = rotulo.match(regexNumeracaoNaoPadrao)![1];
        this.bloqueado = true; // Bloqueia e edição de emendas
        return;
      }

      const temp = trataNumeroAndComplemento(
        this.normalizaNumeracao(rotulo!),
        isNumeracaoZero(rotulo) ? null : converteNumeroRomanoParaArabico,
        converteLetrasComplementoParaNumero
      );
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.inciso.name
          : trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined) +
            this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + '';
      }
      return trataNumeroAndComplemento(this.numero, converteNumeroArabicoParaRomano, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined);
    }

    getNumeracaoComRotuloParaComandoEmenda(dispositivo: Dispositivo): string {
      if (this.numero === undefined) {
        return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda(dispositivo);
    }
  };
}
