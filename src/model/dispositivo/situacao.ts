export interface Situacao {
  tipoSituacao: string;
}

export enum NomeSituacao {
  DispositivoNovo = 'DispositivoNovo',
  DispositivoExistente = 'DispositivoExistente',
}
