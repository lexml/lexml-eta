import { Elemento } from '../elemento';
import { TipoDispositivo } from '../lexml/tipo/tipoDispositivo';
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

export enum SituacaoNormaVigente {
  DISPOSITIVO_EXISTENTE = 'DE',
  DISPOSITIVO_NOVO = 'DN',
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

export const isAlteracaoIntegral = (dispositivo: Dispositivo): boolean => {
  if (dispositivo.tipo !== TipoDispositivo.artigo.tipo && dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
    return false;
  }
  if (dispositivo.filhos.length) {
    for (const filho of dispositivo.filhos) {
      if (!isAlteracaoIntegral(filho)) {
        return false;
      }
    }
    return true;
  }
  if (dispositivo.tipo === TipoDispositivo.caput.tipo && dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO) {
    return true;
  }
  return false;
};
