import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAgrupadorGenerico, isDispositivoGenerico } from '../../dispositivo/tipo';
import { Mensagem, TipoMensagem } from '../util/mensagem';
import { getDispositivoPosteriorMesmoTipo, isDispositivoAlteracao } from './hierarquiaUtil';

export const validaHierarquia = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (dispositivo === null) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O dispositivo não foi informado',
    });
  }
  if (dispositivo !== null && dispositivo.filhos.length > 0 && dispositivo.tiposPermitidosFilhos!.length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Segundo a Legislação vigente, ${dispositivo.descricao} não poderia possuir filhos`,
    });
  }
  if (
    dispositivo !== null &&
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
    getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1' &&
    getDispositivoPosteriorMesmoTipo(dispositivo)?.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não é permitido um dispositivo de alteração da norma antes do primeiro dispositivo`,
    });
  }
  if (dispositivo !== null && (isDispositivoGenerico(dispositivo) || isAgrupadorGenerico(dispositivo))) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi possível validar a natureza deste dispositivo com base na legislação vigente`,
    });
  }
  if (
    dispositivo !== null &&
    dispositivo.pai &&
    !isAgrupadorGenerico(dispositivo.pai) &&
    !isDispositivoGenerico(dispositivo) &&
    !dispositivo.tiposPermitidosPai!.includes(dispositivo.pai.tipo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Segundo a Legislação vigente, ${dispositivo.descricao} somente poderia pertencer a ${dispositivo.tiposPermitidosPai!.join(', ')}`,
    });
  }
  if (
    dispositivo !== null &&
    !isDispositivoGenerico &&
    dispositivo.filhos.length > 0 &&
    (dispositivo.tiposPermitidosFilhos!.length === 0 || dispositivo.filhos.filter(filho => !dispositivo.tiposPermitidosFilhos!.includes(filho.tipo)).length > 0)
  ) {
    const relacaoFilhos =
      dispositivo.tiposPermitidosFilhos!.length === 0 ? 'não poderia possuir filhos' : `somente poderia possuir ${dispositivo.tiposPermitidosFilhos!.join(', ')}`;
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Segundo a Legislação vigente, ${dispositivo.descricao} ${relacaoFilhos}`,
    });
  }
  return mensagens;
};
