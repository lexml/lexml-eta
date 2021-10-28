import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { Hierarquia } from '../../dispositivo/hierarquia';
import { isArtigo } from '../../dispositivo/tipo';
import { calculaNumeracao } from '../numeracao/numeracaoEmendaUtil';
import { getArticulacao, getDispositivoAnterior, getProximoArtigoAnterior } from './hierarquiaUtil';

export function HierarquiaAgrupador<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Hierarquia {
    pai?: Dispositivo;
    private _filhos?: Dispositivo[];

    addFilho(filho: Dispositivo, referencia?: Dispositivo): void {
      if (referencia && this.filhos.indexOf(referencia) >= 0) {
        const posicao = this.filhos.indexOf(referencia) + 1;
        this.isLastFilho(referencia) ? this.filhos.push(filho) : this.filhos.splice(posicao, 0, filho);
      } else {
        this.filhos.push(filho);
      }
      isArtigo(filho) ? getArticulacao(filho).addArtigo(filho, referencia) : null;
    }

    addFilhoOnPosition(filho: Dispositivo, posicao: number): void {
      this.filhos.splice(posicao, 0, filho);
      if (isArtigo(filho)) {
        const anterior = getDispositivoAnterior(filho) ?? getProximoArtigoAnterior(filho.pai!.pai!, filho.pai!);
        const articulacao = getArticulacao(filho);
        const pos = anterior ? articulacao.indexOfArtigo(anterior as Artigo) + 1 : 0;
        articulacao.addArtigoOnPosition(filho, pos);
      }
    }

    hasArtigos(): boolean {
      return this.filhos.filter(f => isArtigo(f)).length > 0;
    }

    isLastFilho(filho: Dispositivo): boolean {
      return this.filhos.indexOf(filho) === this.filhos.length - 1;
    }

    get filhos(): Dispositivo[] {
      this._filhos = this._filhos ?? [];
      return this._filhos;
    }

    indexOf(filho: Dispositivo): number {
      return this.filhos.indexOf(filho);
    }

    removeFilho(filho: Dispositivo): void {
      this._filhos = this.filhos.filter(f => f.uuid !== filho.uuid);
      isArtigo(filho) ? (getArticulacao(filho) as Articulacao).removeArtigo(filho as Artigo) : null;
    }

    renumeraFilhos(): void {
      this.filhos
        .filter(filho => !isArtigo(filho))
        .forEach(f => {
          f.numero = calculaNumeracao(f);
          f.createRotulo(f);
        });
      this.hasArtigos() ? (getArticulacao(this.filhos[0]) as Articulacao).renumeraArtigos() : null;
    }
  };
}
