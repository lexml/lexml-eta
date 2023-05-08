import { Dispositivo } from '../../dispositivo/dispositivo';
import { TransformarElemento } from './transformarElementoAction';
import { retornaEstadoAtualComMensagem } from '../../../redux/elemento/util/stateReducerUtil';
import { State } from '../../../redux/state';
import { TipoMensagem } from '../util/mensagem';
import { MotivosOperacaoNaoPermitida } from '../regras/regrasUtil';

export const normalizaNomeAcaoTransformacao = (dispositivo: Dispositivo, tipo: string): any => {
  let t: string;

  if (tipo.endsWith('EmOmissis')) {
    const tipoDispositivo = tipo.replace('transformar', '').replace('EmOmissis', '');
    t = 'transformar' + tipoDispositivo + 'EmOmissis' + tipoDispositivo;
  } else {
    t = tipo;
  }

  const acoes: any = dispositivo
    .getAcoesPossiveis(dispositivo)
    .filter(a => a instanceof TransformarElemento)
    .filter((a: any) => a.nomeAcao === tipo || a.nomeAcao.replaceAll('IncisoCaput', 'Inciso').replaceAll('IncisoParagrafo', 'Inciso') === t);

  return acoes[0]?.nomeAcao;
};

export const isAcaoPermitida = (dispositivo: Dispositivo, tipo: any): boolean => {
  return dispositivo.getAcoesPossiveis(dispositivo).filter(a => a instanceof tipo).length > 0;
};

export const isAcaoTransformacaoPermitida = (dispositivo: Dispositivo, action: any): boolean => {
  const nomeAcao = normalizaNomeAcaoTransformacao(dispositivo, action.subType);
  return dispositivo.getAcoesPossiveis(dispositivo).filter(a => a instanceof TransformarElemento && a.nomeAcao && a.nomeAcao === nomeAcao).length > 0;
};

export const montaEMostraMensagensErro = (dispositivo: Dispositivo, state: any): State => {
  if (dispositivo.situacao.descricaoSituacao === 'Dispositivo Original') {
    verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida(dispositivo, MotivosOperacaoNaoPermitida.ORIGINAL);
  }
  return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.ERROR, descricao: 'Operação não permitida. <br>' + buildMessages(dispositivo.motivosOperacaoNaoPermitida!) });
};

export const buildMessages = (mensagens: string[]): string => (mensagens !== undefined ? mensagens.join('<br>') : '');

export const verificaExistenciaEAdicionaMotivoOperacaoNaoPermitida = (dispositivo: Dispositivo, motivo: string) => {
  if (dispositivo.motivosOperacaoNaoPermitida !== undefined) {
    if (!dispositivo.motivosOperacaoNaoPermitida.includes(motivo)) {
      dispositivo.motivosOperacaoNaoPermitida.push(motivo);
    }
  } else {
    dispositivo.motivosOperacaoNaoPermitida = [];
    dispositivo.motivosOperacaoNaoPermitida.push(motivo);
  }
};
