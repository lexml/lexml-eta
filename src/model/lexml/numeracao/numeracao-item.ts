import { addSpaceRegex } from '../../../util/string-util';
import { Numeracao } from '../../dispositivo/numeracao';
import { TipoDispositivo } from '../tipo/tipo-dispositivo';
import { isNumeracaoValida, trataComplemento } from './numeracao-util';

export function NumeracaoItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoItemLcp95';
    private SUFIXO = '.';
    numero?: string;
    rotulo?: string;

    private normalizaNumeracao(numero: string): string {
      return addSpaceRegex(numero).trim().replace(/\.$/, '').trim();
    }

    createNumeroFromRotulo(rotulo: string): void {
      const temp = this.normalizaNumeracao(rotulo!);
      this.numero = isNumeracaoValida(temp) ? temp : undefined;
    }

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? TipoDispositivo.item.name : trataComplemento(this.numero) + this.SUFIXO;
    }
  };
}
