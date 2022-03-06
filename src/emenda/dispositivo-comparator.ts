import { Dispositivo } from '../model/dispositivo/dispositivo';
import { TipoDispositivo } from '../model/lexml/tipo/tipoDispositivo';

export class DispositivoComparator {
  static compare(d1: Dispositivo, d2: Dispositivo): number {
    if (!d1 || !d2) {
      throw new Error('Tentativa de comparação de dispositivo nulo.');
    }

    if (!d1.pai) {
      return -1;
    }

    if (!d2.pai) {
      return 1;
    }

    return this.comparaIndices(this.getIndices(d1), this.getIndices(d2));
  }

  private static getIndices(d: Dispositivo): number[] {
    const indices: number[] = [];

    let pai = d.pai;
    while (pai) {
      indices.push(this.getIndexDoFilho(pai, d));
      d = pai;
      pai = d.pai;
    }
    indices.reverse();

    return indices;
  }

  private static getIndexDoFilho(pai: Dispositivo, d: Dispositivo): number {
    if (d.tipo === TipoDispositivo.caput.tipo) {
      return -1;
    }
    return pai.filhos.indexOf(d);
  }

  private static comparaIndices(indices1: number[], indices2: number[]): number {
    let ret = 0;
    const size1 = indices1.length;
    const size2 = indices2.length;
    for (let i = 0; i < size1 && i < size2 && ret === 0; i++) {
      ret = indices1[i] - indices2[i];
    }
    if (ret === 0) {
      ret = size1 - size2;
    }
    return ret;
  }
}
