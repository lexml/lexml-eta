import { Dispositivo } from './dispositivo';
import { Hierarquia } from './hierarquia';

export interface Alteracao extends Hierarquia {
  dispositivos: Dispositivo[];

  hasDispositivos(): boolean;
}

export interface BlocoAlteracao {
  alteracoes?: Alteracao[];

  addAlteracao(alteracao: Alteracao): void;
  hasAlteracao(): boolean;
}
