export interface RemissaoExternaValue {
  refId: string;
  targetUrn: string;
  targetNomeNorma: string;
  targetTextoDispositivo?: string;
  targetFragmento?: string;
  textoRef?: string;
  sourceUuid?: number;

  inicio?: number; // posição de início no texto do dispositivo de origem

  fim?: number; // fim exclusivo (inicio + textoRef.length) — usado para excluir o trecho da detecção interna, evitando falso positivo do achado #4
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

  revisao?: true; // presente apenas quando texto não pôde ser atualizado após renumeração

  excluidaManualmente?: true; // presente quando o usuário excluiu o link via botão "Excluir" — bloqueia recriação enquanto o texto não mudar
}

export interface ReferenciaDetectada {
  texto: string;

  indexInicio: number;

  indexFim: number;

  dispositivoDestino: any; // Dispositivo type
}

export type TipoAtualizacaoRemissao = 'renumeracao' | 'remocao' | 'adicao';

export const MENSAGEM_REMISSAO_INVALIDA = 'Este dispositivo contém referência para dispositivo que foi excluído.';

export const SUFIXO_REVISAO = '@revisar';

export const MENSAGEM_REMISSAO_TEXTO_PRESERVADO =
  'Este dispositivo contém remissão com texto personalizado que não pôde ser atualizado ' + 'após renumeração. Revise o texto do link.';

export interface AtualizacaoRemissao {
  tipo: TipoAtualizacaoRemissao;
  oldId?: string;
  newId?: string;
  oldUuid?: number;
  newUuid?: number;
  dispositivo?: any; // Dispositivo type
}
