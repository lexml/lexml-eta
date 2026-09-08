// import { adicionarAgrupadorArtigoAction } from './../acao/adicionarAgrupadorArtigoAction';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarAgrupadorArtigoAction } from '../acao/adicionarAgrupadorArtigoAction';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../acao/adicionarElementoAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import { podeRemoverAgrupador } from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';
import { adicionaAcoesDeExistenciaNaNorma, MotivosOperacaoNaoPermitida } from './regrasUtil';
import { verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida } from '../acao/acaoUtil';

export function RegrasAgrupadores<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];
      if (!isAgrupador(dispositivo)) {
        return [];
      }

      acoes.push(adicionarArtigoAntes);
      acoes.push(adicionarArtigoDepois);

      // TODO: dentro de alteração de norma a remoção segue liberada; revisar com a equipe.
      if (podeRemoverAgrupador(dispositivo)) {
        acoes.push(removerElementoAction);
      }

      acoes.push(renumerarElementoAction);

      acoes.push(adicionarAgrupadorArtigoAction);

      adicionaAcoesDeExistenciaNaNorma(dispositivo, acoes);

      verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.AGRUPADOR);

      return dispositivo.getAcoesPermitidas(dispositivo, acoes.filter(Boolean));
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
