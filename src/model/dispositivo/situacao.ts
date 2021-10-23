import { Elemento } from '../elemento';
import { Dispositivo } from './dispositivo';

export interface Situacao {
  situacao: TipoSituacao;
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[];
}

export interface TipoSituacao {
  descricaoSituacao: string;
  dispositivoOriginal?: Partial<Elemento>;
}

export enum DescricaoSituacao {
  DISPOSITIVO_ADICIONADO = 'Dispositivo Adicionado',
  DISPOSITIVO_NOVO = 'Dispositivo Novo',
  DISPOSITIVO_MODIFICADO = 'Dispositivo Modificado',
  DISPOSITIVO_ORIGINAL = 'Dispositivo Original',
  DISPOSITIVO_SUPRIMIDO = 'Dispositivo Suprimido',
}
