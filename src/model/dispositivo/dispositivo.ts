import { BlocoAlteracao } from '../alteracao/bloco-alteracao';
import { Conteudo } from './conteudo';
import { Genero } from './genero';
import { Hierarquia } from './hierarquia';
import { Numeracao } from './numeracao';
import { Tipo } from './tipo';
import { Validacao } from './validacao';

export interface Dispositivo extends Tipo, Hierarquia, Numeracao, Conteudo, Genero, Validacao {
  tipo: string;
  uuid?: number;
  blocoAlteracao?: BlocoAlteracao;
}

export interface Articulacao extends Dispositivo {
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
