import { Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupadorGenerico, isCaput, isDispositivoGenerico, isOmissis } from '../../dispositivo/tipo';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';
import {
  getDispositivoAnterior,
  getDispositivoPosterior,
  getDispositivoPosteriorMesmoTipo,
  getDispositivoPosteriorMesmoTipoInclusiveOmissis,
  getUltimoFilho,
  isDispositivoAlteracao,
  isDispositivosSequenciaisMesmoPai,
} from './hierarquiaUtil';

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
    !dispositivo.existeNaNormaAlterada &&
    (getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1' || getDispositivoPosteriorMesmoTipo(dispositivo)?.numero === '1u') &&
    getDispositivoPosteriorMesmoTipo(dispositivo)?.existeNaNormaAlterada
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
      descricao: 'Não pode haver mais de uma linha pontilhada sequencialmente',
    });
  }

  if (
    dispositivo !== null &&
    dispositivo.pai! &&
    isOmissis(dispositivo) &&
    isCaput(dispositivo.pai!) &&
    getDispositivoPosterior(dispositivo) === undefined &&
    TipoDispositivo.omissis.tipo === dispositivo.pai!.pai!.filhos.filter(f => !isCaput(f.pai!))[0]?.tipo
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_SEQUENCIAIS,
      fix: true,
    });
  }
  if (
    dispositivo !== null &&
    isOmissis(dispositivo) &&
    dispositivo.pai! &&
    !getDispositivoPosterior(dispositivo) &&
    dispositivo.pai &&
    getDispositivoPosterior(isCaput(dispositivo.pai) ? dispositivo.pai.pai! : dispositivo.pai) !== undefined &&
    isOmissis(getDispositivoPosterior(isCaput(dispositivo.pai) ? dispositivo.pai.pai! : dispositivo.pai)!)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_SEQUENCIAIS,
      fix: true,
    });
  }

  if (
    dispositivo !== null &&
    isOmissis(dispositivo) &&
    dispositivo.pai &&
    getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo) !== undefined &&
    isOmissis(getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo)!) &&
    isDispositivosSequenciaisMesmoPai(dispositivo, getDispositivoPosteriorMesmoTipoInclusiveOmissis(dispositivo)!)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.OMISSIS_SEQUENCIAIS,
      fix: true,
    });
  }

  return mensagens;
};
