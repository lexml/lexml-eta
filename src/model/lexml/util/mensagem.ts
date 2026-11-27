// Tipo string para salvar o nome em vez do índice
export enum TipoMensagem {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  SUCCESS = 'SUCCESS',
}

export enum AutoFix {
  INFORMAR_NORMA = 'É necessário informar a norma a ser alterada',
  OMISSIS_ANTES = `É necessário uma linha pontilhada antes deste dispositivo`,
  OMISSIS_SEQUENCIAIS = `Não pode haver mais de uma linha pontilhada sequencialmente`,
  RENUMERAR_DISPOSITIVO = 'Numere o dispositivo',
  NORMA_ALTERADA_DIVERGENTE = 'A norma alterada difere da norma citada no artigo',
  NUMERACAO_REPETIDA = 'Dispositivo com numeração repetida',
  NUMERACAO_COMPLEMENTO = 'Dispositivo com complemento na numeração',
  NUMERACAO_LACUNA = 'Dispositivo com lacuna na numeração',
  NUMERACAO_FORA_DE_ORDEM = 'Dispositivo com numeração fora de ordem',
}

// Mensagens de numeração irregular: todas são corrigidas renumerando o grupo do dispositivo.
export const AUTOFIX_NUMERACAO_IRREGULAR: string[] = [AutoFix.NUMERACAO_REPETIDA, AutoFix.NUMERACAO_COMPLEMENTO, AutoFix.NUMERACAO_LACUNA, AutoFix.NUMERACAO_FORA_DE_ORDEM];

export interface Mensagem {
  tipo: TipoMensagem;
  descricao?: string;
  descricaoParaPDF?: string;
  detalhe?: any;
  fix?: any;
  nomeEvento?: string;
}

export interface MensagemErro extends Mensagem {
  tipo: TipoMensagem.ERROR;
}
