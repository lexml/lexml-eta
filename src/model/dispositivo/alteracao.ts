import { Articulacao, Dispositivo } from './dispositivo';

export interface Alteracao {
  blocoAlteracao?: Articulacao;

  dispositivosAlteracao?: Dispositivo[];
}
