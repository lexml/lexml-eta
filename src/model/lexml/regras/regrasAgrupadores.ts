import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao } from '../../dispositivo/tipo';
import { ElementoAction, getAcaoAgrupamento } from '../acao';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  getDispositivoAnteriorMesmoTipo,
  getDispositivosAnterioresMesmoTipo,
  getDispositivosPosterioresMesmoTipo,
  hasAgrupador,
  isDispositivoAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasAgrupadores<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isAgrupador(dispositivo)) {
        return [];
      }

      if (getDispositivosAnterioresMesmoTipo(dispositivo).length === 0 && getDispositivosPosterioresMesmoTipo(dispositivo).length > 0 && hasAgrupador(dispositivo)) {
        //
      } else {
        acoes.push(removerElementoAction);
      }

      if (dispositivo.pai && isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && getDispositivoAnteriorMesmoTipo(dispositivo) === undefined) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
        dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (dispositivo.pai && !isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && dispositivo.pai!.indexOf(dispositivo) === 0) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
        dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (dispositivo.pai && dispositivo.pai!.indexOf(dispositivo) > 0 && isAgrupador(dispositivo.pai!) && !isArticulacao(dispositivo.pai)) {
        acoes.push(getAcaoAgrupamento(dispositivo.pai!.tipo));
      }

      if (isDispositivoAlteracao(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }

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
