import type { CasaLegislativaEditor, TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';

export type EspecieDocumento = 'proposicao' | 'substitutivo' | 'subemenda';

export type TipoColegiadoDestino = 'Plenário' | 'Comissão';

export interface ColegiadoDestino {
  tipoColegiado: TipoColegiadoDestino;
  siglaComissao?: string;
}

/** Dados da Tela 1 que determinam URN, referência e identificação do novo documento. */
export interface DadosIdentificacao {
  casa: CasaLegislativaEditor;
  especie: EspecieDocumento;
  // g3: proposição nova (espécie Proposição) ou proposição referenciada.
  tipoProposicao?: TipoDocumento;
  numeroProposicao: string;
  anoProposicao: string;
  // g2 (só na CD): identificação do substitutivo/subemenda.
  tipoSubstitutivo?: TipoDocumento;
  anoSubstitutivo: string;
  // g4: medida provisória do PLV.
  numeroMpv: string;
  anoMpv: string;
}

export interface UrnNovaProposicao {
  urn: string;
  urnDocumentoReferenciado?: string;
}

export interface ResultadoNovaProposicao extends UrnNovaProposicao {
  epigrafe: string;
  preambulo: string;
  colegiadoDestino: ColegiadoDestino;
  texto?: unknown;
  anexoParecer: boolean;
}

export const NUMERO_NAO_NUMERADO = '999999';
export const SUFIXO_SUBSTITUTIVO_SF = '@apresentacao.substitutivo';
export const SIGLA_PLV = 'PLV';
export const LIMITE_ARQUIVO_BYTES = 5 * 1024 * 1024;
