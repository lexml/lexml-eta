import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { ElementoAction } from '../acao';
import { AgruparElemento } from '../acao/agruparElementoAction';
import { suprimirElementoAction } from '../acao/suprimirElemento';
import { TransformarElemento } from '../acao/transformarElementoAction';

export class DispositivoOriginal implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ORIGINAL;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesFiltradas = acoes
      .filter((a: ElementoAction) => !(a instanceof AgruparElemento))
      .filter((a: ElementoAction) => !a.descricao?.startsWith('Mover'))
      .filter((a: ElementoAction) => !(a instanceof TransformarElemento));
    acoesFiltradas.push(suprimirElementoAction);

    return acoesFiltradas;
  }
}
