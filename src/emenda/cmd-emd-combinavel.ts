import { Dispositivo } from '../model/dispositivo/dispositivo';
import { NomeComGenero } from '../model/dispositivo/genero';
import { DispositivoComparator } from './dispositivo-comparator';

/**
 * Representa um comando de emenda que pode ser combinado com outros.
 */
export abstract class CmdEmdCombinavel {
  constructor(protected dispositivos: Dispositivo[]) {}

  abstract getTexto(refGenericaProjeto: NomeComGenero, isPrimeiro: boolean, isUltimo: boolean): string;

  static compare(c1: CmdEmdCombinavel, c2: CmdEmdCombinavel): number {
    if (!c1.dispositivos?.length) {
      return 1;
    }
    if (!c2.dispositivos?.length) {
      return -1;
    }
    return DispositivoComparator.compare(c1.dispositivos[0], c2.dispositivos[0]);
  }
}
