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
      const num = /[CDILMVX]*/.exec(numero);

      return num ? num[0] : addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataComplemento(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.inciso.name : trataComplemento(this.numero, converteNumeroArabicoParaRomano) + this.SUFIXO;
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + '';
      }
      return trataComplemento(this.numero, converteNumeroArabicoParaRomano);
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + '';
      }
      return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
