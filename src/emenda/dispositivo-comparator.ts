import { Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { isArtigo, isCaput, isParagrafo } from './../model/dispositivo/tipo';
import { isArticulacaoAlteracao } from './../model/lexml/hierarquia/hierarquiaUtil';

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

    const i1 = DispositivoComparator.getIndices(d1);
    const i2 = DispositivoComparator.getIndices(d2);
    return DispositivoComparator.comparaIndices(i1, i2);
  }

  private static getIndices(d: Dispositivo): number[] {
    const indices: number[] = [];

    // Considera alteração como filha do caput
    let pai = this.getPaiParaComparacao(d);
    while (pai) {
      indices.push(this.getIndexDoFilho(pai, d));
      d = pai;
      pai = this.getPaiParaComparacao(d);
    }
    indices.reverse();

    return indices;
  }

  // Considera alteração em artigo como filha do caput
  private static getPaiParaComparacao(d: Dispositivo): Dispositivo | undefined {
    if (!d.pai) {
      return undefined;
    }
    if (isArtigo(d.pai!) && isArticulacaoAlteracao(d)) {
      return (d.pai! as Artigo).caput!;
    }
    return d.pai!;
  }

  private static getIndexDoFilho(pai: Dispositivo, d: Dispositivo): number {
    if (isCaput(d)) {
      return 0;
    }
    if (isParagrafo(d)) {
      // Após o caput
      return pai.filhos.indexOf(d) + 1;
    }
    if (isArticulacaoAlteracao(d)) {
      // Antes dos filhos
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
