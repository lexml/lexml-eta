import { CmdEmdUtil } from '../../../emenda/comando-emenda-util';
import { containsTags, converteIndicadorParaTexto, endsWithPunctuation, getTextoSemHtml, isValidHTML } from '../../../util/string-util';
import { Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoDeArtigo, isOmissis, isParagrafo, isEmenta } from '../../dispositivo/tipo';
import {
  getDispositivoCabecaAlteracao,
  getDispositivoPosterior,
  getDispositivoPosteriorNaSequenciaDeLeitura,
  hasFilhoGenerico,
  hasFilhos,
  isDispositivoAlteracao,
  isDispositivoCabecaAlteracao,
  isTodosFilhosTipoEnumeracaoSuprimidos,
  isUltimaEnumeracao,
  isUltimoMesmoTipo,
  isUnicoMesmoTipo,
} from '../hierarquia/hierarquiaUtil';
import { isBloqueado } from '../regras/regrasUtil';
import { TipoDispositivo } from '../tipo/tipoDispositivo';
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
    addMensagem(mensagens, TipoMensagem.CRITICAL, `Não foi informado um texto para ${dispositivo.artigoDefinido} ${dispositivo.descricao?.toLowerCase()}.`);
  }
  if (!isArticulacao(dispositivo) && dispositivo.texto && endsWithPunctuation(dispositivo.texto)) {
    addMensagem(mensagens, TipoMensagem.ERROR, `Não pode haver sinal de pontuação ao final do texto d${dispositivo.artigoDefinido} ${dispositivo.descricao?.toLowerCase()}.`);
  }
  if (!isArticulacao(dispositivo) && containsTags(dispositivo.texto)) {
    addMensagem(mensagens, TipoMensagem.ERROR, `Texto d${dispositivo.artigoDefinido} ${dispositivo.descricao?.toLowerCase()} não pode possuir formatação.`);
  }
  return mensagens;
};

