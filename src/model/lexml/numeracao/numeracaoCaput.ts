import { Numeracao } from '../../dispositivo/numeracao';

export function NumeracaoCaput<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Numeracao {
    type = 'NumeracaoIndisponivel';

    numero?: string;
    rotulo?: string;

    createRotulo(): void {
      this.rotulo = undefined;
    }

    createNumeroFromRotulo(): void {
      //
    }

    getNumeracaoParaComandoEmenda(): string {
      return '';
    }

    getNumeracaoComRotuloParaComandoEmenda(): string {
      return 'caput';
    }
  };
}