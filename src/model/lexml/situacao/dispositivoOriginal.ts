import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { ElementoAction } from '../acao';
import { suprimirElementoAction } from '../acao/suprimirElemento';

export class DispositivoOriginal implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ORIGINAL;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const a: ElementoAction[] = [];

    a.push(suprimirElementoAction);

    return a;
  }
}
