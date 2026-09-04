import { DescricaoSituacao } from './../../dispositivo/situacao';
// import { adicionarAgrupadorArtigoAction } from './../acao/adicionarAgrupadorArtigoAction';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarAgrupadorArtigoAction } from '../acao/adicionarAgrupadorArtigoAction';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../acao/adicionarElementoAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import { getDispositivosAnterioresMesmoTipo, getDispositivosPosterioresMesmoTipo, hasAgrupador, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { MotivosOperacaoNaoPermitida } from './regrasUtil';
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

      if (
        getDispositivosAnterioresMesmoTipo(dispositivo).length === 0 &&
        getDispositivosPosterioresMesmoTipo(dispositivo).length > 0 &&
        hasAgrupador(dispositivo) &&
        dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO
      ) {
        //
      } else {
        acoes.push(removerElementoAction);
      }

      if (isDispositivoAlteracao(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }

      acoes.push(adicionarAgrupadorArtigoAction);

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        dispositivo.existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

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
