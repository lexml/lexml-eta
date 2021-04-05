import { NomeSituacao, Situacao } from '../../dispositivo/situacao';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function DispositivoNovo<TBase extends Constructor>(Base: TBase) {
  return class extends Base implements Situacao {
    tipoSituacao = NomeSituacao.DispositivoNovo;
  };
}
