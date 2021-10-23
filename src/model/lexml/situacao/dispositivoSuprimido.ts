import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { Elemento } from '../../elemento';
import { ElementoAction } from '../acao';
import { restaurarElementoAction } from '../acao/restaurarElemento';

export class DispositivoSuprimido implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_SUPRIMIDO;
  dispositivoOriginal: Elemento;

  constructor(dispositivoOriginal: Elemento) {
    this.dispositivoOriginal = dispositivoOriginal;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const a: ElementoAction[] = [];

    a.push(restaurarElementoAction);

    return a;
  }
}
