import { Dispositivo } from '../../dispositivo/dispositivo';
import { isArticulacao } from '../../dispositivo/tipo';
import { validaTexto } from '../conteudo/conteudoValidator';
import { getTextoSemHtml } from '../../../util/string-util';
import { validaUrn } from '../documento/urnUtil';
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

// Só avisa: título vazio ou iniciado em minúscula não bloqueia a edição.
export const validaTitulo = (dispositivo: Dispositivo): Mensagem[] => {
  if (dispositivo.tituloDispositivo === undefined) {
    return [];
  }

  const nome = `${dispositivo.artigoDefinido} ${dispositivo.descricao?.toLowerCase()}`;
  const texto = getTextoSemHtml(dispositivo.tituloDispositivo.replace(/&nbsp;/g, ' '));

  if (texto === '') {
    return [{ tipo: TipoMensagem.WARNING, descricao: `Não foi informado um texto para o título d${nome}.` }];
  }

  const primeiro = texto.match(/[\p{L}\p{N}]/u)?.[0];
  if (primeiro && primeiro !== primeiro.toUpperCase()) {
    return [{ tipo: TipoMensagem.WARNING, descricao: `O título d${nome} deveria iniciar com letra maiúscula.` }];
  }

  return [];
};

export const validaDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  if (isArticulacao(dispositivo) && dispositivo.pai === undefined) {
    return [];
  }
  return validaHierarquia(dispositivo).concat(validaTexto(dispositivo), validaNumeracao(dispositivo), validaReferencia(dispositivo), validaTitulo(dispositivo));
};
