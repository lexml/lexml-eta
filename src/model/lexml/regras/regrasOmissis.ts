import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAlinea, isArticulacao, isArtigo, isCaput, isDispositivoGenerico, isInciso, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  transformarOmissisEmAlinea,
  transformarOmissisEmArtigo,
  transformarOmissisEmIncisoCaput,
  transformarOmissisEmIncisoParagrafo,
  transformarOmissisEmItem,
  transformarOmissisEmParagrafo,
} from '../acao/transformarElementoAction';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasDispositivosPosterioresAlteracao,
  isDispositivoAlteracao,
  isUltimaAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasOmissis<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isOmissis(dispositivo)) {
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

      if (isArticulacao(dispositivo.pai!) && getDispositivoAnterior(dispositivo) !== undefined) {
        acoes.push(transformarOmissisEmArtigo);
      }
      if (isCaput(dispositivo.pai!)) {
        acoes.push(transformarOmissisEmIncisoCaput);
      }
      if (isArtigo(dispositivo.pai!)) {
        acoes.push(transformarOmissisEmParagrafo);
      }
      if (isParagrafo(dispositivo.pai!)) {
        acoes.push(transformarOmissisEmIncisoParagrafo);
      }
      if (isInciso(dispositivo.pai!)) {
        acoes.push(transformarOmissisEmAlinea);
      }
      if (isAlinea(dispositivo.pai!)) {
        acoes.push(transformarOmissisEmItem);
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
