// Tipo string para salvar o nome em vez do índice
export enum TipoMensagem {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum AutoFix {
  INFORMAR_NORMA = 'É necessário informar a norma a ser alterada',
  OMISSIS_ANTES = `É necessário um omissis antes deste dispositivo`,
  OMISSIS_SEQUENCIAIS = `Não pode haver mais de um omissis sequencialmente`,
  RENUMERAR_DISPOSITIVO = 'Numere o dispositivo',
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
