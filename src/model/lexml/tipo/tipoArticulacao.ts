import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isOriginal } from '../hierarquia/hierarquiaUtil';
import { calculaNumeracao } from '../numeracao/numeracaoUtil';
import { TipoLexml } from './tipoLexml';

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
    this.artigos
      .filter(a => !isOriginal(a))
      .forEach(filho => {
        filho.numero = calculaNumeracao(filho);
        filho.createRotulo(filho);
      });
  }

  indexOfArtigo(artigo: Artigo): number {
    return this.artigos.indexOf(artigo);
  }
}
