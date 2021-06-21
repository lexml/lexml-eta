import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../../dispositivo/tipo';
import { converte, converteNumeroArabicoParaRomano, converteNumeroRomanoParaArabico, isNumeracaoValida } from './numeracao-util';

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
      const temp = converte(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      const partes = this.numero?.split('-');

      this.rotulo =
        this.numero === undefined
          ? TipoDispositivo.inciso.name
          : !isNumeracaoValida(this.numero)
          ? this.numero + this.SUFIXO
          : converteNumeroArabicoParaRomano(partes![0]) + (partes!.length > 1 ? '-' + partes![1] : '') + this.SUFIXO;
    }
  };
}
