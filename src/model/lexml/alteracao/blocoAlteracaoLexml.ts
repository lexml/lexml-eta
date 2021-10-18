import { Alteracoes, BlocoAlteracao } from '../../dispositivo/alteracao';

export function BlocoAlteracaoNaoPermitido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements BlocoAlteracao {
    get alteracoes(): Alteracoes | undefined {
      return undefined;
    }
    hasAlteracao(): boolean {
      return false;
    }
  };
}

export function BlocoAlteracaoPermitido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements BlocoAlteracao {
    alteracoes?: Alteracoes;

    hasAlteracao(): boolean {
      return this.alteracoes ? this.alteracoes.filhos?.length > 0 : false;
    }
  };
}
