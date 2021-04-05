import { Numeracao } from '../../dispositivo/numeracao';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function NumeracaoInciso<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIncisoLcp95';
    private SUFIXO = ' –';
    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = this.numero === undefined ? undefined : this.numeralToRoman(parseInt(this.numero, 10)) + this.SUFIXO;
    }

    private numeralToRoman(numero: number): string {
      let resultado = '';
      let temp;
      const romanNumList: { [key: string]: number } = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XV: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
      };

      for (const key in romanNumList) {
        temp = Math.floor(numero / romanNumList[key]);
        if (temp >= 0) {
          for (let i = 0; i < temp; i++) {
            resultado += key;
          }
        }
        numero = numero % romanNumList[key];
      }
      return resultado;
    }
  };
}
