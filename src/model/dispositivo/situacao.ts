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

export const isSituacaoExclusivaDispositivoEmenda = (dispositivo: Dispositivo): boolean => {
  return [DescricaoSituacao.DISPOSITIVO_ADICIONADO.toString(), DescricaoSituacao.DISPOSITIVO_MODIFICADO.toString(), DescricaoSituacao.DISPOSITIVO_SUPRIMIDO.toString()].includes(
    dispositivo.situacao.descricaoSituacao
  );
};

export const isDispositivoEmenda = (dispositivo: Dispositivo): boolean => {
  if (isSituacaoExclusivaDispositivoEmenda(dispositivo)) {
    return true;
  }

  if (dispositivo.pai === undefined) {
    return false;
  }

  return isDispositivoEmenda(dispositivo.pai!);
};
