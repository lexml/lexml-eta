import { Dispositivo } from '../../dispositivo/dispositivo';
import { Numeracao } from '../../dispositivo/numeracao';
import { converteNumeroArabicoParaRomano, converteNumeroRomanoParaArabico, isNumeracaoValida, trataComplemento } from './numeracaoUtil';

export function NumeracaoAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoAgrupadorLcp95';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return numero.trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataComplemento(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(dispositivo: Dispositivo): void {
      const partes = this.numero?.split('-');
      const prefixo = dispositivo.descricao === undefined ? dispositivo.name ?? '' : dispositivo.descricao.toLocaleUpperCase();
      this.rotulo =
        this.numero === undefined
          ? dispositivo?.tipo ?? ''
          : !isNumeracaoValida(this.numero)
          ? prefixo + ' ' + this.numero
          : prefixo.toLocaleUpperCase() + ' ' + converteNumeroArabicoParaRomano(partes![0]) + (partes!.length > 1 ? '-' + partes![1].toUpperCase() : '');
    }
  };
}
