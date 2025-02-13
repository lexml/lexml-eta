import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAgrupador, isAlinea, isArticulacao, isArtigo, isIncisoCaput, isIncisoParagrafo, isOmissis, isParagrafo, isTextoOmitido } from '../../dispositivo/tipo';
import { ElementoAction, getAcaoAgrupamento } from '../acao';
import { verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida } from '../acao/acaoUtil';
import {
  adicionarArtigo,
  adicionarArtigoAntes,
  adicionarArtigoDepois,
  adicionarElementoAction,
  adicionarIncisoFilho,
  adicionarParagrafoFilho,
} from '../acao/adicionarElementoAction';
import { adicionarTextoOmissisAction } from '../acao/adicionarTextoOmissisAction';
import { adicionarCapitulo } from '../acao/agruparElementoAction';
import { atualizarNotaAlteracaoAction } from '../acao/atualizarNotaAlteracaoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { InformarDadosAssistenteAction } from '../acao/informarDadosAssistenteAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { informarNormaAction } from '../acao/informarNormaAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { removerTextoOmissisAction } from '../acao/removerTextoOmissisAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  TransformarElemento,
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  transformarArtigoEmParagrafo,
  transformarEmOmissisArtigo,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmParagrafo,
} from '../acao/transformarElementoAction';
import { hasIndicativoDesdobramento } from '../conteudo/conteudoUtil';
import {
  getAgrupadorPosterior,
  getAgrupadoresAcima,
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasAgrupadoresAcima,
  hasAgrupadoresPosteriores,
  hasFilhos,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isSuprimido,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
  podeEditarNotaAlteracao,
} from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { isAgrupadorNaoArticulacao } from './../../dispositivo/tipo';
import { adicionarAgrupadorArtigoAntesAction } from './../acao/adicionarAgrupadorArtigoAction';
import { getProximoAgrupadorAposArtigo } from './../hierarquia/hierarquiaUtil';
import { Regras } from './regras';
import { MotivosOperacaoNaoPermitida, existeFilhoDesbloqueado, isBloqueado, podeConverterEmOmissis } from './regrasUtil';

export function RegrasArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isArtigo(dispositivo)) {
        return [];
      }

      acoes.push(adicionarElementoAction);

      acoes.push(removerElementoAction);

      if (getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) || getProximoAgrupadorAposArtigo(dispositivo)) {
        acoes.push(moverElementoAbaixoAction);
      } else {
        verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.PROXIMO_DIFERENTE_ARTIGO_ALTERACAO_NORMA);
      }
      if (getDispositivoAnteriorMesmoTipoInclusiveOmissis(dispositivo) || isAgrupadorNaoArticulacao(dispositivo.pai!)) {
        acoes.push(moverElementoAcimaAction);
      } else {
        verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.PROXIMO_DIFERENTE_ARTIGO_ALTERACAO_NORMA);
      }

      if (
        !isDispositivoCabecaAlteracao(dispositivo) ||
        !isDispositivoAlteracao(dispositivo) ||
        dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO ||
        dispositivo.numero !== '1'
      ) {
        acoes.push(adicionarArtigoAntes);
      }
      acoes.push(adicionarArtigoDepois);

      if (!isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(adicionarParagrafoFilho);
        acoes.push(adicionarIncisoFilho);
      }

      if (!isDispositivoAlteracao(dispositivo)) {
        acoes.push(InformarDadosAssistenteAction);
      }

      if (isDispositivoAlteracao(dispositivo)) {
        acoes.push(renumerarElementoAction);
      }
      if (dispositivo.alteracoes && dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
        acoes.push(informarNormaAction);
      }
      if (!dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && (dispositivo.texto.length === 0 || !hasIndicativoDesdobramento(dispositivo))) {
        acoes.push(adicionarArtigo);
      }
      if (
        dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
        !dispositivo.hasAlteracao() &&
        !isDispositivoAlteracao(dispositivo) &&
        !hasFilhos(dispositivo)
      ) {
        acoes.push(iniciarBlocoAlteracao);
      }
      if (
        dispositivo.pai!.indexOf(dispositivo) > 0 &&
        getDispositivoAnterior(dispositivo) !== undefined &&
        !getDispositivoAnterior(dispositivo)?.hasAlteracao() &&
        !isOmissis(getDispositivoAnterior(dispositivo)!) &&
        (!isDispositivoAlteracao(dispositivo) || !getDispositivoAnterior(dispositivo) || !isAgrupador(getDispositivoAnterior(dispositivo)!))
      ) {
        acoes.push(transformarArtigoEmParagrafo);
      }
      if (dispositivo.pai && !isDispositivoAlteracao(dispositivo) && isArticulacao(dispositivo.pai) && dispositivo.pai!.filhos.filter(d => isAgrupador(d)).length === 0) {
        acoes.push(adicionarCapitulo);
      }
      if (dispositivo.pai && isDispositivoAlteracao(dispositivo) && isAgrupador(dispositivo.pai)) {
        acoes.push(adicionarCapitulo);
      }
      if (!isDispositivoAlteracao(dispositivo) && dispositivo.pai && hasAgrupadoresPosteriores(dispositivo)) {
        acoes.push(getAcaoAgrupamento(getAgrupadorPosterior(dispositivo).tipo));
      }
      if (!isDispositivoAlteracao(dispositivo) && isAgrupador(dispositivo.pai!)) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo) ?? 0;
        dispositivo.tiposPermitidosPai
          ?.filter(() => pos > 0)
          .filter((tipo, index) => (dispositivo.pai!.indexOf(dispositivo) > 0 ? index >= pos! : index > pos!))
          .forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (
        !isDispositivoAlteracao(dispositivo) &&
        isAgrupador(dispositivo.pai!) &&
        !isArticulacao(dispositivo.pai!) &&
        dispositivo.pai!.indexOf(dispositivo) > 0 &&
        hasAgrupadoresAcima(dispositivo)
      ) {
        const pos = dispositivo.tiposPermitidosPai?.indexOf(dispositivo.pai!.tipo) ?? 0;

        const tiposExistentes = getAgrupadoresAcima(dispositivo.pai!.pai!, dispositivo.pai!, []).reduce(
          (lista: string[], dispositivo: Dispositivo) =>
            lista.includes(dispositivo.tipo) && getAgrupadorPosterior(dispositivo) !== undefined ? lista : lista.concat(dispositivo.tipo),
          []
        );
        dispositivo.tiposPermitidosPai
          ?.filter(() => pos > 0)
          .filter(t => tiposExistentes.includes(t))
          .forEach(t => acoes.push(getAcaoAgrupamento(t)));
      }

      if (podeConverterEmOmissis(dispositivo) && !isArticulacao(dispositivo.pai!)) {
        acoes.push(transformarEmOmissisArtigo);
      }

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

      if (podeEditarNotaAlteracao(dispositivo)) {
        acoes.push(atualizarNotaAlteracaoAction);
      }

      acoes.push(adicionarAgrupadorArtigoAntesAction);

      if (dispositivo.isDispositivoAlteracao && !isTextoOmitido(dispositivo) && !isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(adicionarTextoOmissisAction);
      }

      if (dispositivo.isDispositivoAlteracao && isTextoOmitido(dispositivo) && !isSuprimido(dispositivo) && (!isBloqueado(dispositivo) || existeFilhoDesbloqueado(dispositivo))) {
        acoes.push(removerTextoOmissisAction);
      }

      return dispositivo.getAcoesPermitidas(dispositivo, acoes);
    }

    getAcaoPossivelTab(dispositivo: Dispositivo): any {
      if (!isArtigo(dispositivo)) {
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
