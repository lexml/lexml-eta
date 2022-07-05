import { addSpaceRegex } from '../../../util/string-util';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { converteLetrasComplementoParaNumero, converteNumerosComplementoParaLetra, trataNumeroAndComplemento } from './numeracaoUtil';

export function NumeracaoItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoItemLcp95';
    private SUFIXO = '.';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      const num = /\d+(-[a-zA-Z]+)*/.exec(numero.trim());
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/\.$/, '').trim();
    }

    private isNumeracaoValidaParaRotulo(numero: string): boolean {
      return /^\d{1,}([-]?[a-zA-Z]+)?$/.test(numero);
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.numero = this.isNumeracaoValidaParaRotulo(temp) ? trataNumeroAndComplemento(temp, undefined, converteLetrasComplementoParaNumero) : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.item.name
          : trataNumeroAndComplemento(this.numero, undefined, dispositivo.isDispositivoAlteracao ? converteNumerosComplementoParaLetra : undefined) + this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.item.descricao?.toLowerCase() + '';
      }
      return this.rotulo!;
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.item.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return TipoDispositivo.item.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
