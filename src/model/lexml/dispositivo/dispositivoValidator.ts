import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isArticulacao } from '../../dispositivo/tipo';
import { validaTexto } from '../conteudo/conteudoValidator';
import { validaUrn } from '../documento/urnUtil';
import { isOriginal } from '../hierarquia/hierarquiaUtil';
import { validaHierarquia } from '../hierarquia/hierarquiaValidator';
import { validaNumeracao } from '../numeracao/numeracaoValidator';
import { Mensagem, TipoMensagem } from '../util/mensagem';

const validaReferencia = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];

  if (!dispositivo.alteracoes || !dispositivo.alteracoes.base) {
    return [];
  }

  if (!validaUrn(dispositivo.alteracoes.base)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informada uma norma alterada válida`,
    });
  }

  return mensagens;
};

export const validaDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  if (
    (isArticulacao(dispositivo) && dispositivo.pai === undefined) ||
    isOriginal(dispositivo) ||
    dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO
  ) {
    return [];
  }
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo), validaReferencia(dispositivo));
};
