import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAgrupadorGenerico, isDispositivoGenerico, isOmissis } from '../../dispositivo/tipo';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';
import { buscaProximoOmissis, getDispositivoAnterior, getDispositivoPosterior, getDispositivoPosteriorMesmoTipo, getUltimoFilho, isDispositivoAlteracao } from './hierarquiaUtil';

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
    (getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1' || getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1u') &&
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
    !isOmissis(dispositivo) &&
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
  if (
    dispositivo !== null &&
    isOmissis(dispositivo) &&
    getDispositivoAnterior(dispositivo) !== undefined &&
    isOmissis(getUltimoFilho(getDispositivoAnterior(dispositivo)!) || isOmissis(getDispositivoAnterior(dispositivo)!))
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'Não pode haver mais de um omissis sequencialmente',
    });
  }

  if (
    (dispositivo !== null && isOmissis(dispositivo) && getDispositivoPosterior(dispositivo) && isOmissis(getDispositivoPosterior(dispositivo)!)) ||
    buscaProximoOmissis(dispositivo.pai!)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_SEQUENCIAIS,
      fix: true,
    });
  }

  return mensagens;
};
