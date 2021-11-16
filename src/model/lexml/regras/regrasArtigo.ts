import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isAlinea, isArticulacao, isArtigo, isDispositivoGenerico, isIncisoCaput, isIncisoParagrafo, isParagrafo } from '../../dispositivo/tipo';
import { ElementoAction, getAcaoAgrupamento } from '../acao';
import { adicionarArtigo, adicionarElementoAction, adicionarInciso } from '../acao/adicionarElementoAction';
import { adicionarCapitulo } from '../acao/agruparElementoAction';
import { finalizarBlocoAlteracao, iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  transformarArtigoEmParagrafo,
  TransformarElemento,
  transformarIncisoCaputEmParagrafo,
  transformarIncisoParagrafoEmParagrafo,
} from '../acao/transformarElementoAction';
import { hasIndicativoDesdobramento } from '../conteudo/conteudoUtil';
import {
  getAgrupadoresAcima,
  getAgrupadorPosterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  hasAgrupadoresAcima,
  hasAgrupadoresPosteriores,
  hasDispositivosPosterioresAlteracao,
  hasFilhos,
  isDispositivoAlteracao,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { Regras } from './regras';

export function RegrasArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isArtigo(dispositivo)) {
        return [];
      }

      acoes.push(adicionarElementoAction);
      acoes.push(removerElementoAction);

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

      if (!dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && (dispositivo.texto.length === 0 || !hasIndicativoDesdobramento(dispositivo))) {
        acoes.push(adicionarArtigo);
      }
      if (!dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && (dispositivo.texto.length === 0 || hasIndicativoDesdobramento(dispositivo))) {
        acoes.push(adicionarInciso);
      }
      if (!dispositivo.hasAlteracao() && !isDispositivoAlteracao(dispositivo) && !hasFilhos(dispositivo)) {
        acoes.push(iniciarBlocoAlteracao);
      }
      if (dispositivo.pai!.indexOf(dispositivo) > 0) {
        acoes.push(transformarArtigoEmParagrafo);
      }
      if (dispositivo.pai && !isDispositivoAlteracao(dispositivo) && isArticulacao(dispositivo.pai) && dispositivo.pai!.filhos.filter(d => isAgrupador(d)).length === 0) {
        acoes.push(adicionarCapitulo);
      }
      if (dispositivo.pai && isDispositivoAlteracao(dispositivo) && isArticulacao(dispositivo.pai)) {
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
