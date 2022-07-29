import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isInciso, isIncisoCaput, isIncisoParagrafo, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarAlinea, adicionarInciso, adicionarIncisoAntes, adicionarIncisoDepois, adicionarParagrafo } from '../acao/adicionarElementoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  TransformarElemento,
  transformarEmOmissisIncisoCaput,
  transformarEmOmissisIncisoParagrafo,
  transformarIncisoCaputEmAlinea,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
} from '../acao/transformarElementoAction';
import { hasIndicativoContinuacaoSequencia, hasIndicativoDesdobramento, hasIndicativoFinalSequencia } from '../conteudo/conteudoUtil';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  isDispositivoAlteracao,
  isPrimeiroMesmoTipo,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { Regras } from './regras';
import { podeConverterEmOmissis } from './regrasUtil';

export function RegrasInciso<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isInciso(dispositivo)) {
        return [];
      }

      acoes.push(removerElementoAction);
      if (!isDispositivoAlteracao(dispositivo) || dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || dispositivo.numero !== '1') {
        acoes.push(adicionarIncisoAntes);
      }
      acoes.push(adicionarIncisoDepois);

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAbaixoAction);
      }
      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined) {
        acoes.push(moverElementoAcimaAction);
      }

      if (isDispositivoAlteracao(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }
      if (isDispositivoAlteracao(dispositivo) && isUltimaAlteracao(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
      }

      if (hasIndicativoDesdobramento(dispositivo)) {
        acoes.push(adicionarAlinea);
      }
      if (hasIndicativoContinuacaoSequencia(dispositivo)) {
        acoes.push(adicionarInciso);
      }
      if (hasIndicativoFinalSequencia(dispositivo) && isUltimoMesmoTipo(dispositivo)) {
        acoes.push(adicionarParagrafo);
      }

      if (
        isIncisoCaput(dispositivo) &&
        (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && !isOmissis(getDispositivoAnterior(dispositivo)!)))
      ) {
        acoes.push(transformarIncisoCaputEmAlinea);
      }
      if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        acoes.push(transformarIncisoCaputEmParagrafo);
      }
      if (isIncisoCaput(dispositivo) && podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisIncisoCaput);
      }
      if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isPrimeiroMesmoTipo(dispositivo))) {
        acoes.push(transformarEmOmissisIncisoParagrafo);
      }
      if (
        isIncisoParagrafo(dispositivo) &&
        (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && isOmissis(getDispositivoAnterior(dispositivo)!)))
      ) {
        acoes.push(transformarIncisoParagrafoEmAlinea);
      }
      if (isIncisoParagrafo(dispositivo) && podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisIncisoParagrafo);
      }
      if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        acoes.push(transformarIncisoParagrafoEmParagrafo);
      }

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

      return dispositivo.getAcoesPermitidas(dispositivo, acoes);
    }
    getAcaoPossivelTab(dispositivo: Dispositivo): any {
      if (!isInciso(dispositivo)) {
        return undefined;
      }

      if (isIncisoCaput(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))) {
        return transformarIncisoCaputEmAlinea;
      }

      if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return transformarIncisoParagrafoEmAlinea;
      }

      return dispositivo.tiposPermitidosFilhos?.map(tipo => {
        const complemento = isInciso(dispositivo) ? dispositivo.pai!.tipo : '';

        const destino = tipo.endsWith(TipoDispositivo.inciso.name!)
          ? isParagrafo(dispositivo) && (!isUnicoMesmoTipo(dispositivo) || !isPrimeiroMesmoTipo(dispositivo))
            ? 'IncisoParagrafo'
            : 'IncisoCaput'
          : tipo;

        const acao = 'transformar' + dispositivo.tipo + complemento + 'Em' + destino;
        return dispositivo
          .getAcoesPossiveis(dispositivo)
          .filter(a => a instanceof TransformarElemento)
          .filter(a => a instanceof TransformarElemento && a.nomeAcao && acao && a.nomeAcao === acao)[0];
      })[0];
    }

    getAcaoPossivelShiftTab(dispositivo: Dispositivo): any {
      if (!isInciso(dispositivo)) {
        return undefined;
      }

      if (isIncisoCaput(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return transformarIncisoCaputEmParagrafo;
      }

      if (isIncisoParagrafo(dispositivo) && (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo))) {
        return transformarIncisoParagrafoEmParagrafo;
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
