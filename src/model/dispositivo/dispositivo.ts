import { ProjetoNorma } from './../lexml/documento/projetoNorma';
import { Regras } from '../lexml/regras/regras';
import { BlocoAlteracao } from './blocoAlteracao';
import { Conteudo } from './conteudo';
import { Genero } from './genero';
import { Hierarquia } from './hierarquia';
import { Numeracao } from './numeracao';
import { Situacao } from './situacao';
import { Tipo } from './tipo';
import { Validacao } from './validacao';

export interface Dispositivo extends Tipo, Hierarquia, Numeracao, Conteudo, BlocoAlteracao, Genero, Regras, Situacao, Validacao {
  tipo: string;
  href?: string;
  id?: string;
  uuid?: number;
  uuid2?: string;
  cabecaAlteracao?: boolean;
  notaAlteracao?: string;
  motivosOperacaoNaoPermitida?: string[];
  restaurado?: boolean;
}

export interface Articulacao extends Dispositivo {
  projetoNorma?: ProjetoNorma;
  tipo: string;
  artigos: Artigo[];
  addArtigo(dispositivo: Dispositivo, referencia?: Dispositivo): void;
  addArtigoOnPosition(dispositivo: Dispositivo, posicao: number): void;
  renumeraArtigos(): void;
  removeArtigo(artigo: Artigo): void;
  indexOfArtigo(artigo: Artigo): number;
}
export interface Artigo extends Dispositivo {
  tipo: string;
  caput?: Dispositivo;
}
