import { Articulacao, Dispositivo } from '../../dispositivo/dispositivo';
import { TipoLexml } from './tipo-lexml';

export class TipoArtigo extends TipoLexml {
  _blocoAlteracao?: Articulacao;

  constructor() {
    super('artigo');
  }

  caput?: Dispositivo;

  get texto(): string {
    return this.caput?.texto ?? '';
  }

  set texto(texto: string) {
    this.caput!.texto = texto;
  }
}
