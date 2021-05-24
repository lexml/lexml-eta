import { Referencia } from '../elemento';
import { Alteracao } from './alteracao';
import { DispositivoAlteracao } from './dispositivo-alteracao';

export interface BlocoAlteracao {
  alteracoes: Alteracao[];
  addAlteracao(alteracao: Alteracao): void;
  addDispositivo(referencia: Referencia, dispositivo: DispositivoAlteracao): void;
  getDispositivo(uuid: number): DispositivoAlteracao | undefined;
  getDispositivoAnterior(dispositivo: DispositivoAlteracao): DispositivoAlteracao | undefined;
  hasAlteracoes(): boolean;
  hasDispositivoAlteracao(): boolean;
  indexOf(dispositivo: DispositivoAlteracao): number;
  removeAlteracao(alteracao: Alteracao): void;
}
