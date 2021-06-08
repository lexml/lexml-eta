import { Conteudo } from '../../dispositivo/conteudo';
import { TEXTO_OMISSIS } from '../../dispositivo/omissis';
import { TipoConteudo } from './tipo-conteudo';

export function ConteudoOmissis<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Conteudo {
    readonly tipoConteudo = TipoConteudo.ConteudoTexto;
    _texto = TEXTO_OMISSIS;

    get texto(): string {
      return this._texto;
    }

    set texto(texto: string) {
      // ignora
    }
  };
}
