import { ClassificacaoDocumento } from '../../documento/classificacao';
import { Classificacao, Metadado, ParteInicial, TextoArticulado } from '../../documento/index';
import { TipoDocumento } from '../../documento/tipoDocumento';

export type ProjetoNorma = Norma | Projeto;

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

export const isNorma = (projetoNorma: ProjetoNorma): boolean => {
  return projetoNorma.classificacao === ClassificacaoDocumento.NORMA;
};

export const isProjeto = (projetoNorma: ProjetoNorma): boolean => {
  return projetoNorma.classificacao === ClassificacaoDocumento.PROJETO;
};
