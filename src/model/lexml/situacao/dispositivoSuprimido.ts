import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { isIncisoCaput } from '../../dispositivo/tipo';
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

    if ((isIncisoCaput(dispositivo) ? dispositivo.pai!.pai! : dispositivo.pai!).situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      a.push(restaurarElementoAction);
    }

    return a;
  }
}
