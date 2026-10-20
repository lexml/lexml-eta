import { Dispositivo } from '../../dispositivo/dispositivo';
import { Hierarquia } from '../../dispositivo/hierarquia';
import { isArtigo, isPena } from '../../dispositivo/tipo';
import { calculaNumeracao } from '../numeracao/numeracaoUtil';
import { buildId } from '../util/idUtil';
import { getDispositivoAndFilhosAsLista, podeRenumerarFilhosAutomaticamente } from './hierarquiaUtil';

export function HierarquiaDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Hierarquia {
    pai?: Dispositivo;
    private _filhos?: Dispositivo[];

    // A pena é sempre o último filho: nenhum outro filho entra depois dela.
    private posicaoLimiteAntesDaPena(): number {
      const ultimo = this.filhos[this.filhos.length - 1];
      return ultimo && isPena(ultimo) ? this.filhos.length - 1 : this.filhos.length;
    }

    addFilho(filho: Dispositivo, referencia?: Dispositivo): void {
      if (isPena(filho)) {
        this.filhos.push(filho);
        return;
      }
      const posicao = referencia ? this.filhos.indexOf(referencia) + 1 : this.filhos.length;
      this.filhos.splice(Math.min(posicao, this.posicaoLimiteAntesDaPena()), 0, filho);
    }

    addFilhoOnPosition(filho: Dispositivo, posicao: number): void {
      filho.pai = this as unknown as Dispositivo;
      this.filhos.splice(isPena(filho) ? this.filhos.length : Math.min(posicao, this.posicaoLimiteAntesDaPena()), 0, filho);
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
    }

    renumeraFilhos(): void {
      if (!podeRenumerarFilhosAutomaticamente(this as any)) {
        return;
      }
      this.filhos
        .filter(filho => !isPena(filho))
        .forEach(filho => {
          filho.numero = calculaNumeracao(filho);
          filho.createRotulo(filho);
          const novoId = buildId(filho);
          if (filho.id !== novoId) {
            getDispositivoAndFilhosAsLista(filho).forEach(d => (d.id = buildId(d)));
          }
        });
    }
  };
}
