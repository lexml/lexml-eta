import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAlinea, isCaput, isDispositivoGenerico, isInciso, isParagrafo } from '../../dispositivo/tipo';
import { acoesDisponiveis, ElementoAction } from '../acao';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { TransformarElemento } from '../acao/transformarElementoAction';
import { hasDispositivosPosterioresAlteracao, isDispositivoAlteracao, isUltimaAlteracao } from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasDispositivoGenerico<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isDispositivoGenerico(dispositivo)) {
        return [];
      }

      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
        if (hasDispositivosPosterioresAlteracao(dispositivo)) {
          acoes.push(finalizarBlocoAlteracao);
        }
      }

      if (
        (isParagrafo(dispositivo.pai!) || isCaput(dispositivo.pai!) || isInciso(dispositivo.pai!) || isAlinea(dispositivo.pai!)) &&
        dispositivo.pai!.tipoProvavelFilho!.length > 0
      ) {
        acoes.push(acoesDisponiveis.filter(a => a instanceof TransformarElemento && a.nomeAcao === 'transformarDispositivoGenericoEm' + dispositivo.pai!.tipoProvavelFilho)[0]);
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
