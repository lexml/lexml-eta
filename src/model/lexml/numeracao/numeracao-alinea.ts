import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
import { converteLetraParaNumeroArabico, converteNumeroArabicoParaLetra, trataComplemento } from './numeracao-util';

export function NumeracaoAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAlineaLcp95';
    private SUFIXO = ')';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero).replace(/\)/g, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      this.numero = trataComplemento(this.normalizaNumeracao(rotulo!), converteLetraParaNumeroArabico);
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.alinea.name : trataComplemento(this.numero, converteNumeroArabicoParaLetra) + this.SUFIXO;
    }
  };
}
