import { Elemento } from '../../elemento';

export enum TipoMensagem {
  INFO,
  WARNING,
  ERROR,
}

export interface Mensagem {
  tipo: TipoMensagem;
  descricao?: string;
  elemento?: Partial<Elemento>;
}

export interface MensagemErro extends Mensagem {
  tipo: TipoMensagem.ERROR;
  descricao: string;
  error: Error;
}
