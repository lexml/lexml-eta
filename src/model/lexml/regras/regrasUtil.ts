import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { ElementoAction } from '../acao';
import { getDispositivoAnterior, getDispositivoPosterior, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

export const podeConverterEmOmissis = (dispositivo: Dispositivo): boolean => {
  return (
    isDispositivoAlteracao(dispositivo.pai!) &&
    dispositivo.filhos.length === 0 &&
    dispositivo.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoAnterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name &&
    getDispositivoPosterior(dispositivo)?.tipo !== TipoDispositivo.omissis.name
  );
};

export const removeAcaoExclusaoDispositivo = (acoes: any[]): void => {
  const i: number = acoes.findIndex((acao: ElementoAction) => acao.descricao === 'Remover dispositivo');
  if (i > -1) {
    acoes = acoes.slice(i, 1);
  }
};

export const hasApenasDispositivosIrmaosNovos = (dispositivo: Dispositivo): boolean => {
  return dispositivo.pai!.filhos?.filter(f => f.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO).length === 0;
};

export enum MotivosOperacaoNaoPermitida {
  AGRUPADOR = 'Não é possível mover agrupadores de artigo.',
  ORIGINAL = 'Não é possível mover um dispositivo original.',
  PROXIMO_DIFERENTE_PARAGRAFO = 'O próximo dispositivo não é um parágrafo.',
  PROXIMO_DIFERENTE_ARTIGO_ALTERACAO_NORMA = 'O tipo do próximo dispositivo não corresponde ao tipo do dispositivo atual (alteração de norma).',
  PROXIMO_DIFERENTE_ALINEA = 'O próximo dispositivo não é uma alínea.',
  PROXIMO_DIFERENTE_INCISO = 'O próximo dispositivo não é um inciso.',
}
