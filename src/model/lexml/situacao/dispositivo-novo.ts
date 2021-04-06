import { NomeSituacao, Situacao } from '../../dispositivo/situacao';

export function DispositivoNovo<TBase extends Constructor>(Base: TBase): any {
  return class extends Base implements Situacao {
    tipoSituacao = NomeSituacao.DispositivoNovo;
  };
}
