import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
import { converte, converteLetraParaNumeroArabico, converteNumeroArabicoParaLetra } from './numeracao-util';

export function NumeracaoAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAlineaLcp95';
    private SUFIXO = ')';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero).replace(/\)/g, '').trim();
    }

    isRotuloValido(rotulo: string): boolean {
      if (rotulo === undefined || rotulo.trim() === '') {
        return false;
      }
      return /^[a-z]{1,}([-]{1}[A-Z]+)?[)]?$/.test(rotulo);
    }

    createNumeroFromRotulo(rotulo: string): void {
      this.numero = converte(this.normalizaNumeracao(rotulo!), converteLetraParaNumeroArabico);
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.alinea.name : converte(this.numero, converteNumeroArabicoParaLetra) + this.SUFIXO;
    }
  };
}
