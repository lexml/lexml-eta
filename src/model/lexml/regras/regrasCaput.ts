import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '../acao';
import { Regras } from './regras';

export function RegrasCaput<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAcaoPossivelTab(dispositivo: Dispositivo): any {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAcaoPossivelShiftTab(dispositivo: Dispositivo): any {
      return undefined;
    }
  };
}
