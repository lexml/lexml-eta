import { Conteudo } from '../dispositivo/conteudo';
import { Articulacao } from '../dispositivo/dispositivo';
import { ClassificacaoDocumento } from './classificacao';
import { TipoDocumento } from './tipo';

export interface Documento {
  classificacao: string;
  tipo?: TipoDocumento;
}

export type DocumentoComTextoArticulado = Norma | Projeto;

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
  classificacao: ClassificacaoDocumento.NORMA;
}

export interface Projeto extends Documento, Metadado, ParteInicial, TextoArticulado {
  classificacao: ClassificacaoDocumento.PROJETO;
}

export interface Emenda extends Documento {
  classificacao: ClassificacaoDocumento.EMENDA;
  projeto?: Projeto;
}
