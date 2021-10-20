import { Alteracoes, BlocoAlteracao } from '../../dispositivo/blocoAlteracao';

export function BlocoAlteracaoPermitido<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements BlocoAlteracao {
    alteracoes?: Alteracoes;

    hasAlteracao(): boolean {
      return this.alteracoes ? this.alteracoes.filhos?.length > 0 : false;
    }
  };
}
