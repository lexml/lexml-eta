import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAlinea, isIncisoCaput, isIncisoParagrafo, isOmissis, isParagrafo, isTextoOmitido } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida } from '../acao/acaoUtil';
import { adicionarIncisoFilho, adicionarParagrafoAntes, adicionarParagrafoDepois } from '../acao/adicionarElementoAction';
import { adicionarTextoOmissisAction } from '../acao/adicionarTextoOmissisAction';
import { atualizarNotaAlteracaoAction } from '../acao/atualizarNotaAlteracaoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { removerTextoOmissisAction } from '../acao/removerTextoOmissisAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  TransformarElemento,
  transformarEmOmissisParagrafo,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmParagrafo,
  transformarParagrafoEmArtigo,
  transformarParagrafoEmIncisoCaput,
  transformarParagrafoEmIncisoParagrafo,
} from '../acao/transformarElementoAction';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  isDispositivoAlteracao,
  isDispositivoNovoNaNormaAlterada,
  isPrimeiroMesmoTipo,
  isSuprimido,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
  podeEditarNotaAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { Regras } from './regras';
import { MotivosOperacaoNaoPermitida, existeFilhoDesbloqueado, isBloqueado, podeConverterEmOmissis } from './regrasUtil';

export function RegrasParagrafo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isParagrafo(dispositivo) || (isBloqueado(dispositivo) && isBloqueado(dispositivo.pai!))) {
        return [];
      }

      acoes.push(removerElementoAction);
      if (!isDispositivoAlteracao(dispositivo) || dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || dispositivo.numero !== '1') {
        acoes.push(adicionarParagrafoAntes);
      }
      acoes.push(adicionarParagrafoDepois);

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAbaixoAction);
      } else {
        verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.PROXIMO_DIFERENTE_PARAGRAFO);
      }

      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAcimaAction);
      } else {
        verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.PROXIMO_DIFERENTE_PARAGRAFO);
      }

      if (isDispositivoAlteracao(dispositivo) && !isDispositivoNovoNaNormaAlterada(dispositivo.pai!)) {
        acoes.push(renumerarElementoAction);
      }
      if (!isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(adicionarIncisoFilho);
      }
      if ((isPrimeiroMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo)) && (!getDispositivoAnterior(dispositivo) || !isOmissis(getDispositivoAnterior(dispositivo)!))) {
        acoes.push(transformarParagrafoEmIncisoCaput);
      }
      if (!isPrimeiroMesmoTipo(dispositivo) && isParagrafo(getDispositivoAnterior(dispositivo)!)) {
        acoes.push(transformarParagrafoEmIncisoParagrafo);
      }
      if (isUltimoMesmoTipo(dispositivo) || isUnicoMesmoTipo(dispositivo)) {
        acoes.push(transformarParagrafoEmArtigo);
      }
      if (podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisParagrafo);
      }
      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
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
      if (!isParagrafo(dispositivo)) {
        return undefined;
      }
      return dispositivo.tiposPermitidosFilhos?.map(tipo => {
        const destino = tipo.endsWith(TipoDispositivo.inciso.name!)
          ? isParagrafo(dispositivo) && !isUnicoMesmoTipo(dispositivo) && !isPrimeiroMesmoTipo(dispositivo) && isParagrafo(getDispositivoAnterior(dispositivo)!)
            ? 'IncisoParagrafo'
            : 'IncisoCaput'
          : tipo;

        const acao = 'transformar' + dispositivo.tipo + 'Em' + destino;
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

      if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return transformarIncisoCaputEmParagrafo;
      }

      if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return transformarIncisoParagrafoEmParagrafo;
      }

      if (isAlinea(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return isParagrafo(dispositivo.pai!.pai!) ? transformarAlineaEmIncisoParagrafo : transformarAlineaEmIncisoCaput;
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
