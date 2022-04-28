import { Dispositivo } from '../model/dispositivo/dispositivo';
import { isDispositivoAlteracao } from '../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { TipoDispositivo } from './../model/lexml/tipo/tipoDispositivo';

export class DispositivoEmendaUtil {
  static getAlteracao(dispositivo: Dispositivo): Dispositivo | undefined {
    let d: Dispositivo | undefined = dispositivo;

    if (d.tipo === TipoDispositivo.alteracao.tipo) {
      return d;
    }

    if (!isDispositivoAlteracao(d)) {
      return undefined;
    }

    while (d && d.tipo !== TipoDispositivo.alteracao.tipo) {
      d = d.pai;
    }
    return d;
  }

  static existeNaNormaAlterada(dispositivo: Dispositivo): boolean {
    return (dispositivo.situacao as DispositivoAdicionado).existeNaNormaAlterada;
  }
}
