import { Elemento } from '../model/elemento';
export enum MessageType {
  INFO,
  WARNING,
  ERROR,
}

export enum MessageClassificationType {
  CONTEUDO_DISPOSITIVO,
  HIERARQUIA_DISPOSITIVO,
  NUMERACAO_DISPOSITIVO,
  TEXTO_DISPOSITIVO,
}

export interface Message {
  type: MessageType;
  classification: MessageClassificationType;
  description?: string;
  elemento?: Partial<Elemento>;
}

export interface ErrorMessage extends Message {
  type: MessageType.ERROR;
  description: string;
  error: Error;
}
