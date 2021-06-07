import { Alteracao, BlocoAlteracao } from '../../dispositivo/alteracao';

export function BlocoAlteracaoNaoPermitido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements BlocoAlteracao {
    private _alteracoes: Alteracao[] = [];

    get alteracoes(): Alteracao[] {
      this._alteracoes = this._alteracoes ?? [];
      return this._alteracoes;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addAlteracao(alteracao: Alteracao): void {
      throw Error('Não é permitido fazer alterações neste dispositivo');
    }

    hasAlteracao(): boolean {
      return false;
    }
  };
}

export function BlocoAlteracaoPermitido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements BlocoAlteracao {
    private _alteracoes: Alteracao[] = [];

    get alteracoes(): Alteracao[] {
      this._alteracoes = this._alteracoes ?? [];
      return this._alteracoes;
    }

    addAlteracao(alteracao: Alteracao): void {
      this.alteracoes?.push(alteracao);
    }

    hasAlteracao(): boolean {
      return this.alteracoes?.length > 0;
    }
  };
}
