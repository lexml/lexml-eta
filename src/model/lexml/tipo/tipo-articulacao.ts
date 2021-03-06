import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { TipoLexml } from './tipo-lexml';

export class TipoArticulacao extends TipoLexml {
  _artigos?: Artigo[];

  constructor() {
    super('articulacao');
  }

  get artigos(): Artigo[] {
    return this._artigos ?? [];
  }

  addArtigo(artigo: Artigo, referencia?: Dispositivo): void {
    this._artigos = this._artigos ?? [];
    referencia !== undefined ? this._artigos.splice(this._artigos.indexOf(referencia as Artigo) + 1, 0, artigo) : this._artigos.push(artigo);
  }

  addArtigoOnPosition(filho: Dispositivo, posicao: number): void {
    this.artigos.splice(posicao, 0, filho as Artigo);
  }

  removeArtigo(artigo: Artigo): void {
    this._artigos = this._artigos ?? [];
    this._artigos = this._artigos.filter(f => f.uuid !== artigo.uuid);
  }

  renumeraArtigos(): void {
    this.artigos.forEach((filho, index) => {
      filho.numero = (++index).toString();
      filho.createRotulo(filho);
    });
  }

  indexOfArtigo(artigo: Artigo): number {
    return this.artigos.indexOf(artigo);
  }
}
