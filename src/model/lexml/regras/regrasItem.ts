import { Dispositivo } from '../../dispositivo/dispositivo';
import { isDispositivoGenerico, isItem } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import { TransformarElemento, transformarEmOmissisItem, transformarItemEmAlinea } from '../acao/transformarElementoAction';
import {
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasDispositivosPosterioresAlteracao,
  isDispositivoAlteracao,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';
import { podeConverterEmOmissis } from './regrasUtil';

export function RegrasItem<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isItem(dispositivo)) {
        return [];
      }

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAbaixoAction);
      }
      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAcimaAction);
      }

      if (isDispositivoAlteracao(dispositivo) && !isDispositivoGenerico(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }
      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
        if (hasDispositivosPosterioresAlteracao(dispositivo)) {
          acoes.push(finalizarBlocoAlteracao);
        }
      }

      if (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo)) {
        acoes.push(transformarItemEmAlinea);
      }
      if (podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisItem);
      }

      const acoesSemDuplicidade = [...new Set(acoes)];

      return acoesSemDuplicidade
        .filter(a => a !== undefined)
        .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
        .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
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
