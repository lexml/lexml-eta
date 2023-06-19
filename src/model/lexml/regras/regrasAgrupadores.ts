import { DescricaoSituacao } from './../../dispositivo/situacao';
// import { adicionarAgrupadorArtigoAction } from './../acao/adicionarAgrupadorArtigoAction';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isOmissis } from '../../dispositivo/tipo';
import { ElementoAction, getAcaoAgrupamento } from '../acao';
import { adicionarAgrupadorArtigoAction } from '../acao/adicionarAgrupadorArtigoAction';
import { adicionarArtigoAntes, adicionarArtigoDepois } from '../acao/adicionarElementoAction';
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
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
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

      if (dispositivo.pai && isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && getDispositivoAnteriorMesmoTipo(dispositivo) === undefined) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
        dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (dispositivo.pai && !isArticulacao(dispositivo.pai) && isAgrupador(dispositivo.pai) && dispositivo.pai!.indexOf(dispositivo) === 0) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo);
        dispositivo.tiposPermitidosPai?.filter((tipo, index) => index > pos!).forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      /*       if (dispositivo.pai && dispositivo.pai!.indexOf(dispositivo) > 0 && isAgrupador(dispositivo.pai!) && !isArticulacao(dispositivo.pai)) {
        acoes.push(getAcaoAgrupamento(dispositivo.pai!.tipo));
      } */

      if (isDispositivoAlteracao(dispositivo) && !isOmissis(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }

      acoes.push(adicionarAgrupadorArtigoAction);

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

      verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.AGRUPADOR);

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
