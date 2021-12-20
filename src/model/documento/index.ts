import { Conteudo } from '../dispositivo/conteudo';
import { Articulacao } from '../dispositivo/dispositivo';
import { SubTipoDocumento, TipoDocumento } from './tipoDocumento';

export interface Documento {
  tipo: string;
  subTipo?: SubTipoDocumento;
}

export type DocumentoComTextoArticulado = Norma | Proposicao;

export interface Metadado {
  urn?: string;
}

export interface TextoArticulado {
  articulacao?: Articulacao;
}

export interface ParteInicial {
  epigrafe?: Conteudo;
  ementa?: Conteudo;
  preambulo?: Conteudo;
}

export interface Norma extends Documento, Metadado, ParteInicial, TextoArticulado {
  tipo: TipoDocumento.NORMA;
}

export interface Proposicao extends Documento, Metadado, ParteInicial, TextoArticulado {
  tipo: TipoDocumento.PROPOSICAO;
}

export interface Emenda extends Documento {
  tipo: TipoDocumento.PROPOSICAO;
  projeto?: Proposicao;
}
