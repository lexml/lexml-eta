import { Conteudo } from '../../dispositivo/conteudo';
import { TipoConteudo } from './tipoConteudo';

export function ConteudoDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Conteudo {
    readonly tipoConteudo = TipoConteudo.ConteudoTexto;
    texto = '';
  };
}
