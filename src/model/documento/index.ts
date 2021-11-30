import { Conteudo } from '../dispositivo/conteudo';
import { Articulacao } from '../dispositivo/dispositivo';
import { SubTipoDocumento, TipoDocumento } from './tipoDocumento';

export interface Documento {
  tipo: string;
  subTipo?: SubTipoDocumento;
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

export interface Norma extends Documento, Metadado, ParteInicial, TextoArticulado {
  tipo: TipoDocumento.NORMA;
}
