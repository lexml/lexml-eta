import { Articulacao } from './dispositivo';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Alteracoes extends Articulacao {
  base?: string;
}

export interface BlocoAlteracao {
  alteracoes?: Alteracoes;

  hasAlteracao(): boolean;
}
