// import { adicionarAgrupadorArtigoAction } from './../acao/adicionarAgrupadorArtigoAction';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isEmenta } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarAgrupadorArtigoAction } from '../acao/adicionarAgrupadorArtigoAction';
import { adicionarArtigoDepois } from '../acao/adicionarElementoAction';
import { Regras } from './regras';

export function RegrasEmenta<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isEmenta(dispositivo)) {
        return [];
      }

      acoes.push(adicionarArtigoDepois);
      acoes.push(adicionarAgrupadorArtigoAction);

      return dispositivo.getAcoesPermitidas(dispositivo, acoes);
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
