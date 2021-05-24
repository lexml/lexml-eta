import { DispositivoAlteracao as DispositivoAlteracao } from './dispositivo-alteracao';

export interface Alteracao {
  dispositivosAlteracao?: DispositivoAlteracao[];

  addDispositivoAlteracao(dispositivo: DispositivoAlteracao): void;
  addDispositivoAlteracaoOnPosition(dispositivo: DispositivoAlteracao, posicao: number): void;
  contains(uuid: number): boolean;
  getDispositivo(uuid: number): DispositivoAlteracao | undefined;
  getDispositivoAnterior(dispositivo: DispositivoAlteracao): DispositivoAlteracao | undefined;
  hasDispositivos(): boolean;
  indexOf(dispositivo: DispositivoAlteracao): number;
  removeDispositivoAlteracao(dispositivo: DispositivoAlteracao): void;
}
