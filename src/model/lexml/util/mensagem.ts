export enum TipoMensagem {
  INFO,
  WARNING,
  ERROR,
}

export interface Mensagem {
  tipo: TipoMensagem;
  descricao?: string;
  detalhe?: any;
}

export interface MensagemErro extends Mensagem {
  tipo: TipoMensagem.ERROR;
}
