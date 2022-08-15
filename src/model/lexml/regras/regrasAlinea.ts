import { podeEditarNotaAlteracao } from './../hierarquia/hierarquiaUtil';
import { atualizarNotaAlteracaoAction } from './../acao/atualizarNotaAlteracaoAction';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAlinea, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { adicionarAlinea, adicionarAlineaAntes, adicionarAlineaDepois, adicionarItem } from '../acao/adicionarElementoAction';
import { iniciarBlocoAlteracao } from '../acao/blocoAlteracaoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { moverElementoAbaixoAction } from '../acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../acao/moverElementoAcimaAction';
import { removerElementoAction } from '../acao/removerElementoAction';
import { renumerarElementoAction } from '../acao/renumerarElementoAction';
import {
  transformaAlineaEmItem,
  transformarAlineaEmIncisoCaput,
  transformarAlineaEmIncisoParagrafo,
  TransformarElemento,
  transformarEmOmissisAlinea,
} from '../acao/transformarElementoAction';
import { hasIndicativoContinuacaoSequencia, hasIndicativoDesdobramento } from '../conteudo/conteudoUtil';
import {
  getDispositivoAnterior,
  getDispositivoAnteriorMesmoTipoInclusiveOmissis,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  isDispositivoAlteracao,
  isDispositivoNovoNaNormaAlterada,
  isPrimeiroMesmoTipo,
  isUltimaAlteracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../situacao/dispositivoAdicionado';
import { Regras } from './regras';
import { podeConverterEmOmissis } from './regrasUtil';

export function RegrasAlinea<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Regras {
    getAcoesPossiveis(dispositivo: Dispositivo): ElementoAction[] {
      const acoes: ElementoAction[] = [];

      if (!isAlinea(dispositivo)) {
        return [];
      }

      acoes.push(removerElementoAction);

      if (!isDispositivoAlteracao(dispositivo) || dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO || dispositivo.numero !== '1') {
        acoes.push(adicionarAlineaAntes);
      }

      acoes.push(adicionarAlineaDepois);

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

      if (dispositivo.texto.length === 0 || hasIndicativoContinuacaoSequencia(dispositivo)) {
        acoes.push(adicionarAlinea);
      }
      if (dispositivo.texto.length === 0 || hasIndicativoDesdobramento(dispositivo)) {
        acoes.push(adicionarItem);
      }
      if (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo)) {
        acoes.push(isParagrafo(dispositivo.pai!.pai!) ? transformarAlineaEmIncisoParagrafo : transformarAlineaEmIncisoCaput);
      }
      if (!isPrimeiroMesmoTipo(dispositivo) || (getDispositivoAnterior(dispositivo) !== undefined && !isOmissis(getDispositivoAnterior(dispositivo)!))) {
        acoes.push(transformaAlineaEmItem);
      }
      if (podeConverterEmOmissis(dispositivo)) {
        acoes.push(transformarEmOmissisAlinea);
      }

      if (isDispositivoAlteracao(dispositivo) && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
        (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada ? acoes.push(considerarElementoNovoNaNorma) : acoes.push(considerarElementoExistenteNaNorma);
      }

      if (podeEditarNotaAlteracao(dispositivo)) {
        acoes.push(atualizarNotaAlteracaoAction);
      }

      return dispositivo.getAcoesPermitidas(dispositivo, acoes);
    }

    getAcaoPossivelTab(dispositivo: Dispositivo): any {
      if (!isAlinea(dispositivo)) {
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
      if (!isAlinea(dispositivo)) {
        return undefined;
      }

      if (isUnicoMesmoTipo(dispositivo) || isUltimoMesmoTipo(dispositivo)) {
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
