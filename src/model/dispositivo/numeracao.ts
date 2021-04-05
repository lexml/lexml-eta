import { Dispositivo } from './dispositivo';

export interface Numeracao {
  id?: string;
  numero?: string;
  rotulo?: string;

  createRotulo(dispositivo?: Dispositivo): void;
}
