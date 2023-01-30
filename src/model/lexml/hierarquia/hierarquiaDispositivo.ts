import { Dispositivo } from '../../dispositivo/dispositivo';
import { Hierarquia } from '../../dispositivo/hierarquia';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isArtigo } from '../../dispositivo/tipo';
import { calculaNumeracao } from '../numeracao/numeracaoUtil';
import { buildId } from '../util/idUtil';
import { isAntesDoPrimeiroDispositivoOriginal, isDispositivoAlteracao, podeRenumerarFilhosAutomaticamente } from './hierarquiaUtil';

export function HierarquiaDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Hierarquia {
    pai?: Dispositivo;
    private _filhos?: Dispositivo[];

    addFilho(filho: Dispositivo, referencia?: Dispositivo): void {
      if (referencia) {
        const posicao = this.filhos.indexOf(referencia) + 1;
        this.isLastFilho(referencia) ? this.filhos.push(filho) : this.filhos.splice(posicao, 0, filho);
      } else {
        this.filhos.push(filho);
      }
    }

    addFilhoOnPosition(filho: Dispositivo, posicao: number): void {
      filho.pai = this as unknown as Dispositivo;
      this.filhos.splice(posicao, 0, filho);
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
      this.filhos.forEach(filho => {
        if (
          (isDispositivoAlteracao(filho) && isAntesDoPrimeiroDispositivoOriginal(filho)) ||
          filho.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_NOVO ||
          filho.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO
        ) {
          filho.numero = calculaNumeracao(filho);
          filho.createRotulo(filho);
          filho.id = buildId(filho);
        } else {
          //filho.createRotulo(filho);
        }
      });
    }
  };
}
