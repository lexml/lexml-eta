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
      const num = /[CDILMVX]+(-[a-zA-Z]+)*/.exec(numero);
      return num ? num[0] : addSpaceRegex(numero).trim().replace(/-$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = trataComplemento(this.normalizaNumeracao(rotulo!), converteNumeroRomanoParaArabico);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      if (!this.numero) {
        this.rotulo = TipoDispositivo.inciso.name;
      } else {
        const num = this.numero.search(/[a-zA-Z-]/) === -1 ? parseInt(this.numero) : parseInt(this.numero.substring(0, this.numero.search(/[a-zA-Z-]/)));
        const resto = this.numero.search(/[a-zA-Z-]/) === -1 ? '' : this.numero.substring(this.numero.search(/[a-zA-Z-]/));
        this.rotulo = (num === 0 ? num + resto : trataComplemento(this.numero, converteNumeroArabicoParaRomano)) + this.SUFIXO;
      }
    }

    getNumeracaoParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return '[ainda não numerado]'; // TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + '';
      }
      return trataComplemento(this.numero, converteNumeroArabicoParaRomano);
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      if (this.numero === undefined) {
        return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' [ainda não numerado]';
      }
      return TipoDispositivo.inciso.descricao?.toLocaleLowerCase() + ' ' + this.getNumeracaoParaComandoEmenda();
    }
  };
}
