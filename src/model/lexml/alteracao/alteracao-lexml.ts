import { Alteracao } from '../../alteracao/alteracao';
import { DispositivoAlteracao } from '../../alteracao/dispositivo-alteracao';

export class AlteracaoLexml implements Alteracao {
  _dispositivosAlteracao?: DispositivoAlteracao[];

  get dispositivosAlteracao(): DispositivoAlteracao[] {
    this._dispositivosAlteracao = this._dispositivosAlteracao ?? [];
    return this._dispositivosAlteracao;
  }
  addDispositivoAlteracao(dispositivo: DispositivoAlteracao): void {
    this.dispositivosAlteracao?.push(dispositivo);
  }
  addDispositivoAlteracaoOnPosition(dispositivo: DispositivoAlteracao, posicao: number): void {
    this.dispositivosAlteracao?.splice(posicao, 0, dispositivo);
  }
  getDispositivo(uuid: number): DispositivoAlteracao | undefined {
    return this.dispositivosAlteracao?.filter(d => d.uuid === uuid)[0];
  }
  getDispositivoAnterior(dispositivo: DispositivoAlteracao): DispositivoAlteracao | undefined {
    const index = this.indexOf(dispositivo);
    return index > 0 ? this.dispositivosAlteracao[index - 1] : undefined;
  }
  hasDispositivos(): boolean {
    return this.dispositivosAlteracao.length > 0;
  }
  removeDispositivoAlteracao(dispositivo: DispositivoAlteracao): void {
    this.dispositivosAlteracao?.filter(d => d !== dispositivo);
  }
  indexOf(dispositivo: DispositivoAlteracao): number {
    return this.dispositivosAlteracao.indexOf(dispositivo);
  }
  contains(uuid: number): boolean {
    return this.dispositivosAlteracao.filter(d => d.uuid === uuid).length > 0;
  }
}
