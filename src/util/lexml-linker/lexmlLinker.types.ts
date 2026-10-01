// Schema do contrato JS↔WASM do lexml-linker, confirmado lendo src/wasm/haskell/LinkerWasm.hs
// (repo lexml-linker, commit b0fa5d6, branch linker-wasm32) — ver docs/referencia/LEXML_LINKER_WASM.md.

export interface LexmlLinkRequest {
  input: string;
  inputType?: 'text' | 'hxml';
  outputType?: 'urns' | 'html' | 'xml';
  /** 'federal' | 'senado' | uma URN LexML de contexto (ex.: 'urn:lex:...') */
  context?: string;
  resolverUrl?: string;
  baseUrl?: string;
  tokenLimit?: number;
  logRules?: boolean;
  logTokens?: boolean;
}

export interface LexmlLinkResponseOk {
  ok: true;
  content: string;
  partial: boolean;
}

export interface LexmlLinkResponseErro {
  ok: false;
  error: string;
}

export type LexmlLinkResponse = LexmlLinkResponseOk | LexmlLinkResponseErro;

export interface MensagemRequisicaoWorker {
  id: number;
  request: LexmlLinkRequest;
}

export interface MensagemRespostaWorker {
  id: number;
  resposta?: LexmlLinkResponse;
  erro?: string;
}

export interface RemissaoExternaDetectada {
  inicio: number;
  fim: number;
  textoRef: string;
  targetUrn: string;
  targetFragmento?: string;
}
