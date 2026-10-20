export interface AutoridadeItem {
  urn: string;
  descricao: string;
}

export interface TipoDocumentoItem {
  urn: string;
  descricao: string;
  genero: string;
}

export interface SiglaItem {
  urnTipoDocumento: string;
  sigla: string;
}

export interface FakeUrnItem {
  sigla: string;
  urnTipoDocumento: string;
}

// `urnTipoDocumento` é o tipo da URN sem o `;sigla`.
export interface PreambuloPadraoItem {
  urnTipoDocumento: string;
  texto: string;
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
  siglas?: SiglaItem[];
  fakeUrns?: FakeUrnItem[];
  preambulosPadrao?: PreambuloPadraoItem[];
}

export interface VocabularioComum {
  atalhosUrn: AtalhoUrnItem[];
  eventos: EventoItem[];
}

export type ComAutoridade<T> = T & { urnAutoridade: string };

export interface Vocabulario extends VocabularioComum {
  autoridades: AutoridadeItem[];
  tiposDocumento: ComAutoridade<TipoDocumentoItem>[];
  siglas: ComAutoridade<SiglaItem>[];
  fakeUrns: ComAutoridade<FakeUrnItem>[];
  preambulosPadrao: ComAutoridade<PreambuloPadraoItem>[];
}
