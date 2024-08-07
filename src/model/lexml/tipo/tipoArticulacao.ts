import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { calculaNumeracao } from '../numeracao/numeracaoUtil';
import { buildId } from '../util/idUtil';
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
    this._artigos = this._artigos ?? [];
    this._artigos.splice(posicao, 0, filho as Artigo);
  }

  removeArtigo(artigo: Artigo): void {
    this._artigos = this._artigos ?? [];
    this._artigos = this._artigos.filter(f => f.uuid !== artigo.uuid);
  }

  renumeraArtigos(): void {
    this.artigos
      .filter(f => f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_NOVO || f.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO)
      .forEach(filho => {
        if (!isDispositivoAlteracao(filho)) {
          filho.numero = calculaNumeracao(filho);
        }
        filho.createRotulo(filho);
        filho.id = buildId(filho);
        const caput = (filho as Artigo).caput;
        if (caput) {
          caput.id = buildId(caput);
        }
      });
  }

  indexOfArtigo(artigo: Artigo): number {
    return this.artigos.indexOf(artigo);
  }
}