export const validaTextoDispositivo = (dispositivo: Dispositivo): Mensagem[] => {
  const mensagens: Mensagem[] = [];

  //
  // validações comuns a dispositivos de texto
  //
  if ((!isArticulacao(dispositivo) && !dispositivo.texto) || dispositivo.texto.trim().length === 0) {
    addMensagem(mensagens, TipoMensagem.CRITICAL, `Não foi informado um texto para ${dispositivo.artigoDefinido + ' ' + dispositivo.descricao?.toLowerCase()}.`);
  }
  if (!isArticulacao(dispositivo) && dispositivo.texto && !isValidHTML(dispositivo.texto)) {
    addMensagem(mensagens, TipoMensagem.ERROR, 'O conteúdo do dispositivo não é um HTML válido.');
  }
  if (!isArticulacao(dispositivo) && !isEmenta(dispositivo) && dispositivo.texto && dispositivo.texto.trim().length > 500) {
    addMensagem(mensagens, TipoMensagem.WARNING, `Pelo princípio da concisão, o texto dos dispositivos não deve ser extenso, devendo ser utilizadas frases curtas e concisas.`);
  }

  // Verifica se o texto tem r$ (com letra minuscula)
  if (dispositivo.texto && dispositivo.texto.indexOf('r$') !== -1) {
    addMensagem(mensagens, TipoMensagem.WARNING, `O texto do dispositivo possui r$ (real brasileiro) com letra minúscula. Deveria ser R$ com letra maiúscula.`);
  }

  //
  // validações comuns a dispositivos de artigo
  //
  if (
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    dispositivo.texto &&
    /^[A-ZÀ-Ú]/.test(getTextoSemHtml(dispositivo.texto)) &&
    dispositivo.texto.indexOf('R$') !== 0
  ) {
    addMensagem(
      mensagens,
      TipoMensagem.WARNING,
      `${dispositivo.descricao} deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio.`
    );
  }

  if (
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isOmissis(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    (!hasFilhos(dispositivo) || isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo)) &&
    !isUltimaEnumeracao(dispositivo) &&
    dispositivo.INDICADOR_SEQUENCIA !== undefined &&
    !hasIndicativoContinuacaoSequencia(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ponto e vírgula.`);
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
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria iniciar com letra maiúscula.`);
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
    !isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo) &&
    !/^[.]+$/.test(dispositivo.texto) &&
    ((!isArtigo(dispositivo) && hasFilhos(dispositivo)) || (isArtigo(dispositivo) && hasFilhos((dispositivo as Artigo).caput!))) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}.`);
  }

  // dispositivos de artigo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    dispositivo.texto &&
    !hasFilhoGenerico(dispositivo.pai!) &&
    (!hasFilhos(dispositivo) || isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo)) &&
    isUltimaEnumeracao(dispositivo) &&
    !hasIndicativoFinalSequencia(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `Último dispositivo de uma sequência deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_FIM_SEQUENCIA!)}.`);
  }

  // Artigo e Parágrafo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    (isArtigo(dispositivo) || isParagrafo(dispositivo)) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    (!hasFilhos(dispositivo) || isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo)) &&
    !dispositivo.alteracoes &&
    !hasIndicativoContinuacaoSequencia(dispositivo) &&
    !hasCitacaoAoFinalFrase(dispositivo.texto)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}.`);
  }

  // Artigo
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isArtigo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo) &&
    !/^[.]+$/.test(dispositivo.texto) &&
    dispositivo.hasAlteracao() &&
    !hasIndicativoDesdobramento(dispositivo) &&
    !hasIndicativoInicioAlteracao(dispositivo.texto)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}.`);
  }
  if (
    !isDispositivoAlteracao(dispositivo) &&
    isArtigo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !dispositivo.alteracoes &&
    (!hasFilhos(dispositivo) || !hasFilhos((dispositivo as Artigo).caput!)) &&
    !isDispositivoCabecaAlteracao(dispositivo) &&
    hasIndicativoDesdobramento(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}.`);
  }

  if (
    isArtigo(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    (!hasFilhos(dispositivo) || !hasFilhos((dispositivo as Artigo).caput!)) &&
    dispositivo.alteracoes &&
    !dispositivo.hasAlteracao() &&
    hasIndicativoDesdobramento(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria informar alterações propostas.`);
  }

  if (!isDispositivoAlteracao(dispositivo) && isArtigo(dispositivo) && dispositivo.hasAlteracao() && !dispositivo.alteracoes?.base) {
    addMensagem(mensagens, TipoMensagem.ERROR, AutoFix.INFORMAR_NORMA, true);
  }

  //
  // Validações de dispositivos de alteração
  //
  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo) &&
    !/^[.]+$/.test(dispositivo.texto) &&
    !isArtigo(dispositivo) &&
    hasFilhos(dispositivo) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}.`);
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo) &&
    !/^[.]+$/.test(dispositivo.texto) &&
    isArtigo(dispositivo) &&
    hasFilhos((dispositivo as Artigo).caput!) &&
    !hasIndicativoDesdobramento(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}.`);
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    !isAgrupador(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo) &&
    !/^[.]+$/.test(dispositivo.texto) &&
    hasIndicativoDesdobramento(dispositivo) &&
    ((isArtigo(dispositivo) && !hasFilhos((dispositivo as Artigo).caput!)) || !hasFilhos(dispositivo))
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} não deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_DESDOBRAMENTO!)}.`);
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
    addMensagem(mensagens, TipoMensagem.ERROR, `${dispositivo.descricao} deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_SEQUENCIA!)}.`);
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.texto &&
    dispositivo === getDispositivoCabecaAlteracao(dispositivo) &&
    dispositivo.filhos.length === 0 &&
    (dispositivo.texto === TEXTO_DEFAULT_DISPOSITIVO_ALTERACAO || dispositivo.texto.indexOf(TEXTO_OMISSIS) >= 0)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `Não foi informada nenhuma alteração.`);
  }

  if (
    isDispositivoAlteracao(dispositivo) &&
    dispositivo.texto &&
    dispositivo.texto.indexOf(TEXTO_OMISSIS) === -1 &&
    !/^[.]+$/.test(dispositivo.texto) &&
    isDispositivoDeArtigo(dispositivo) &&
    !isParagrafo(dispositivo) &&
    !isOmissis(dispositivo) &&
    !hasFilhoGenerico(dispositivo.pai!) &&
    (!hasFilhos(dispositivo) || isTodosFilhosTipoEnumeracaoSuprimidos(dispositivo)) &&
    !hasIndicativoFinalSequencia(dispositivo) &&
    //isUltimaAlteracao(dispositivo) &&
    isUltimaEnumeracao(dispositivo) &&
    !isSeguidoDeOmissis(dispositivo)
  ) {
    addMensagem(mensagens, TipoMensagem.ERROR, `Último dispositivo de uma sequência deveria terminar com ${converteIndicadorParaTexto(dispositivo.INDICADOR_FIM_SEQUENCIA!)}.`);
  }

  if (
    !isDispositivoAlteracao(dispositivo) &&
    dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO &&
    dispositivo.pai!.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO
  ) {
    const dispositivos = [] as any;
    dispositivos.push(dispositivo);

    if (CmdEmdUtil.verificaNecessidadeRenumeracaoRedacaoFinal(dispositivos)) {
      if (localStorage.getItem('naoMostrarExplicacaoSufixo') === null) {
        addMensagem(mensagens, TipoMensagem.WARNING, `Como interpretar sufixos (-1, -2,...)?`, undefined, 'onmodalsufixos');
      }
    }
  }

  if (isBloqueado(dispositivo) && !isBloqueado(dispositivo.pai!)) {
    addMensagem(
      mensagens,
      TipoMensagem.ERROR,
      `Dispositivo com estrutura não suportada pelo editor de emendas. Para alterações neste dispositivo, utilize o modo de emenda de texto livre.`
    );
  }

  return [...new Set(mensagens)];
};

const isSeguidoDeOmissis = (dispositivo: Dispositivo): boolean => {
  const proximo = getDispositivoPosteriorNaSequenciaDeLeitura(dispositivo);

  if (proximo !== undefined) {
    return proximo.tipo === TipoDispositivo.omissis.name;
  }

  return false;
};

const addMensagem = (mensagens: Mensagem[], tipo: TipoMensagem, descricao: string | AutoFix, fix?: boolean, nomeEvento = ''): void => {
  const existe = mensagens.filter(m => m.descricao === descricao).length > 0;
  if (!existe) {
    if (fix === undefined) {
      mensagens.push({ tipo, descricao, nomeEvento });
    } else {
      mensagens.push({ tipo, descricao, fix });
    }
  }
};

export const validaTexto = (dispositivo: Dispositivo): Mensagem[] => {
  return isAgrupador(dispositivo) ? validaTextoAgrupador(dispositivo) : validaTextoDispositivo(dispositivo);
};
