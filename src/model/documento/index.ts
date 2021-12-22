import { Conteudo } from '../dispositivo/conteudo';
import { Articulacao } from '../dispositivo/dispositivo';
import { ClassificacaoDocumento } from './classificacao';
import { TipoDocumento } from './tipoDocumento';

export type ProjetoNorma = Norma | Projeto;

export interface Classificacao {
  classificacao: string;
}
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

export interface Norma extends Classificacao, Metadado, ParteInicial, TextoArticulado {
  classificacao: ClassificacaoDocumento.NORMA;
  tipo?: TipoDocumento;
}

export interface Projeto extends Classificacao, Metadado, ParteInicial, TextoArticulado {
  classificacao: ClassificacaoDocumento.PROJETO;
  tipo?: TipoDocumento;
}
export interface Emenda extends Classificacao {
  classificacao: ClassificacaoDocumento.EMENDA;
}
