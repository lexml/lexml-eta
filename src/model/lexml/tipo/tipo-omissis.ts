import { TEXTO_OMISSIS } from '../../dispositivo/omissis';
import { TipoLexml } from './tipo-lexml';

export class TipoOmissis extends TipoLexml {
  constructor() {
    super('artigo');
  }

  get texto(): string {
    return TEXTO_OMISSIS;
  }
}
