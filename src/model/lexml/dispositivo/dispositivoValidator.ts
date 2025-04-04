import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao } from '../../dispositivo/tipo';
import { validaTexto } from '../conteudo/conteudoValidator';
import { validaUrn } from '../documento/urnUtil';
import { isOriginal, isSuprimido } from '../hierarquia/hierarquiaUtil';
import { validaHierarquia } from '../hierarquia/hierarquiaValidator';
import { validaNumeracao } from '../numeracao/numeracaoValidator';
import { isBloqueado } from '../regras/regrasUtil';
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
  if ((isArticulacao(dispositivo) && dispositivo.pai === undefined) || (isOriginal(dispositivo) && !isBloqueado(dispositivo)) || isSuprimido(dispositivo)) {
    return [];
  }
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo), validaReferencia(dispositivo));
};
