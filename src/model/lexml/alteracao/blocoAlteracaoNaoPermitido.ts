import type { Constructor } from '../util/mixin';
import { Alteracoes, BlocoAlteracao } from '../../dispositivo/blocoAlteracao';

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
