export enum TipoMensagem {
  INFO,
  WARNING,
  ERROR,
}

export enum AutoFix {
  OMISSIS_ANTES = `É necessário um omissis antes deste dispositivo`,
}

export interface Mensagem {
  tipo: TipoMensagem;
  descricao?: string;
  detalhe?: any;
  fix?: any;
}

export interface MensagemErro extends Mensagem {
  tipo: TipoMensagem.ERROR;
}
