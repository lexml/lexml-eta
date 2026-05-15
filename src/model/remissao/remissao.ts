export interface RemissaoExternaValue {
  refId: string;
  targetUrn: string;
  targetNomeNorma: string;
  targetTextoDispositivo?: string;
  targetFragmento?: string;
  textoRef?: string;
  sourceUuid?: number;
}

export interface RemissaoInternaValue {
  refId: string;

  targetUuid?: number;

  targetLexmlId?: string;

  targetRotulo?: string;

  sourceUuid?: number;

  sourceLexmlId?: string;

  textoRef?: string;

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

export const MENSAGEM_REMISSAO_INVALIDA = 'Este dispositivo contém referência para dispositivo que foi excluído.';

export interface AtualizacaoRemissao {
  tipo: TipoAtualizacaoRemissao;
  oldId?: string;
  newId?: string;
  oldUuid?: number;
  newUuid?: number;
  dispositivo?: any; // Dispositivo type
}
