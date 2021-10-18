import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { converteNumeroArabicoParaRomano, converteNumeroRomanoParaArabico, isNumeracaoValida, trataComplemento } from './numeracaoUtil';

export function NumeracaoInciso<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIncisoLcp95';
    private SUFIXO = ' –';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataComplemento(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      const partes = this.numero?.split('-');

      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.inciso.name
          : !isNumeracaoValida(this.numero)
          ? this.numero + this.SUFIXO
          : converteNumeroArabicoParaRomano(partes![0]) + (partes!.length > 1 ? '-' + partes![1].toUpperCase() : '') + this.SUFIXO;
    }
  };
}
