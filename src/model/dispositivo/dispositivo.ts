import { BlocoAlteracao } from './alteracao';
import { Conteudo } from './conteudo';
import { Genero } from './genero';
import { Hierarquia } from './hierarquia';
import { Numeracao } from './numeracao';
import { Tipo } from './tipo';
import { Validacao } from './validacao';

export interface Dispositivo extends Tipo, Hierarquia, Numeracao, Conteudo, BlocoAlteracao, Genero, Validacao {
  tipo: string;
  uuid?: number;
}

export interface Articulacao extends Dispositivo {
  tipo: string;
  artigos: Artigo[];
  isBlocoAlteracao?: boolean;
  addArtigo(dispositivo: Dispositivo, referencia?: Dispositivo): void;
  addArtigoOnPosition(dispositivo: Dispositivo, posicao: number): void;
  renumeraArtigos(): void;
  removeArtigo(artigo: Artigo): void;
  indexOfArtigo(artigo: Artigo): number;
}
export interface Artigo extends Dispositivo {
  tipo: string;
  caput?: Dispositivo;
  blocoAlteracao?: BlocoAlteracao;
}
