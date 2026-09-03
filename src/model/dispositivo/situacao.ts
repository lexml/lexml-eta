import { Dispositivo } from './dispositivo';

export interface Situacao {
  situacao: TipoSituacao;
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[];
}

export interface TipoSituacao {
  descricaoSituacao: string;
}

export enum DescricaoSituacao {
  DISPOSITIVO_ADICIONADO = 'Dispositivo Adicionado',
  DISPOSITIVO_NOVO = 'Dispositivo Novo',
}
