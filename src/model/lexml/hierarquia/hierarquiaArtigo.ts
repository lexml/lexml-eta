import { Dispositivo } from '../../dispositivo/dispositivo';
import { Hierarquia } from '../../dispositivo/hierarquia';
import { isCaput, isInciso } from '../../dispositivo/tipo';

export function HierarquiaArtigo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Hierarquia {
    pai?: Dispositivo;
    private _paragrafos?: Dispositivo[];

    caput?: Dispositivo;

    get filhos(): Dispositivo[] {
      const incisos = this.getIncisosCaput();
      const paragrafos = this.paragrafos;

      return incisos.concat(paragrafos);
    }

    private getIncisosCaput(): Dispositivo[] {
      return this.caput?.filhos ?? [];
    }

    get paragrafos(): Dispositivo[] {
      this._paragrafos = this._paragrafos ?? [];
      return this._paragrafos;
    }

    addFilhoOnPosition(filho: Dispositivo, posicao: number): void {
      isInciso(filho) ? this.caput!.addFilhoOnPosition(filho, posicao) : this.paragrafos.splice(posicao, 0, filho);
    }

    addFilho(filho: Dispositivo, referencia?: Dispositivo): void {
      isCaput(filho) ? (this.caput = filho) : isInciso(filho) ? this.addIncisoCaput(filho, referencia) : this.addParagrafo(filho, referencia);
    }

    removeFilho(filho: Dispositivo): void {
      isInciso(filho) ? this.caput?.removeFilho(filho) : this.removeParagrafo(filho);
    }

    private addIncisoCaput(filho: Dispositivo, referencia?: Dispositivo): void {
      this.caput!.addFilho(filho, referencia);
    }

    private addParagrafo(filho: Dispositivo, referencia?: Dispositivo): void {
      if (referencia) {
        const posicao = this.paragrafos.indexOf(referencia) + 1;
        this.isLastFilho(referencia) ? this.paragrafos.push(filho) : this.paragrafos.splice(posicao, 0, filho);
      } else {
        this.paragrafos.push(filho);
      }
    }

    private removeParagrafo(filho: Dispositivo): void {
      this._paragrafos = this._paragrafos?.filter(f => (f.uuid !== filho.uuid ? f : (f.pai = undefined)));
    }

    isLastFilho(filho: Dispositivo): boolean {
      return this.paragrafos.indexOf(filho) === this.paragrafos.length - 1;
    }

    indexOf(filho: Dispositivo): number {
      return isInciso(filho) ? this.caput!.indexOf(filho) : this.filhos.indexOf(filho);
    }

    private renumeraIncisos(): void {
      this.caput?.renumeraFilhos();
    }

    private renumeraParagrafos(): void {
      this.paragrafos.forEach((filho, index) => {
        filho.numero = (++index).toString();
        filho.createRotulo(filho);
      });
    }

    isParagrafoUnico(): boolean {
      return this.paragrafos.length === 1;
    }

    renumeraFilhos(): void {
      this.renumeraIncisos();
      this.renumeraParagrafos();
    }
  };
}
