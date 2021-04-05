/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Mensagem } from '../lexml/util/mensagem';

export interface Validacao {
  mensagens?: Mensagem[];
}

export function ValidacaoDispositivo<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Validacao {
    mensagens: Mensagem[] = [];
  };
}
