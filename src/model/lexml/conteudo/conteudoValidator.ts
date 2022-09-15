import { containsTags, converteIndicadorParaTexto, endsWithPunctuation, getLastCharacter, getTextoSemHtml, isValidHTML } from '../../../util/string-util';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoDeArtigo, isOmissis, isParagrafo } from '../../dispositivo/tipo';
import {
  getDispositivoCabecaAlteracao,
  getDispositivoPosterior,
  hasFilhoGenerico,
  hasFilhos,
  isDispositivoAlteracao,
  isPenultimoMesmoTipo,
  isUltimaAlteracao,
  isUltimaEnumeracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { AutoFix, Mensagem, TipoMensagem } from '../util/mensagem';
import {
  hasIndicativoContinuacaoSequencia,
  hasIndicativoDesdobramento,
  hasIndicativoFinalSequencia,
  hasIndicativoInicioAlteracao,
  TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO,
} from './conteudoUtil';
import { TEXTO_OMISSIS } from './textoOmissis';

const hasCitacaoAoFinalFrase = (texto: string): boolean => {
  return texto !== undefined && /.*:[\s]{1,2}["”“].*[.]["”“]$/.test(texto);
};

export const validaTextoAgrupador = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];
  if (!isArticulacao(dispositivo) && (!dispositivo.texto || dispositivo.texto.trim().length === 0)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informado um texto para ${dispositivo.artigoDefinido} ${dispositivo.descricao}`,
    });
  }
  if (!isArticulacao(dispositivo) && dispositivo.texto && endsWithPunctuation(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não pode haver sinal de pontuação ao final do texto d${dispositivo.artigoDefinido} ${dispositivo.descricao}`,
    });
  }
  if (!isArticulacao(dispositivo) && containsTags(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Texto d${dispositivo.artigoDefinido} ${dispositivo.descricao} não pode possuir formatação`,
    });
  }
  return mensagens;
};

export const validaTextoDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];

  //
  // validações comuns a dispositivos de texto
  //
  if ((!isArticulacao(dispositivo) && !dispositivo.texto) || dispositivo.texto.trim().length === 0) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informado um texto para ${dispositivo.artigoDefinido + ' ' + dispositivo.descricao!}`,
    });
  }
  if (!isArticulacao(dispositivo) && dispositivo.texto && !isValidHTML(dispositivo.texto)) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: 'O conteúdo do dispositivo não é um HTML válido',
    });
  }
  if (!isArticulacao(dispositivo) && dispositivo.texto && dispositivo.texto.trim().length > 500) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `Pelo princípio da concisão, o texto dos dispositivos não deve ser extenso, devendo ser utilizadas frases curtas e concisas`,
    });
  }

  //
  // validações comuns a dispositivos de artigo
  //
  if (isDispositivoDeArtigo(dispositivo) && !isParagrafo(dispositivo) && dispositivo.texto && /^[A-ZÀ-Ú]/.test(getTextoSemHtml(dispositivo.texto))) {
    mensagens.push({
      tipo: TipoMensagem.WARNING,
      descricao: `${dispositivo.descricao} deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio`,
    });
  }

  if (
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isOmissis(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !isUnicoMesmoTipo(dispositivo) &&
    !isUltimoMesmoTipo(dispositivo) &&
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

  if (
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isOmissis(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !hasFilhos(dispositivo) &&
    !isUltimaEnumeracao(dispositivo) &&
    dispositivo.INDICADOR_SEQUENCIA !== undefined &&
    getLastCharacter(dispositivo.texto) !== dispositivo.INDICADOR_SEQUENCIA[0]
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ponto e vírgula, pois há outros dispositivos de artigo posteriores`,
    });
  }

  //
  // validações comuns a Artigo e Parágrafo
  //
  if (
    (isArtigo(dispositivo) || isParagrafo(dispositivo)) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !/^[...]{3,}/.test(dispositivo.texto) &&
    !/^[A-ZÀ-Ú]/.test(getTextoSemHtml(dispositivo.texto))
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria iniciar com letra maiúscula`,
    });
  }

  //
  // validações de dispositivos que não sejam de alteração
  //

  if (
    !isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    !isOmissis(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    ((!isArtigo(dispositivo) && hasFilhos(dispositivo)) || (isArtigo(dispositivo) && hasFilhos((dispositivo as Artigo).caput!))) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }

  // dispositivos de artigo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    dispositivo.texto &&
    !hasFilhoGenerico(dispositivo.pai!) &&
    !hasFilhos(dispositivo) &&
    isUltimaEnumeracao(dispositivo) &&
    !hasIndicativoFinalSequencia(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Último dispositivo de uma sequência deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_FIM_SEQUENCIA!)}`,
    });
  }
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !isUnicoMesmoTipo(dispositivo) &&
    isPenultimoMesmoTipo(dispositivo) &&
    !hasFilhos(dispositivo) &&
    !hasIndicativoContinuacaoSequencia(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ponto e vírgula`,
    });
  }

  // Artigo e Parágrafo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigo(dispositivo) || isParagrafo(dispositivo)) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !hasFilhos(dispositivo) &&
    !dispositivo.hasAlteracao() &&
    !isUnicoMesmoTipo(dispositivo) &&
    !hasIndicativoContinuacaoSequencia(dispositivo) &&
    !hasCitacaoAoFinalFrase(dispositivo.texto)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}`,
    });
  }

  // Artigo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isArtigo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    dispositivo.hasAlteracao() &&
    !hasIndicativoDesdobramento(dispositivo) &&
    !hasIndicativoInicioAlteracao(dispositivo.texto)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isArtigo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !dispositivo.hasAlteracao() &&
    (!hasFilhos(dispositivo) || !hasFilhos((dispositivo as Artigo).caput!)) &&
    hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}`,
    });
  }

  if (!isDispositivoAlteracao(dispositivo) && isArtigo(dispositivo) && dispositivo.hasAlteracao() && !dispositivo.alteracoes?.base) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: AutoFix.INFORMAR_NORMA,
      fix: true,
    });
  }

  //
  // Validações de dispositivos de alteração
  //
  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !isArtigo(dispositivo) &&
    hasFilhos(dispositivo) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    isArtigo(dispositivo) &&
    hasFilhos((dispositivo as Artigo).caput!) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    hasIndicativoDesdobramento(dispositivo) &&
    ((isArtigo(dispositivo) && !hasFilhos((dispositivo as Artigo).caput!)) || !hasFilhos(dispositivo))
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} não deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    isParagrafo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !hasFilhos(dispositivo) &&
    !isUnicoMesmoTipo(dispositivo) &&
    !isUltimoMesmoTipo(dispositivo) &&
    !hasIndicativoContinuacaoSequencia(dispositivo) &&
    (!getDispositivoPosterior(dispositivo) || !isOmissis(getDispositivoPosterior(dispositivo)!))
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.texto &&
    dispositivo === getDispositivoCabecaAlteracao(dispositivo) &&
    dispositivo.filhos.length === 0 &&
    (dispositivo.texto === TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO || dispositivo.texto.indexOf(TEXTO_OMISSIS) >= 0)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Não foi informada nenhuma alteração`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isOmissis(dispositivo) &&
    dispositivo.pai!.filhos.filter(d => isOmissis(d)).length === 0 &&
    !hasFilhoGenerico(dispositivo.pai!) &&
    !hasFilhos(dispositivo) &&
    !hasIndicativoFinalSequencia(dispositivo) &&
    !isUltimaAlteracao(dispositivo) &&
    isUltimaEnumeracao(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Último dispositivo de uma sequência deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_FIM_SEQUENCIA!)}`,
    });
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !hasIndicativoContinuacaoSequencia(dispositivo) &&
    !hasIndicativoFinalSequencia(dispositivo) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    mensagens.push({
      tipo: TipoMensagem.ERROR,
      descricao: `Texto do dispositivo não termina com pontuação`,
    });
  }

  return mensagens;
};

export const validaTexto = (dispositivo: Dispositivo): Mensagem[] => {
  return isAgrupador(dispositivo) ? validaTextoAgrupador(dispositivo) : validaTextoDispositivo(dispositivo);
};
