import { TEXTO_OMISSIS } from '../../dispositivo/omissis';
import { TipoLexml } from './tipoLexml';

export class TipoOmissis extends TipoLexml {
  constructor() {
    super('artigo');
  }

  get texto(): string {
    return TEXTO_OMISSIS;
  }
}
