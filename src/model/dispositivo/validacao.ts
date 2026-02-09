/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { Constructor } from '../lexml/util/mixin';
import { Mensagem } from '../lexml/util/mensagem';

export interface Validacao {
  mensagens?: Mensagem[];
}

export function ValidacaoDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Validacao {
    mensagens: Mensagem[] = [];
  };
}
