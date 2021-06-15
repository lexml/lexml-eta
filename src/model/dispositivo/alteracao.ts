import { Articulacao } from './dispositivo';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Alteracoes extends Articulacao {}

export interface BlocoAlteracao {
  alteracoes?: Alteracoes;

  hasAlteracao(): boolean;
}
