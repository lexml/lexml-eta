import { Counter } from '../../../util/counter';
import { DispositivoAlteracao } from '../../alteracao/dispositivo-alteracao';
import { Dispositivo } from '../../dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../../dispositivo/omissis';
import { TipoDispositivo } from '../../dispositivo/tipo';

export class DispositivoAlteracaoLexml implements DispositivoAlteracao {
  tipo?: string;
  subTipo?: string;
  uuid?: number;
  pai?: Dispositivo;
  _texto?: string;

  constructor(texto: string) {
    this.tipo = TipoDispositivo.dispositivoAlteracao.tipo;
    this.texto = texto;
    this.uuid = Counter.next();
  }

  get texto(): string {
    return this._texto ?? '';
  }

  set texto(texto: string) {
    if (/^\.+$/.test(texto)) {
      this._texto = TEXTO_OMISSIS;
      this.subTipo = TipoDispositivo.omissis.name;
    } else {
      this._texto = texto;
    }
  }
}
