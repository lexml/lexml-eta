import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '../acao';
import { alterarRotuloPenaAction } from '../acao/penaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { atualizarNotaAlteracaoAction } from '../acao/atualizarNotaAlteracaoAction';
import { podeEditarNotaAlteracao } from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';
import { adicionaAcoesDeExistenciaNaNorma, isBloqueado } from './regrasUtil';

export function RegrasPena<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    // Sem mover, Tab, renumerar nem omissis: a pena é imóvel e acompanha o dono.
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      if (isBloqueado(dispositivo)) {
        return [];
      }
      const acoes: ElementoAction[] = [removerElementoAction, alterarRotuloPenaAction];
      adicionaAcoesDeExistenciaNaNorma(dispositivo, acoes);
      if (podeEditarNotaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao, atualizarNotaAlteracaoAction);
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
