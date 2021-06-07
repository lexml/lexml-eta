import { Articulacao } from './dispositivo';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Alteracao extends Articulacao {}

export interface BlocoAlteracao {
  alteracoes?: Alteracao[];

  addAlteracao(alteracao: Alteracao): void;
  hasAlteracao(): boolean;
}
