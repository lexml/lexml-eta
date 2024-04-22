import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isAlinea, isArticulacao, isArtigo, isCaput, isInciso, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { atualizarNotaAlteracaoAction } from '../acao/atualizarNotaAlteracaoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
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
  isDispositivoAlteracao,
  isUltimaAlteracao,
  podeEditarNotaAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasOmissis<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isOmissis(dispositivo)) {
        return [];
      }

      acoes.push(removerElementoAction);

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAbaixoAction);
      }
      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAcimaAction);
      }

      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
      }

      if (isArticulacao(dispositivo.pai!) && getDispositivoAnterior(dispositivo) !== undefined) {
        acoes.push(transformarOmissisEmArtigo);
      }

      if (isDispositivoAlteracao(dispositivo.pai!) && isDispositivoAlteracao(dispositivo) && isAgrupador(dispositivo.pai!) && !isArticulacao(dispositivo.pai!)) {
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

      if (podeEditarNotaAlteracao(dispositivo)) {
        acoes.push(atualizarNotaAlteracaoAction);
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
