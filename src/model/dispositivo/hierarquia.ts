import { Dispositivo } from './dispositivo';

export interface Hierarquia {
  pai?: Dispositivo;
  filhos: Dispositivo[];

  addFilho(filho: Dispositivo, referencia?: Dispositivo): void;

  addFilhoOnPosition(filho: Dispositivo, posicao: number): void;

  isLastFilho(filho: Dispositivo): boolean;

  indexOf(filho: Dispositivo): number;

  removeFilho(filho: Dispositivo): void;

  renumeraFilhos(): void;
}
