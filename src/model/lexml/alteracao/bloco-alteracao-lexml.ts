/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alteracao } from '../../alteracao/alteracao';
import { BlocoAlteracao } from '../../alteracao/bloco-alteracao';
import { DispositivoAlteracao } from '../../alteracao/dispositivo-alteracao';
import { Referencia } from '../../elemento';

export class BlocoAlteracaoLexml implements BlocoAlteracao {
  _alteracoes?: Alteracao[];

  get alteracoes(): Alteracao[] {
    this._alteracoes = this._alteracoes ?? [];
    return this._alteracoes;
  }

  addAlteracao(alteracao: Alteracao): void {
    this.alteracoes.push(alteracao);
  }

  addDispositivo(referencia: Referencia, dispositivo: DispositivoAlteracao): void {
    (this.getAlteracaoByUuidDispositivoAlteracao(referencia.uuid!) ?? this.alteracoes[0]).addDispositivoAlteracao(dispositivo);
  }

  private getAlteracaoByUuidDispositivoAlteracao(uuid: number): Alteracao {
    return this.alteracoes.filter(alteracao => alteracao.contains(uuid))[0];
  }

  getDispositivo(uuid: number): DispositivoAlteracao | undefined {
    const alteracao = this.alteracoes.filter(alteracao => alteracao.contains(uuid))[0];
    return alteracao?.getDispositivo(uuid);
  }

  getDispositivoAnterior(dispositivo: DispositivoAlteracao): DispositivoAlteracao | undefined {
    return this.alteracoes.map(alteracao => alteracao.getDispositivoAnterior(dispositivo)).filter(d => d)[0];
  }

  hasAlteracoes(): boolean {
    return this.alteracoes.length > 0;
  }

  hasDispositivoAlteracao(): boolean {
    const a = this.alteracoes[this.alteracoes.length - 1];
    return a && a!.dispositivosAlteracao ? a!.dispositivosAlteracao.length > 0 : false;
  }

  indexOf(dispositivo: DispositivoAlteracao): number {
    return this.alteracoes.map(alteracao => alteracao.indexOf(dispositivo)).filter(num => num >= 0)[0];
  }

  removeAlteracao(alteracao: Alteracao): void {
    this._alteracoes = this.alteracoes.filter((a: Alteracao) => a !== alteracao);
  }
}
