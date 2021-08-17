import { hasIndicativoFimAlteracao, hasIndicativoInicioAlteracao, isDispositivoAlteracao } from '../../../redux/elemento-reducer-util';
import { containsTags, converteIndicadorParaTexto, endsWithPunctuation, getLastCharacter, isValidHTML } from '../../../util/string-util';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { TEXTO_OMISSIS } from '../../dispositivo/omissis';
import { isAgrupador, isArtigo, isDispositivoDeArtigo, isParagrafo } from '../../dispositivo/tipo';
import {
  getDispositivoCabecaAlteracao,
  hasFilhoGenerico,
  hasFilhos,
  isLastMesmoTipo,
  isPenultimoMesmoTipo,
  isUltimaAlteracao,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquia-util';
import { Mensagem, TipoMensagem } from '../util/mensagem';
import { hasIndicativoContinuacaoSequencia, hasIndicativoDesdobramento, hasIndicativoFinalSequencia, TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO } from './conteudo-util';

export const validaTextoAgrupador = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (!dispositivo.texto || dispositivo.texto.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'Não foi informado um texto para o dispositivo',
    });
  }
  if (dispositivo.texto && endsWithPunctuation(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'Não pode haver sinal de pontuação ao final do texto',
    });
  }
  if (containsTags(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O conteúdo do dispositivo não pode possuir formatação',
    });
  }
  return mensagens;
};

export const validaTextoDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (!dispositivo.texto || dispositivo.texto.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informado um texto para ${dispositivo.pronome + dispositivo.descricao!}`,
    });
  }
  if (dispositivo.texto && !isValidHTML(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O conteúdo do dispositivo não é um HTML válido',
    });
  }
  if (dispositivo.texto && dispositivo.texto.trim().length > 300) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `Pelo princípio da concisão, o texto dos dispositivos não deve ser extenso, devendo ser utilizadas frases curtas e concisas`,
    });
  }
  if (
    dispositivo.texto &&
    !isAgrupador(dispositivo) &&
    ((!isArtigo(dispositivo) && hasFilhos(dispositivo)) || (isArtigo(dispositivo) && hasFilhos((dispositivo as Artigo).caput!))) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }
  if (
    dispositivo.texto &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    (isUnicoMesmoTipo(dispositivo) || isLastMesmoTipo(dispositivo)) &&
    !hasFilhoGenerico(dispositivo.pai!) &&
    !hasFilhos(dispositivo) &&
    !hasIndicativoFinalSequencia(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Último dispositivo de uma sequência deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_FIM_SEQUENCIA!)}`,
    });
  }
  if (
    dispositivo.texto &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isUnicoMesmoTipo(dispositivo) &&
    isPenultimoMesmoTipo(dispositivo) &&
    !hasFilhos(dispositivo) &&
    !hasIndicativoContinuacaoSequencia(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com uma das seguintes possibilidades: ${dispositivo.INDICADOR_SEQUENCIA!.join('     ')}`,
    });
  }

  if (
    dispositivo.texto &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isUnicoMesmoTipo(dispositivo) &&
    !isLastMesmoTipo(dispositivo) &&
    !isPenultimoMesmoTipo(dispositivo) &&
    !hasFilhos(dispositivo) &&
    dispositivo.INDICADOR_SEQUENCIA !== undefined &&
    getLastCharacter(dispositivo.texto) !== dispositivo.INDICADOR_SEQUENCIA[0]
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}. ${
        hasIndicativoContinuacaoSequencia(dispositivo) ? 'A variação informada só é permitida para o penúltimo elemento' : ''
      }`,
    });
  }
  if (dispositivo.texto && isDispositivoDeArtigo(dispositivo) && !isParagrafo(dispositivo) && /^[A-ZÀ-Ú]/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `${dispositivo.descricao} deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio`,
    });
  }
  if (
    dispositivo.texto &&
    (isArtigo(dispositivo) || isParagrafo(dispositivo)) &&
    !hasFilhos(dispositivo) &&
    !dispositivo.hasAlteracao() &&
    !hasIndicativoContinuacaoSequencia(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}`,
    });
  }
  if (dispositivo.texto && isArtigo(dispositivo) && dispositivo.hasAlteracao() && !hasIndicativoDesdobramento(dispositivo) && !hasIndicativoInicioAlteracao(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }
  /*   if (dispositivo.texto && isArtigo(dispositivo) && dispositivo.hasAlteracao() && !hasIndicativoInicioAlteracao(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `${dispositivo.descricao} que possua bloco de alteração deveria informar isso explicitamente (ex: ...passa a vigorar com a seguinte alteração:)`,
    });
  } */
  if (
    dispositivo.texto &&
    isArtigo(dispositivo) &&
    !dispositivo.hasAlteracao() &&
    hasFilhos(dispositivo) &&
    !hasFilhos((dispositivo as Artigo).caput!) &&
    hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}`,
    });
  }
  if (dispositivo.texto && (isArtigo(dispositivo) || isParagrafo(dispositivo)) && !/^[A-ZÀ-Ú]/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria iniciar com letra maiúscula`,
    });
  }

  return mensagens;
};

export const validaTextoDispositivoAlteracao = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (!dispositivo.texto || dispositivo.texto.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informado um texto para ${dispositivo.pronome + dispositivo.descricao!}`,
    });
  }
  if (dispositivo.texto && dispositivo.texto.trim().length > 300) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `Pelo princípio da concisão, o texto dos dispositivos não deve ser extenso, devendo ser utilizadas frases curtas e concisas`,
    });
  }
  if (dispositivo.texto && isDispositivoDeArtigo(dispositivo) && !isParagrafo(dispositivo) && !/[\\.]+/.test(dispositivo.texto) && /^[A-ZÀ-Ú]/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `${dispositivo.descricao} deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio`,
    });
  }
  if (dispositivo.texto && (isArtigo(dispositivo) || isParagrafo(dispositivo)) && !/[\\.]+/.test(dispositivo.texto) && !/^[A-ZÀ-Ú]/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria iniciar com letra maiúscula`,
    });
  }
  if (isUltimaAlteracao(dispositivo) && (!dispositivo.texto || !hasIndicativoFimAlteracao(dispositivo.texto))) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `O último dispositivo do bloco de alteração deve terminar com &#8221; (NR)`,
    });
  }
  if (dispositivo.texto && !isUltimaAlteracao(dispositivo) && /["”“].*/.test(dispositivo.texto) && !/”.*(NR)/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Somente o último dispositivo do bloco de alteração poderia ser finalizado com aspas`,
    });
  }
  if (dispositivo.texto && !isUltimaAlteracao(dispositivo) && /”.*(NR)/.test(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Somente o último dispositivo do bloco de alteração pode terminar com &#8221; (NR)`,
    });
  }
  if (
    dispositivo.texto &&
    dispositivo === getDispositivoCabecaAlteracao(dispositivo) &&
    dispositivo.filhos.length === 0 &&
    (dispositivo.texto === TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO || dispositivo.texto === TEXTO_OMISSIS)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informada nenhuma alteração`,
    });
  }

  return mensagens;
};

export const validaTexto = (dispositivo: Dispositivo): Mensagem[] => {
  return isAgrupador(dispositivo)
    ? validaTextoAgrupador(dispositivo)
    : isDispositivoAlteracao(dispositivo)
    ? validaTextoDispositivoAlteracao(dispositivo)
    : validaTextoDispositivo(dispositivo);
};
