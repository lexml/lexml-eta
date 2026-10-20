import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '../acao';
import { alterarRotuloPenaAction } from '../acao/penaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { Regras } from './regras';
import { isBloqueado } from './regrasUtil';

export function RegrasPena<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    // Sem mover, Tab, renumerar nem omissis: a pena é imóvel e acompanha o dono.
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      return isBloqueado(dispositivo) ? [] : dispositivo.getAcoesPermitidas(dispositivo, [removerElementoAction, alterarRotuloPenaAction]);
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
