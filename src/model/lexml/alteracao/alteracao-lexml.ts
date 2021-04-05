import { Alteracao } from '../../dispositivo/alteracao';
import { Dispositivo } from '../../dispositivo/dispositivo';

export function AlteracaoNaoPermitidaLexml<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Alteracao {
    get dispositivosAlteracao(): Dispositivo[] {
      return [];
    }

    hasAlteracao(): boolean {
      return false;
    }

    hasDispositivosAlterados(): boolean {
      return false;
    }
  };
}
