import { createElemento } from './../../../model/elemento/elementoUtil';
import { isAgrupador, isArticulacao, isCaput, isItem, Tipo, isAlinea, isAgrupadorGenerico } from './../../../model/dispositivo/tipo';
import { buildDispositivoFromJsonix } from './../../../model/lexml/documento/conversor/buildDispositivoFromJsonix';
import { Elemento } from './../../../model/elemento/elemento';
import { Articulacao, Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isArtigo, isInciso, isOmissis } from '../../../model/dispositivo/tipo';
import {
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  isDispositivoAlteracao,
  irmaosMesmoTipo,
  isModificadoOuSuprimido,
  isOriginal,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { escapeRegex, removeAllHtmlTags, removeAllHtmlTagsExcept } from '../../../util/string-util';

export interface MensageInfoTextoColado {
  oQueEstaSendoColado: string;
  proibidoColarAnaliseInicial: string[];
  proibidoColarAnaliseContextualizada: string[];
}

export interface InfoDispositivos {
  tiposColados: string[];
  atual: Dispositivo;
  referencia?: Dispositivo;
  existentes: Dispositivo[];
  novos: Dispositivo[];
}

export interface InfoElementos {
  tiposColados: string[];
  atual: Elemento;
  referencia?: Elemento;
  existentes: Elemento[];
  novos: Elemento[];
}

export enum TipoRestricaoEnum {
  ARTICULACAO_SEM_FILHOS,
  AGRUPADOR_GENERICO_NA_ARTICULACAO,
  AGRUPADORES_DE_ARTIGO,
  DISPOSITIVOS_DE_TIPOS_DIFERENTES,
  DISPOSITIVOS_COM_ROTULO_DUPLICADO,
  ARTIGOS_SEM_NUMERACAO_DENTRO_DE_ALTERACAO,
  ALTERACAO_DENTRO_DE_ALTERACAO,
  FILHOS_EM_DISPOSITIVO_SUPRIMIDO,
  DISPOSITIVO_JA_MODIFICADO,
  DISPOSITIVO_EM_POSICAO_INVALIDA,
  DISPOSITIVO_ANTES_DO_ATUAL,
  ARTIGO_COM_FILHOS_SOBRE_ARTIGO_COM_ALTERACOES,
  ARTIGO_COM_ALTERACOES_SOBRE_ARTIGO_COM_FILHOS,
  ARTIGO_COM_MUDANCA_IDENTIFICACAO_NORMA_ALTERADA,
  ARTICULACAO_INCONSISTENTE, // Exemplo: alínea debaixo de artigo, item debaixo de artigo, etc
}

export interface Restricao {
  tipo: TipoRestricaoEnum;
  titulo?: string;
  mensagens: string[];
  isPermitidoColarAdicionando?: boolean;
}

export class InfoTextoColado {
  textoColadoOriginal: string; // texto como está no clipboard
  textoColadoAjustado: string; // pode conter alguns ajustes se texto no clipboard for html
  textoColadoAjustadoParaParser: string; // texto a ser enviado para o parser (derivado de textoColadoAjustado. exemplo: contém números "fake" em artigos originalmente sem numeração)
  isColandoArtigoSemNumeracao: boolean;
  jsonix: any;
  articulacaoProposicao: Articulacao;
  articulacaoColada: Articulacao;
  posicao: string;
  isColarSubstituindo = true;
  podeColarAntes: boolean;
  private infoDispositivos: InfoDispositivos;
  infoElementos: InfoElementos;
  tipoColado: Tipo;
  restricoes: Restricao[];

  private constructor(
    articulacaoProposicao: Articulacao,
    textoColadoOriginal: string,
    textoColadoAjustado: string,
    textoColadoAjustadoParaParser: string,
    jsonix: any,
    articulacaoColada: Articulacao,
    atual: Elemento,
    isColarSubstituindo = true,
    posicao = 'depois'
  ) {
    this.textoColadoOriginal = textoColadoOriginal;
    this.textoColadoAjustado = textoColadoAjustado;
    this.textoColadoAjustadoParaParser = textoColadoAjustadoParaParser;
    this.isColandoArtigoSemNumeracao = hasArtigoOndeCouber(textoColadoAjustado);
    this.jsonix = jsonix;
    this.articulacaoProposicao = articulacaoProposicao;
    this.articulacaoColada = articulacaoColada;

    this.isColarSubstituindo = isColarSubstituindo;
    this.posicao = posicao;

    this.infoDispositivos = {
      tiposColados: montarListaTiposDispositivosColados(this.articulacaoColada),
      atual: getDispositivoFromElemento(this.articulacaoProposicao, atual)!,
      existentes: [],
      novos: [],
    };

    this.tipoColado = getTipoColadoFromArticulacao(this.articulacaoColada);

    this.infoDispositivos.referencia = getDispositivoReferencia(articulacaoColada.filhos[0].tipo, this.infoDispositivos.atual);
    this.infoDispositivos.existentes = montarListaDispositivosExistentes(this.articulacaoProposicao, this.articulacaoColada, this.infoDispositivos.referencia);
    this.infoDispositivos.novos = montarListaDispositivosNovos(this.articulacaoProposicao, this.articulacaoColada, this.infoDispositivos.referencia);

    this.infoElementos = {
      tiposColados: this.infoDispositivos.tiposColados,
      atual: createElemento(this.infoDispositivos.atual),
      existentes: this.infoDispositivos.existentes.map(d => createElemento(d)),
      novos: this.getElementos(this.infoDispositivos.novos),
      referencia: this.infoDispositivos.referencia ? createElemento(this.infoDispositivos.referencia) : undefined,
    };

    this.podeColarAntes = this.infoDispositivos.referencia?.tipo === this.infoDispositivos.tiposColados[0];

    this.restricoes = this.montarRestricoes();
  }

  private getElementos(dispositivos: Dispositivo[]): Elemento[] {
    try {
      return dispositivos.map(d => createElemento(d));
    } catch (error) {
      return [];
    }
  }

  public static async newInstanceFromTexto(
    textoColadoOriginal: string,
    textoColadoAjustado: string,
    articulacaoProposicao: Articulacao,
    atual: Elemento
  ): Promise<InfoTextoColado> {
    let textoColadoAjustadoParaParser = converterSufixoDosRotulos(
      ajustarRotuloArtigo(removeAspasENRSeNecessario(hasArtigoOndeCouber(textoColadoAjustado) ? numerarArtigosOndeCouber(textoColadoAjustado) : textoColadoAjustado))
    );
    let jsonix = await getJsonixFromTexto(textoColadoAjustadoParaParser);
    let projetoNorma = buildDispositivoFromJsonix(jsonix);

    const dispositivos = getDispositivoAndFilhosAsLista(projetoNorma.articulacao!);
    if (existeItemSemPaiAlinea(dispositivos)) {
      textoColadoAjustadoParaParser = ajustaFalsosItensParaParser(textoColadoAjustadoParaParser, dispositivos);
      jsonix = await getJsonixFromTexto(textoColadoAjustadoParaParser);
      projetoNorma = buildDispositivoFromJsonix(jsonix);
    }

    return new InfoTextoColado(articulacaoProposicao, textoColadoOriginal, textoColadoAjustado, textoColadoAjustadoParaParser, jsonix, projetoNorma.articulacao!, atual);
  }

  public static newInstanceFromJsonix(jsonix: any, articulacaoProposicao: Articulacao, atual: Elemento, isColarSubstituindo = true, posicao = 'depois'): InfoTextoColado {
    const projetoNorma = buildDispositivoFromJsonix(jsonix);
    return new InfoTextoColado(articulacaoProposicao, '', '', '', jsonix, projetoNorma.articulacao!, atual, isColarSubstituindo, posicao);
  }

  public static newInstanceFromTextoEJsonix(
    textoColadoOriginal: string,
    textoColadoAjustado: string,
    jsonix: any,
    articulacaoProposicao: Articulacao,
    atual: Elemento
  ): InfoTextoColado {
    const projetoNorma = buildDispositivoFromJsonix(jsonix);
    return new InfoTextoColado(articulacaoProposicao, textoColadoOriginal, textoColadoAjustado, textoColadoAjustado, jsonix, projetoNorma.articulacao!, atual);
  }

  public static newInstanceFromArticulacao(articulacaoColada: Articulacao, articulacaoProposicao: Articulacao, atual: Elemento): InfoTextoColado {
    return new InfoTextoColado(articulacaoProposicao, '', '', '', undefined, articulacaoColada, atual);
  }

  private montarRestricoes = (): Restricao[] => {
    return [...validarArticulacaoColadaAnaliseInicial(this.articulacaoColada), ...validarArticulacaoColadaAnaliseContextualizada(this, this.infoDispositivos)];
  };

  public atualizarAtributosEAnaliseContextualizada(isColarSubstituindo: boolean, posicao: string): void {
    const tiposRestricoesAnaliseInicial = [
      TipoRestricaoEnum.ARTICULACAO_SEM_FILHOS,
      TipoRestricaoEnum.AGRUPADORES_DE_ARTIGO,
      TipoRestricaoEnum.DISPOSITIVOS_DE_TIPOS_DIFERENTES,
      TipoRestricaoEnum.DISPOSITIVOS_COM_ROTULO_DUPLICADO,
    ];

    this.posicao = posicao;
    this.isColarSubstituindo = isColarSubstituindo;

    this.restricoes = this.restricoes.filter(r => tiposRestricoesAnaliseInicial.includes(r.tipo));

    this.restricoes.push(...validarArticulacaoColadaAnaliseContextualizada(this, this.infoDispositivos));
  }
}

// Retira a quebra de linha anterior ao texto que foi identificado como item (sem que houvesse um alínea antes)
const ajustaFalsosItensParaParser = (texto: string, dispositivos: Dispositivo[]): string => {
  let textoAux = texto;
  const lista = dispositivos.filter(d => isItem(d) && !isAlinea(d.pai!));
  lista.forEach(d => {
    const textoItemAjustadoParaPesquisa = escapeRegex(d.texto).split(' ').join('[\\s\\n]?');
    const regex = new RegExp(`(\\n)(.*${d.numero}.*${textoItemAjustadoParaPesquisa})`, 'i');
    textoAux = textoAux.replace(regex, ' $2');
  });
  return textoAux;
};

export const existeItemSemPaiAlinea = (dispositivos: Dispositivo[]): boolean => {
  return dispositivos.some(d => isItem(d) && !isAlinea(d.pai!) && !isArticulacao(d.pai!));
};

export const removeAspasENRSeNecessario = (texto: string): string => {
  const textoAux = texto
    .replace(/\r/g, '')
    .replace(/\n\s*\(NR\)/gi, ' (NR)')
    .replace(/(\(NR\))\./gi, '$1');

  if (!comecaComAspas(textoAux)) {
    return textoAux;
  }

  const regexMatchTextoArtigoEntreAspasOuNao = /(?<=\n|^)["“‘']?art(?:\.|\s|\d)(?:.|\n)+?(?:(?=\n["“‘']?art(?:\.|\s|\d))|$)/gi;
  if (!textoAux.match(regexMatchTextoArtigoEntreAspasOuNao)) {
    return textoAux;
  }

  // Grupo 1 do regex abaixo corresponde ao texto do artigo sem aspas iniciais e finais e sem o (NR)
  const regexMatchTextoArtigoEntreAspasOuNaoComCapturaDeGrupo = /(?<=\n|^)\s*["“‘']?(art(?:\.|\s|\d)(?:.|\n)+?)(["”’]\s*(?:\(NR\))?[\s]*)?(?:(?=\n\s*["“‘']?art(?:\.|\s|\d))|$)/gi;
  return textoAux.replace(regexMatchTextoArtigoEntreAspasOuNaoComCapturaDeGrupo, '\n$1').trim();
};

export const ajustarRotuloArtigo = (texto: string): string => removeEspacosExcendentesEntreRotuloENumeracao(texto, 'Art');

const removeEspacosExcendentesEntreRotuloENumeracao = (texto: string, rotulo: string, newChar = ' '): string => {
  return texto.replace(new RegExp(`(^${rotulo}\\.?)([^\\S\\n\\r]+)`, 'gim'), `$1${newChar}`);
};

export const comecaComAspas = (texto: string): boolean => !!texto.match(/^["“‘']/);

export const getJsonixFromTexto = async (texto: string): Promise<any> => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: texto,
  };

  try {
    const response = await fetch('https://www6ghml.senado.leg.br/editor-emendas/api/parser/jsonix', options);
    return await response.json();
  } catch (err) {
    return console.error(err);
  }
};

export const montarListaTiposDispositivosColados = (articulacao: Articulacao): string[] => {
  return [...new Set(articulacao.filhos.filter(f => f.tipo !== 'Omissis').map(f => f.tipo))];
};

const getTipoColadoFromArticulacao = (articulacao: Articulacao): Tipo => getTipoColadoFromDispositipo(articulacao.filhos[0]);

const getTipoColadoFromDispositipo = (dispositivo: Dispositivo): Tipo => getTipo(dispositivo.tipo);

const getTipo = (nomeTipo: string): Tipo => TipoDispositivo[nomeTipo?.toLowerCase()];

export const montarListaDispositivosExistentes = (articulacao: Articulacao, articulacaoColada: Articulacao, referencia?: Dispositivo): Dispositivo[] => {
  if (referencia && (!isArtigo(articulacaoColada.filhos[0]) || isDispositivoAlteracao(referencia))) {
    ajustaIdsNaArticulacaoColada(articulacaoColada.filhos, referencia);
  }

  const idsColados = getDispositivoAndFilhosAsLista(articulacaoColada)
    .filter(d => d.tipo !== 'Articulacao')
    .map(d => d.id)
    .reduce((acc, cur) => {
      if (cur) {
        acc.push(cur);
        if (cur.endsWith('_par1')) {
          acc.push(cur.replace('_par1', '_par1u'));
        }
      }
      return acc;
    }, [] as string[]);
  return getDispositivoAndFilhosAsLista(articulacao).filter(d => isOriginal(d) && idsColados.includes(d.id!));
};

export const montarListaDispositivosNovos = (articulacao: Articulacao, articulacaoColada: Articulacao, referencia?: Dispositivo): Dispositivo[] => {
  const idsExistentes = montarListaDispositivosExistentes(articulacao, articulacaoColada, referencia).map(d => d.id);
  return getDispositivoAndFilhosAsLista(articulacaoColada).filter(d => !isArticulacao(d) && !idsExistentes.includes(d.id));
};

export const validarArticulacaoColadaAnaliseInicial = (articulacaoColada: Articulacao): Restricao[] => {
  const result: Restricao[] = [];

  if (!articulacaoColada || !articulacaoColada.filhos.length) {
    result.push({
      tipo: TipoRestricaoEnum.ARTICULACAO_SEM_FILHOS,
      mensagens: ['Não foi possível identificar dispositivos no texto informado'],
    });
    return result;
  }

  if (getDispositivoAndFilhosAsLista(articulacaoColada).some(isAgrupadorGenerico)) {
    result.push({
      tipo: TipoRestricaoEnum.AGRUPADOR_GENERICO_NA_ARTICULACAO,
      mensagens: ['Não foi possível identificar, corretamente, os dispositivos no texto a ser colado.'],
    });
  }

  if (hasAgrupador(articulacaoColada)) {
    result.push({
      tipo: TipoRestricaoEnum.AGRUPADORES_DE_ARTIGO,
      mensagens: ['Não é permitido colar texto com agrupadores de artigo.', 'Por favor, adicione-os manualmente no editor e depois cole os artigos, se houverem.'],
    });
  }

  if (articulacaoColada.filhos.filter(f => !isOmissis(f)).length !== irmaosMesmoTipo(articulacaoColada.filhos.filter(f => !isOmissis(f))[0]).length) {
    const tipos = [...new Set(articulacaoColada.filhos.map(f => TipoDispositivo[f.tipo.toLowerCase()].descricaoPlural?.toLocaleLowerCase()))];
    result.push({
      tipo: TipoRestricaoEnum.DISPOSITIVOS_DE_TIPOS_DIFERENTES,
      mensagens: [`Não é permitido colar texto com dispositivos de tipos diferentes: ${tipos.join(', ')}.`, 'Por favor, cole-os separadamente.'],
    });
  }

  if (existeDispositivoComRotuloDuplicado(articulacaoColada)) {
    result.push({
      tipo: TipoRestricaoEnum.DISPOSITIVOS_COM_ROTULO_DUPLICADO,
      mensagens: ['Não é permitido colar dispositivos com rótulos duplicados.'],
    });
  }

  if (isArticulacaoInconsistente(articulacaoColada)) {
    const mensagens = [
      'Não foi possível identificar, corretamente, os dispositivos no texto a ser colado.',
      getTextoInconsistencia(getDispositivoAndFilhosAsLista(articulacaoColada)),
      'Por favor, verifique se o texto está correto e tente novamente.',
    ].filter(Boolean);

    result.push({
      tipo: TipoRestricaoEnum.ARTICULACAO_INCONSISTENTE,
      mensagens,
    });
  }

  return result;
};

const hasAgrupador = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos.filter(a => isAgrupador(a) && a.tipo !== 'DispositivoAgrupadorGenerico').length > 0;
};

const isArticulacaoInconsistente = (articulacao: Articulacao): boolean => {
  const dispositivos = getDispositivoAndFilhosAsLista(articulacao).slice(1);
  return dispositivos.some(d => isDispositivoInconsistente(d));
};

const isDispositivoInconsistente = (dispositivo: Dispositivo): boolean => {
  return !dispositivo.pai?.tiposPermitidosFilhos?.includes(dispositivo.tipo) && !isOmissis(dispositivo) && !!dispositivo.pai && !isArticulacao(dispositivo.pai!);
};

const getTextoInconsistencia = (dispositivos: Dispositivo[]): string => {
  const dispositivo = dispositivos.find(d => isDispositivoInconsistente(d));
  if (dispositivo && dispositivo.pai) {
    const pai = isCaput(dispositivo.pai) ? dispositivo.pai.pai : dispositivo.pai;
    const tiposPermitidos = pai?.tiposPermitidosFilhos?.map(t => TipoDispositivo[t.toLowerCase()].descricao?.toLowerCase());
    return `O dispositivo "${dispositivo.rotulo}" não pode ser colado como filho de "${pai?.rotulo}" pois o tipo do dispositivo é ${TipoDispositivo[
      dispositivo.tipo.toLowerCase()
    ].descricao?.toLowerCase()} e o tipo permitido é ${tiposPermitidos?.join(' ou ')}.`;
  }
  return '';
};

const existeDispositivoComRotuloDuplicado = (articulacaoColada: Articulacao): boolean => {
  const rotulos = articulacaoColada.filhos.map(f => f.rotulo);
  return rotulos.length > new Set(rotulos).size;
};

const validarArticulacaoColadaAnaliseContextualizada = (infoTextoColado: InfoTextoColado, infoDispositivos: InfoDispositivos): Restricao[] => {
  const result: Restricao[] = [];

  const { textoColadoAjustado, articulacaoColada, articulacaoProposicao, tipoColado, isColarSubstituindo, posicao } = infoTextoColado;
  const { atual, referencia, existentes: dispositivosExistentes } = infoDispositivos;

  if (infoTextoColado.infoElementos.tiposColados.includes('DispositivoAgrupadorGenerico')) {
    return result;
  }

  if (!articulacaoColada.filhos.length) {
    return result;
  }

  const pluralTipoColado = tipoColado.descricaoPlural;

  if (isDispositivoAlteracao(atual) && hasArtigoOndeCouber(textoColadoAjustado)) {
    result.push({
      tipo: TipoRestricaoEnum.ARTIGOS_SEM_NUMERACAO_DENTRO_DE_ALTERACAO,
      mensagens: [`Não é permitido colar artigo sem numeração dentro de alteração de norma.`],
    });
  }

  if (isDispositivoAlteracao(atual) && articulacaoColada.filhos.some(f => isArtigo(f) && f.alteracoes?.filhos.length)) {
    result.push({
      tipo: TipoRestricaoEnum.ALTERACAO_DENTRO_DE_ALTERACAO,
      mensagens: ['Não é permitido colar alteração de norma dentro de alteração de norma'],
    });
  }

  const dispositivosExistentesAux = dispositivosExistentes || montarListaDispositivosExistentes(getArticulacao(atual), articulacaoColada, referencia);

  if (atual.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO && articulacaoColada.filhos && isColandoFilhos(articulacaoColada.filhos, atual)) {
    result.push({
      tipo: TipoRestricaoEnum.FILHOS_EM_DISPOSITIVO_SUPRIMIDO,
      mensagens: ['Não é permitido colar filhos em dispositivo suprimido'],
    });
  }

  if (isColarSubstituindo && dispositivosExistentesAux.some(isModificadoOuSuprimido)) {
    const ids = dispositivosExistentesAux.filter(isModificadoOuSuprimido).map(d => d.id!);
    const dispositivos = getDispositivoAndFilhosAsLista(articulacaoProposicao)
      .filter(d => tipoColado.name === d.tipo && ids.includes(d.id!))
      .map(d => d.rotulo?.replace(/ [-–)]/, ''))
      .join(', ');

    result.push({
      tipo: TipoRestricaoEnum.DISPOSITIVO_JA_MODIFICADO,
      titulo: 'Atenção, dispositivo já modificado encontrado',
      mensagens: [`Não é permitido colar dispositivos que já foram alterados na emenda${dispositivos ? ` (veja ${pluralTipoColado}: ${dispositivos})` : ''}.`],
      isPermitidoColarAdicionando: true,
    });
  }

  const referenciaAux = referencia || getDispositivoReferencia(articulacaoColada.filhos[0].tipo, atual);

  if (!referenciaAux) {
    const pluralTipoAtual = getTipo(atual.tipo).descricaoPlural;
    result.push({
      tipo: TipoRestricaoEnum.DISPOSITIVO_EM_POSICAO_INVALIDA,
      mensagens: [`Não é permitido colar ${pluralTipoColado?.toLowerCase()} sobre ${pluralTipoAtual?.toLowerCase()}`],
    });
    return result;
  }

  if (posicao === 'antes' && referenciaAux.tipo !== articulacaoColada.filhos[0].tipo) {
    result.push({
      tipo: TipoRestricaoEnum.DISPOSITIVO_ANTES_DO_ATUAL,
      mensagens: [`Não é permitido colar ${pluralTipoColado} antes do atual dispositivo selecionado`],
    });
  }

  if (isColandoArtigosComFilhosSobreArtigosComAlteracoes(infoTextoColado, infoDispositivos)) {
    result.push({
      tipo: TipoRestricaoEnum.ARTIGO_COM_FILHOS_SOBRE_ARTIGO_COM_ALTERACOES,
      mensagens: ['Não é permitido adicionar incisos ou parágrafos a artigo que já possua alterações de norma'],
      isPermitidoColarAdicionando: true,
    });
  }

  if (isColandoArtigosComAlteracoesSobreArtigosComFilhos(infoTextoColado, infoDispositivos)) {
    result.push({
      tipo: TipoRestricaoEnum.ARTIGO_COM_ALTERACOES_SOBRE_ARTIGO_COM_FILHOS,
      mensagens: ['Não é permitido adicionar alterações de norma a artigo que já possua incisos ou parágrafos'],
      isPermitidoColarAdicionando: true,
    });
  }

  if (isColandoArtigoExistenteComMudancaDaNormaAlterada(infoTextoColado)) {
    result.push({
      tipo: TipoRestricaoEnum.ARTIGO_COM_MUDANCA_IDENTIFICACAO_NORMA_ALTERADA,
      mensagens: ['Não é permitido colar artigo com mudança na identificação da norma alterada'],
      isPermitidoColarAdicionando: true,
    });
  }

  return result;
};

const isColandoArtigosComFilhosSobreArtigosComAlteracoes = (infoTextoColado: InfoTextoColado, infoDispositivos: InfoDispositivos): boolean => {
  return infoTextoColado.isColarSubstituindo && hasArtigosComAlteracoes(infoDispositivos.existentes) && hasArtigosComFilhos(infoTextoColado.articulacaoColada.filhos);
};

const isColandoArtigosComAlteracoesSobreArtigosComFilhos = (infoTextoColado: InfoTextoColado, infoDispositivos: InfoDispositivos): boolean => {
  return infoTextoColado.isColarSubstituindo && hasArtigosComFilhos(infoDispositivos.existentes) && hasArtigosComAlteracoes(infoTextoColado.articulacaoColada.filhos);
};

const isColandoArtigoExistenteComMudancaDaNormaAlterada = (infoTextoColado: InfoTextoColado): boolean => {
  // TODO: Implementar quando parser estiver rodando o linker
  return !infoTextoColado;
};

const hasArtigosComAlteracoes = (dispositivos: Dispositivo[]): boolean => dispositivos.some(d => isArtigo(d) && !isDispositivoAlteracao(d) && d.alteracoes?.filhos.length);

const hasArtigosComFilhos = (dispositivos: Dispositivo[]): boolean => dispositivos.some(d => isArtigo(d) && !isDispositivoAlteracao(d) && d.filhos?.length);

const getDispositivoReferencia = (tipoASerColado: string, ref?: Dispositivo): Dispositivo | undefined => {
  if (!ref) {
    return;
  } else if (ref.tipo === tipoASerColado || (ref.tiposPermitidosFilhos || []).includes(tipoASerColado)) {
    return ref;
  } else {
    return getDispositivoReferencia(tipoASerColado, ref.pai);
  }
};

const isColandoFilhos = (filhos: Dispositivo[], atual: Dispositivo): boolean => {
  return filhos[0].tipo !== atual.tipo && !!atual.tiposPermitidosFilhos?.includes(filhos[0].tipo);
};

export const ajustaIdsNaArticulacaoColada = (filhos: Dispositivo[], referencia: Dispositivo): void => {
  let prefixo: string;
  if (referencia.tipo === filhos[0].tipo) {
    prefixo = referencia.pai!.id!;
  } else {
    prefixo = referencia.id!;
  }

  if (isArtigo(referencia) && isInciso(filhos[0])) {
    prefixo += '_cpt';
  }

  filhos.forEach(f => getDispositivoAndFilhosAsLista(f).forEach(f2 => ajustaIdSeNecessario(f2, prefixo)));
};

const ajustaIdSeNecessario = (dispositivo: Dispositivo, prefixo: string): void => {
  !dispositivo.id?.startsWith(prefixo) && ajustarId(dispositivo, prefixo);
};

const ajustarId = (dispositivo: Dispositivo, prefixo: string): void => {
  dispositivo.id = prefixo + '_' + dispositivo.id;
  if (isArtigo(dispositivo) && (dispositivo as Artigo).caput) {
    (dispositivo as Artigo).caput!.id = prefixo + '_' + (dispositivo as Artigo).caput!.id;
  }
};

export const getRegexRotuloArtigoOndeCouber = (): RegExp => /^(["“‘'])?(art\.\s+(?!\d+)[x. ]*[º0]?)/gim;

const hasArtigoOndeCouber = (texto: string): boolean => {
  const t = removeAllHtmlTags(texto)
    ?.replace(/&nbsp;/g, ' ')
    .replace(/["“']/g, '')
    .replace(/(^Art\.?)([^\S\n\r]+)/gim, '$1 ')
    .trim();

  return getRegexRotuloArtigoOndeCouber().test(t);
};

const numerarArtigosOndeCouber = (texto: string): string => {
  if (hasArtigoOndeCouber(texto)) {
    let contador = 5000;
    let novoTexto = texto.replaceAll(getRegexRotuloArtigoOndeCouber(), '$1ArtigoANumerar');

    //numera artigos
    while (novoTexto.indexOf('ArtigoANumerar') !== -1) {
      novoTexto = novoTexto.replace('ArtigoANumerar', 'Art. ' + contador++ + '. ');
    }

    return novoTexto;
  }
  return texto;
};

export const ajustaHtmlParaColagem = (htmlInicial: string): string => {
  let html = htmlInicial
    .replace(/\xA0/g, ' ') // &nbsp; (non breaking space to space) (\xA0 = 160)
    .replace(/<![^>]*>/g, '')
    .replace(/<p/g, '\n<p')
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/(<br\s*\/?>)/gi, ' ')
    .replace(/<([a-z]+) .*?=".*?( *\/?>)/gi, '<$1$2')
    .replace(/;[/s]?[e][/s]?$/, '; ')
    .replace(';', '; ')
    .replace(/^["“']/g, '')
    .replace(/<\/?body[^>]*>/gi, '')
    .replace(/\r/g, '')
    .replace(/\n+/g, '\n')
    .replace(/&ldquo; |&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”');

  const allowedTags = ['B', 'STRONG', 'I', 'EM', 'SUP', 'SUB', 'P'];

  allowedTags.map(tag => tag.toLowerCase()).forEach(tag => (html = html.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), `<${tag}>`)));

  // Substitui tags "strong" por "b" e "em" por "i"
  html = html.replace(/<(\/?)strong>/gi, '<$1b>').replace(/<(\/?)em(>)/gi, '<$1i>');

  // Remove quebras de linha dentro de parágrafos
  html = html.replace(/<p[^>]*>(?:.|\n)*?<\/p>/gi, s => s.replace(/\n/g, ' ')).replace(/[\t ]+/g, ' ');

  html = html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');

  html = removeAllHtmlTagsExcept(html, allowedTags)
    .replace(/<p[^>]*>/gi, '\n<p>') // Garante que cada parágrafo comece em uma nova linha
    .replace(/(?<=<\/p>).*/gi, '') // Remove tudo que vem depois do fim do parágrafo, na mesma linha (remove o que não estiver dentro de um parágrafo)
    .replace(/<\/?p[^>]*>/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/ +/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n *<i>(Parágrafo único\. *)<\/i>/gi, '\n$1') // Remove itálico de rótulo de parágrafo único
    .trim();

  return html;
};

export const converterSufixoDosRotulos = (texto: string): string => {
  const regexRotulo = /^((?:(?:art\.?|§|par[aá]grafo [uú]nico)\s*\d+º?)|(?:[IVXMDC]{1,3}|[a-z]{1,2}|\d{1,3}))-(\d+)/gim;

  const fnSubstituicao = (match: string, grupo1: string, grupo2: string): string => {
    const numero = parseInt(grupo2);
    let letra = '';
    if (numero <= 26) {
      letra = String.fromCharCode(65 + numero - 1);
    } else {
      const primeiraLetra = String.fromCharCode(65 + Math.floor((numero - 1) / 26) - 1);
      const segundaLetra = String.fromCharCode(65 + ((numero - 1) % 26));
      letra = primeiraLetra + segundaLetra;
    }

    return `${grupo1}-${letra}`;
  };

  return texto.replace(regexRotulo, fnSubstituicao);
};
