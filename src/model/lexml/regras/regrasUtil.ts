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
