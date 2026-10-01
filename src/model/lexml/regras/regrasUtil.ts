import { Dispositivo } from '../../dispositivo/dispositivo';
import { ElementoAction } from '../acao';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../acao/informarExistenciaDoElementoNaNormaAction';
import { getDispositivoAnterior, getDispositivoPosterior, isDispositivoAlteracao } from '../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';

// Sem valor definido — caso dos documentos carregados —, o usuário precisa poder escolher qualquer um dos dois.
export const adicionaAcoesDeExistenciaNaNorma = (dispositivo: Dispositivo, acoes: ElementoAction[]): void => {
  if (!isDispositivoAlteracao(dispositivo)) {
    return;
  }

  if (dispositivo.existeNaNormaAlterada === undefined) {
    acoes.push(considerarElementoNovoNaNorma, considerarElementoExistenteNaNorma);
  } else {
    acoes.push(dispositivo.existeNaNormaAlterada ? considerarElementoNovoNaNorma : considerarElementoExistenteNaNorma);
  }
};

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

export enum MotivosOperacaoNaoPermitida {
  AGRUPADOR = 'Não é possível mover agrupadores de artigo.',
  PROXIMO_DIFERENTE_PARAGRAFO = 'O próximo dispositivo não é um parágrafo.',
  PROXIMO_DIFERENTE_ARTIGO_ALTERACAO_NORMA = 'O tipo do próximo dispositivo não corresponde ao tipo do dispositivo atual (alteração de norma).',
  PROXIMO_DIFERENTE_ALINEA = 'O próximo dispositivo não é uma alínea.',
  PROXIMO_DIFERENTE_INCISO = 'O próximo dispositivo não é um inciso.',
}

export const isBloqueado = (dispositivo: Dispositivo): boolean => {
  return dispositivo.bloqueado !== undefined ? dispositivo.bloqueado : false;
};

export const existeFilhoDesbloqueado = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos.some(f => !f.bloqueado);
};
