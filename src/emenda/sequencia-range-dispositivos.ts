import { Dispositivo } from '../model/dispositivo/dispositivo';
import { removeFromArray } from '../util/objeto-util';
import { StringBuilder } from '../util/string-util';
import { RangeDispositivos } from './range-dispositivos';

export class SequenciaRangeDispositivos {
  private ranges = new Array<RangeDispositivos>();
  localizarArtigoEmAgrupador = false;
  informarCaputDoDispositivo = false;

  isVazio(): boolean {
    return this.ranges.length === 0;
  }

  add(range: RangeDispositivos): void {
    this.ranges.push(range);
  }

  addInicio(range: RangeDispositivos): void {
    this.ranges.unshift(range);
  }

  getQuantidadeRanges(): number {
    return this.ranges.length;
  }

  getPrimeiroRange(): RangeDispositivos {
    return this.ranges[0];
  }

  getPrimeiroDispositivo(): Dispositivo {
    return this.ranges[0].getPrimeiro();
  }

  getUltimoDispositivo(): Dispositivo {
    return this.ranges[this.ranges.length - 1].getUltimo();
  }

  getRanges(): RangeDispositivos[] {
    return this.ranges;
  }

  setRanges(ranges: RangeDispositivos[]): void {
    this.ranges = ranges;
  }

  getRange(i: number): RangeDispositivos {
    return this.ranges[i];
  }

  getTextoListaDeDispositivos(): string {
    const sb = new StringBuilder();
    const qtdRanges = this.ranges.length;
    let posRange = 1;
    for (const range of this.ranges) {
      // Conector
      if (posRange > 1) {
        if (posRange === qtdRanges) {
          sb.append(' e ');
        } else {
          sb.append(', ');
        }
      }

      sb.append(range.getNumeracaoParaComandoEmenda());

      posRange++;
    }
    return sb.toString();
  }

  static debug(sequencias: SequenciaRangeDispositivos[]): void {
    const sb = new StringBuilder();
    for (const sequencia of sequencias) {
      sb.append('seq: ' + sequencia);
    }
    console.log(sb);
  }

  toString(): string {
    return this.ranges.toString();
  }

  remove(nr: RangeDispositivos): void {
    removeFromArray(this.ranges, nr);
  }
}
