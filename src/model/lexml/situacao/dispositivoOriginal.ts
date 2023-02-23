import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, isSituacaoExclusivaDispositivoEmenda, TipoSituacao } from '../../dispositivo/situacao';
import { isAgrupador, isEmenta } from '../../dispositivo/tipo';
import { ElementoAction } from '../acao';
import { AgruparElemento } from '../acao/agruparElementoAction';
import { InformarNorma } from '../acao/informarNormaAction';
import { RemoverElemento } from '../acao/removerElementoAction';
import { RenumerarElemento } from '../acao/renumerarElementoAction';
import { suprimirAgrupadorAction } from '../acao/suprimirAgrupador';
import { suprimirElementoAction } from '../acao/suprimirElemento';
import { TransformarElemento } from '../acao/transformarElementoAction';
import { getDispositivoAndFilhosAsLista, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';

export class DispositivoOriginal implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ORIGINAL;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesFiltradas = acoes
      .filter((a: ElementoAction) => !(a instanceof AgruparElemento))
      .filter((a: ElementoAction) => !(a instanceof RemoverElemento))
      .filter((a: ElementoAction) => !a.descricao?.startsWith('Mover'))
      .filter((a: ElementoAction) => !(a instanceof TransformarElemento))
      .filter((a: ElementoAction) => !(a instanceof RenumerarElemento))
      .filter((a: ElementoAction) => !(a instanceof InformarNorma));

    if (
      !isEmenta(dispositivo) &&
      (!isAgrupador(dispositivo) || !isDispositivoAlteracao(dispositivo)) &&
      getDispositivoAndFilhosAsLista(dispositivo).filter(f => isSituacaoExclusivaDispositivoEmenda(f)).length === 0
    ) {
      acoesFiltradas.push(suprimirElementoAction);
    }

    if (isAgrupador(dispositivo) && isDispositivoAlteracao(dispositivo)) {
      acoesFiltradas.push(suprimirAgrupadorAction);
    }

    return acoesFiltradas;
  }
}
