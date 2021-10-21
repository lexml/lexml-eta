import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao } from '../../dispositivo/tipo';
import { ElementoAction, getAcaoAgrupamento } from '../acao';
import { getDispositivosPosterioresMesmoTipo, hasAgrupador } from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasAgrupadores<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      let acoes: ElementoAction[] = [];

      if (!isAgrupador(dispositivo)) {
        return [];
      }

      if (getDispositivosPosterioresMesmoTipo(dispositivo).length > 0 && hasAgrupador(dispositivo)) {
        const i: number = acoes.findIndex((acao: ElementoAction) => acao.descricao === 'Remover dispositivo');
        if (i > -1) {
          acoes = acoes.slice(i, 1);
        }
      }

      if (dispositivo.pai && !isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && dispositivo.pai!.indexOf(dispositivo) === 0) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
        dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (dispositivo.pai && dispositivo.pai!.indexOf(dispositivo) > 0 && isAgrupador(dispositivo.pai!) && !isArticulacao(dispositivo.pai)) {
        acoes.push(getAcaoAgrupamento(dispositivo.pai!.tipo));
      }
      const acoesSemDuplicidade = [...new Set(acoes)];

      return acoesSemDuplicidade
        .filter(a => a !== undefined)
        .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
        .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
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
