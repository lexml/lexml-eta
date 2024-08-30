import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isItem, isTextoOmitido } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarItemAntes, adicionarItemDepois } from '../acao/adicionarElementoAction';
import { adicionarTextoOmissisAction } from '../acao/adicionarTextoOmissisAction';
import { atualizarNotaAlteracaoAction } from '../acao/atualizarNotaAlteracaoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { removerTextoOmissisAction } from '../acao/removerTextoOmissisAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import { TransformarElemento, transformarEmOmissisItem, transformarItemEmAlinea } from '../acao/transformarElementoAction';
import {
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  isDispositivoAlteracao,
  isDispositivoNovoNaNormaAlterada,
  isSuprimido,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
  podeEditarNotaAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { Regras } from './regras';
import { existeFilhoDesbloqueado, isBloqueado, podeConverterEmOmissis } from './regrasUtil';

export function RegrasItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isItem(dispositivo) || (isBloqueado(dispositivo) && isBloqueado(dispositivo.pai!))) {
        return [];
      }

      acoes.push(removerElementoAction);
      if (!isDispositivoAlteracao(dispositivo) || dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || dispositivo.numero !== '1') {
        acoes.push(adicionarItemAntes);
      }
      acoes.push(adicionarItemDepois);

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAbaixoAction);
      }
      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAcimaAction);
      }

      if (isDispositivoAlteracao(dispositivo) && !isDispositivoNovoNaNormaAlterada(dispositivo.pai!)) {
        acoes.push(renumerarElementoAction);
      }
      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
      }

      if (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo)) {
        acoes.push(transformarItemEmAlinea);
      }
      if (podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisItem);
      }

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

      if (podeEditarNotaAlteracao(dispositivo)) {
        acoes.push(atualizarNotaAlteracaoAction);
      }

      if (dispositivo.isDispositivoAlteracao && !isTextoOmitido(dispositivo) && !isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(adicionarTextoOmissisAction);
      }

      if (dispositivo.isDispositivoAlteracao && isTextoOmitido(dispositivo) && !isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(removerTextoOmissisAction);
      }

      return dispositivo.getAcoesPermitidas(dispositivo, acoes);
    }
    getAcaoPossivelTab(dispositivo: Dispositivo): any {
      if (!isItem) {
        return undefined;
      }

      return dispositivo.tiposPermitidosFilhos?.map(tipo => {
        const acao = 'transformar' + dispositivo.tipo + 'Em' + tipo;
        return dispositivo
          .getAcoesPossiveis(dispositivo)
          .filter(a => a instanceof TransformarElemento)
          .filter(a => a instanceof TransformarElemento && a.nomeAcao && acao && a.nomeAcao === acao)[0];
      })[0];
    }

    getAcaoPossivelShiftTab(dispositivo: Dispositivo): any {
      if (!dispositivo.tiposPermitidosFilhos) {
        return undefined;
      }

      return dispositivo.tiposPermitidosPai?.map(tipo => {
        const acao = 'transformar' + dispositivo.tipo + 'Em' + tipo;

        return dispositivo
          .getAcoesPossiveis(dispositivo)
          .filter(a => a instanceof TransformarElemento)
          .filter(a => a instanceof TransformarElemento && a.nomeAcao && acao && a.nomeAcao === acao)[0];
      })[0];
    }
  };
}
