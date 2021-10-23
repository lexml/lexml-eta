import { Dispositivo } from '../../dispositivo/dispositivo';
import { Situacao } from '../../dispositivo/situacao';
import { DispositivoNovo } from './dispositivoNovo';

export function SituacaoDispositivo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Situacao {
    situacao = new DispositivoNovo();

    getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
      return this.situacao?.getAcoesPermitidas(dispositivo, acoes);
    }
  };
}
