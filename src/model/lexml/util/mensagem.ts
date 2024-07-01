// Tipo string para salvar o nome em vez do índice
export enum TipoMensagem {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum AutoFix {
  INFORMAR_NORMA = 'É necessário informar a norma a ser alterada',
  OMISSIS_ANTES = `É necessário uma linha pontilhada antes deste dispositivo`,
  OMISSIS_SEQUENCIAIS = `Não pode haver mais de uma linha pontilhada sequencialmente`,
  RENUMERAR_DISPOSITIVO = 'Numere o dispositivo',
}

export interface Mensagem {
  tipo: TipoMensagem;
  descricao?: string;
  detalhe?: any;
  fix?: any;
  nomeEvento?: string;
}

export interface MensagemErro extends Mensagem {
  tipo: TipoMensagem.ERROR;
}
