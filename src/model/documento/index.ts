import { Conteudo } from '../dispositivo/conteudo';
import { Articulacao, Dispositivo } from '../dispositivo/dispositivo';

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
  ementa?: Dispositivo; // Conteudo;
  preambulo?: Conteudo;
}
