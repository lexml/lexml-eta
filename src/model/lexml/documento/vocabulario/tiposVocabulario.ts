export type CasaLegislativa = 'SF' | 'CD' | 'CN';

export interface AutoridadeItem {
  urn: string;
  descricao: string;
  // Casa responsável pelas proposições da autoridade; sem sigla (ex.: `federal`), o editor não as suporta por completo.
  sigla?: CasaLegislativa;
}

export enum TipoRelacaoSubstitutivo {
  ACEITA_SUBSTITUTIVO = 'aceita substitutivo',
  NAO_ACEITA_SUBSTITUTIVO = 'não aceita substitutivo',
  E_SUBSTITUTIVO = 'é substitutivo',
  E_SUBEMENDA_SUBSTITUTIVA = 'é subemenda substitutiva',
}

export enum TextoPreambuloPadrao {
  CONGRESSO_DECRETA = 'O CONGRESSO NACIONAL decreta:',
  CONGRESSO_RESOLVE = 'O CONGRESSO NACIONAL resolve:',
  SENADO_RESOLVE = 'O SENADO FEDERAL resolve:',
  CAMARA_RESOLVE = 'A CÂMARA DOS DEPUTADOS resolve:',
  MESAS_PROMULGAM_EMENDA = 'As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:',
  PRESIDENTE_ADOTA_MPV = 'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:',
}

export type CasaLegislativaEditor = 'SF' | 'CD';

// Proposição tem `sigla`; norma (`lei`, `decreto`...) não, e só serve para referenciar.
export interface TipoDocumentoItem {
  urnTipoDocumento: string;
  sigla?: string;
  descricao: string;
  genero: string;
  // Padrão `true`; tipo inativo só serve para referenciar.
  ativo?: boolean;
  // Padrão `não aceita substitutivo`.
  tipoRelacaoSubstitutivo?: TipoRelacaoSubstitutivo;
}

// `urnTipoDocumento` é o tipo da URN sem o `;sigla`.
export interface PreambuloPadraoItem {
  urnTipoDocumento: string;
  texto: TextoPreambuloPadrao;
}

export interface AtalhoUrnItem {
  urnTipoDocumento: string;
  urnAutoridade: string;
  urn: string;
  nome: string;
  genero?: string;
}

export interface EventoItem {
  urn: string;
  tipoTextoProcessoLegislativo: string;
  substitutivo?: string;
  genero: string;
}

// Itens sem `urnAutoridade`: `mesclar` carimba a da própria autoridade.
export interface VocabularioAutoridade {
  autoridade: AutoridadeItem;
  tiposDocumento?: TipoDocumentoItem[];
  preambulosPadrao?: PreambuloPadraoItem[];
}

export interface VocabularioComum {
  atalhosUrn: AtalhoUrnItem[];
  eventos: EventoItem[];
}

export type ComAutoridade<T> = T & { urnAutoridade: string };

// `urn` é calculada na mesclagem: `urnTipoDocumento` + `;` + sigla em minúsculas (sem sigla, só o tipo).
export interface TipoDocumento extends ComAutoridade<TipoDocumentoItem> {
  urn: string;
}

export interface Vocabulario extends VocabularioComum {
  autoridades: AutoridadeItem[];
  tiposDocumento: TipoDocumento[];
  tiposDocumentoAtivos: TipoDocumento[];
  preambulosPadrao: ComAutoridade<PreambuloPadraoItem>[];
}
