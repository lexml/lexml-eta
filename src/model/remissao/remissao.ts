export interface RemissaoInternaValue {
  refId: string;

  targetUuid?: number;

  targetLexmlId?: string;

  targetRotulo?: string;

  sourceUuid?: number;

  sourceLexmlId?: string;

  textoRef?: string;

  textoFixo?: boolean;

  inicio?: number; // posição de início no texto do dispositivo de origem

  valida?: boolean; // false = dispositivo destino foi excluído; undefined = sem informação de validade
}

export interface ReferenciaDetectada {
  texto: string;

  indexInicio: number;

  indexFim: number;

  dispositivoDestino: any; // Dispositivo type
}

export type TipoAtualizacaoRemissao = 'renumeracao' | 'remocao' | 'adicao';

export interface AtualizacaoRemissao {
  tipo: TipoAtualizacaoRemissao;
  oldId?: string;
  newId?: string;
  oldUuid?: number;
  newUuid?: number;
  dispositivo?: any; // Dispositivo type
}

/**
 * Metadado de remissão interna com texto fixo, salvo na Proposicao.
 *
 * Remissões com textoFixo=true têm texto escolhido manualmente pelo usuário
 * e não são atualizadas automaticamente na renumeração. Como o bootstrap
 * ao abrir não consegue inferir essa flag apenas pelo HTML, ela é persistida
 * separadamente — sem duplicar dados já presentes na serialização LexML.
 */
export interface RemissaoTextoFixo {
  /** lexmlId do dispositivo de origem (fonte estável entre sessões) */
  sourceLexmlId: string;

  /** lexmlId do dispositivo destino */
  targetLexmlId: string;

  /** Texto customizado do link */
  textoRef: string;
}
