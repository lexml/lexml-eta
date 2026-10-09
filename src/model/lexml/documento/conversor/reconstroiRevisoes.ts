import { Articulacao, Artigo, Dispositivo } from '../../../dispositivo/dispositivo';
import { isArtigo, isCaput } from '../../../dispositivo/tipo';
import { Elemento, Referencia } from '../../../elemento';
import { createElemento, getElementos } from '../../../elemento/elementoUtil';
import { RevisaoElemento } from '../../../revisao/revisao';
import { StateType } from '../../../../redux/state';
import { buildDescricaoRevisaoElemento, buildDescricaoRevisaoFromStateType, formatarOperacoesRevisao, rotuloDoTipoPorNumero } from '../../../../redux/elemento/util/revisaoUtil';
import { APLICAR_REVISOES } from '../../acao/aplicarRevisoes';
import { criaDispositivo, createArticulacao } from '../../dispositivo/dispositivoLexmlFactory';
import { buscaDispositivoById, getArticulacao, getDispositivoAndFilhosAsLista, getUltimoFilho, isDispositivoAlteracao } from '../../hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../tipo/tipoDispositivo';
import { comparaNumeracao } from '../../numeracao/numeracaoUtil';
import { buildId, updateIdDispositivoAndFilhos } from '../../util/idUtil';
import { RevisaoArticulacaoLida } from '../documentoArticulado';
import { buildDispositivoSoltoFromJsonix } from './buildProjetoNormaFromJsonix';
import { calculaIdBase, criaHospedeiro, getDestinoDeCriacao } from './revisaoArticulacao';

const clone = <T>(valor: T): T => JSON.parse(JSON.stringify(valor));

const argumentoDe = (lida: RevisaoArticulacaoLida, nome: string): string | undefined => lida.operacoes.find(o => o.nome === nome)?.argumento;

const temOperacao = (lida: RevisaoArticulacaoLida, nome: string): boolean => lida.operacoes.some(o => o.nome === nome);

const nomeDoTipo = (nome: string): string => Object.values(TipoDispositivo).find(t => t.tipo.toLowerCase() === nome)?.tipo ?? nome;

// Mesma referência de pai que createElemento produz; o caput é transparente.
const referenciaDoPai = (pai: Dispositivo): Referencia => {
  const efetivo = isCaput(pai) ? pai.pai! : pai;
  const alteracao = isDispositivoAlteracao(efetivo) ? getArticulacao(efetivo).pai : undefined;
  return {
    tipo: efetivo.tipo,
    uuid: efetivo.uuid,
    uuid2: efetivo.uuid2,
    lexmlId: efetivo.id,
    uuidAlteracao: alteracao?.uuid,
    uuid2Alteracao: alteracao?.uuid2,
    existeNaNormaAlterada: efetivo.existeNaNormaAlterada,
  };
};

const novaRevisao = (stateType: StateType, lida: RevisaoArticulacaoLida, antes: Partial<Elemento> | undefined, apos: Partial<Elemento>): RevisaoElemento => {
  const revisao = new RevisaoElemento(APLICAR_REVISOES, stateType, '', lida.usuario, lida.dataHora, antes, apos);
  revisao.revisao = formatarOperacoesRevisao(lida.operacoes);
  if (stateType === StateType.ElementoIncluido && antes) {
    revisao.descricao = buildDescricaoRevisaoFromStateType(revisao, apos as Elemento);
  } else if (stateType === StateType.ElementoModificado) {
    revisao.descricao = buildDescricaoRevisaoElemento(revisao);
  }
  return revisao;
};

const comTexto = (elemento: Elemento, texto?: string): Elemento => {
  const copia = clone(elemento);
  if (texto !== undefined) {
    copia.conteudo = { ...copia.conteudo, texto };
  }
  return copia;
};

// Artigo: sequencial entre todos os artigos; o lugar de origem é antes do artigo que o seguia (ou depois do último).
const origemDoArtigoMovido = (artigo: Dispositivo, posicaoOriginal: number): { pai: Referencia; posicao: number } | undefined => {
  const artigos = (getArticulacao(artigo) as Articulacao).artigos.filter(a => a !== artigo);
  const seguinte = artigos[posicaoOriginal - 1];
  const referencia = seguinte ?? artigos[artigos.length - 1];
  if (!referencia?.pai) {
    return undefined;
  }
  const irmaos = referencia.pai.filhos.filter(f => f !== artigo);
  return { pai: referenciaDoPai(referencia.pai), posicao: irmaos.indexOf(referencia) + (seguinte ? 0 : 1) };
};

const origemDaMovimentacao = (dispositivo: Dispositivo, apos: Elemento, posicaoOriginal: number): { pai: Referencia; posicao: number } | undefined =>
  isArtigo(dispositivo) && !isDispositivoAlteracao(dispositivo)
    ? origemDoArtigoMovido(dispositivo, posicaoOriginal)
    : { pai: clone(apos.hierarquia!.pai!), posicao: posicaoOriginal - 1 };

const NIVEL_DO_TIPO: Record<string, number> = { Inciso: 1, Alinea: 2, Item: 3 };
const TIPO_DO_NIVEL = ['', 'Inciso', 'Alinea', 'Item'];

// Heurística (TAB/SHIFT_TAB, um nível): o arquivo guarda só o tipo original, não o lugar de origem.
const origemDaTransformacao = (dispositivo: Dispositivo, tipoOriginal: string): { pai: Referencia; posicao: number } | undefined => {
  const nivelOriginal = NIVEL_DO_TIPO[tipoOriginal];
  const nivelAtual = NIVEL_DO_TIPO[dispositivo.tipo];
  if (!nivelOriginal || !nivelAtual || !dispositivo.pai) {
    return undefined;
  }
  if (nivelAtual > nivelOriginal) {
    const paiAtual = dispositivo.pai;
    const avo = paiAtual.pai;
    return avo ? { pai: referenciaDoPai(avo), posicao: avo.indexOf(paiAtual) + 1 } : undefined;
  }
  const irmaos = dispositivo.pai.filhos;
  const anterior = irmaos[irmaos.indexOf(dispositivo) - 1];
  return anterior ? { pai: referenciaDoPai(anterior), posicao: anterior.filhos.length } : undefined;
};

// Os descendentes acompanham a transformação da principal: o mesmo deslocamento de nível.
const tipoOriginalDoDescendente = (tipoAtual: string | undefined, tipoOriginalDaPrincipal: string, tipoAtualDaPrincipal: string): string | undefined => {
  const deslocamento = NIVEL_DO_TIPO[tipoAtualDaPrincipal] - NIVEL_DO_TIPO[tipoOriginalDaPrincipal];
  const nivel = NIVEL_DO_TIPO[tipoAtual ?? ''];
  return Number.isNaN(deslocamento) || !nivel ? tipoAtual : TIPO_DO_NIVEL[nivel - deslocamento] ?? tipoAtual;
};

// Deriva número e rótulo anteriores do id (só em alteração de norma, onde o rótulo vem do id); id de outro tipo não se deriva.
const derivaRotuloDoId = (dispositivo: Dispositivo, idOriginal: string): { numero: string; rotulo: string } | undefined => {
  const segmento = (id: string): string => id.substring(id.lastIndexOf('_') + 1);
  const atual = /^([a-z]+)/.exec(segmento(dispositivo.id ?? ''));
  const original = /^([a-z]+)(\d+(?:-\d+)*)(u?)$/.exec(segmento(idOriginal));
  if (!atual || !original || atual[1] !== original[1] || !dispositivo.pai || !isDispositivoAlteracao(dispositivo)) {
    return undefined;
  }
  const hospedeiro = criaHospedeiro(createArticulacao(), dispositivo.pai);
  const sonda = criaDispositivo(getDestinoDeCriacao(hospedeiro, { tipo: dispositivo.tipo }), dispositivo.tipo);
  if (original[3] && dispositivo.tipo === TipoDispositivo.paragrafo.tipo) {
    sonda.createNumeroFromRotulo('Parágrafo único.');
  } else {
    sonda.numero = original[2];
  }
  sonda.createRotulo(sonda);
  return sonda.numero && sonda.rotulo ? { numero: sonda.numero, rotulo: sonda.rotulo } : undefined;
};

const reconstroiRevisoesDeDispositivo = (articulacao: Articulacao, lida: RevisaoArticulacaoLida): RevisaoElemento[] => {
  const dispositivo = buscaDispositivoById(articulacao, lida.refIdDispositivo!);
  if (!dispositivo) {
    return [];
  }
  const elementos = getElementos(dispositivo, false, true);

  if (temOperacao(lida, 'adicionado')) {
    return elementos.map(e => novaRevisao(StateType.ElementoIncluido, lida, undefined, clone(e)));
  }

  const posicaoOriginal = argumentoDe(lida, 'movido');
  const nomeTipoOriginal = argumentoDe(lida, 'transformado');

  // Com transformação o id original tem o prefixo do tipo antigo e o rótulo anterior já sai do tipo original.
  const idOriginal = nomeTipoOriginal ? undefined : argumentoDe(lida, 'alteracaoRotulo');
  const rotuloOriginal = idOriginal ? derivaRotuloDoId(dispositivo, idOriginal) : undefined;
  if (idOriginal && !rotuloOriginal) {
    return [];
  }
  const comRotuloOriginal = (antes: Elemento): Elemento => {
    if (idOriginal && rotuloOriginal) {
      antes.lexmlId = idOriginal;
      antes.numero = rotuloOriginal.numero;
      antes.rotulo = rotuloOriginal.rotulo;
      antes.hierarquia = { ...antes.hierarquia, numero: rotuloOriginal.numero };
    }
    return antes;
  };

  if (!posicaoOriginal && !nomeTipoOriginal) {
    return [novaRevisao(StateType.ElementoModificado, lida, comRotuloOriginal(comTexto(elementos[0], lida.textoAnterior)), clone(elementos[0]))];
  }

  const tipoOriginal = nomeTipoOriginal && nomeDoTipo(nomeTipoOriginal);
  return elementos.map((apos, i) => {
    const antes = comTexto(apos, i === 0 ? lida.textoAnterior : undefined);
    if (i === 0) {
      comRotuloOriginal(antes);
      if (tipoOriginal) {
        antes.tipo = tipoOriginal;
      }
      const origem = posicaoOriginal ? origemDaMovimentacao(dispositivo, apos, Number(posicaoOriginal)) : origemDaTransformacao(dispositivo, tipoOriginal!);
      if (origem) {
        antes.hierarquia = { ...antes.hierarquia, pai: origem.pai, posicao: origem.posicao };
      }
    } else if (tipoOriginal) {
      antes.tipo = tipoOriginalDoDescendente(apos.tipo, tipoOriginal, elementos[0].tipo!);
      antes.rotulo = rotuloDoTipoPorNumero(antes.tipo, apos.numero) ?? apos.rotulo;
    }
    return novaRevisao(StateType.ElementoIncluido, lida, antes, clone(apos));
  });
};

interface LugarDaExclusao {
  pai: Dispositivo;
  posicao: number;
  ocupante?: Dispositivo;
}

// Inverso de calculaIdBase: o ocupante atual do id-base marca o lugar; sem ocupante, é o fim do pai (ou o primeiro lugar que reproduz o id).
const localizaLugarDaExclusao = (articulacao: Articulacao, base: string, tipo: string): LugarDaExclusao | undefined => {
  const ocupante = buscaDispositivoById(articulacao, base);
  if (ocupante?.pai && ocupante.tipo === tipo) {
    return { pai: ocupante.pai, posicao: ocupante.pai.indexOf(ocupante), ocupante };
  }
  if (tipo === TipoDispositivo.artigo.tipo) {
    const emAlteracao = /^(.+)_cpt_alt\d+_art(\d+(?:-\d+)*)$/.exec(base);
    const bloco = emAlteracao && (buscaDispositivoById(articulacao, emAlteracao[1]) as Artigo | undefined)?.alteracoes;
    if (bloco) {
      // Em alteração o id vem do rótulo: o artigo volta antes do primeiro irmão de número maior.
      const seguinte = bloco.filhos.findIndex(f => isArtigo(f) && comparaNumeracao(f.numero, emAlteracao![2]) < 0);
      return { pai: bloco, posicao: seguinte === -1 ? bloco.filhos.length : seguinte };
    }
    const ultimo = articulacao.artigos[articulacao.artigos.length - 1];
    return ultimo?.pai ? { pai: ultimo.pai, posicao: ultimo.pai.indexOf(ultimo) + 1 } : { pai: articulacao, posicao: articulacao.filhos.length };
  }
  const pai = buscaDispositivoById(articulacao, base.substring(0, base.lastIndexOf('_')));
  if (!pai) {
    return undefined;
  }
  const destino = getDestinoDeCriacao(pai, { tipo });
  const amostra = { tipo } as Elemento;
  for (let posicao = 0; posicao <= destino.filhos.length; posicao++) {
    amostra.hierarquia = { posicao };
    if (calculaIdBase(pai, amostra) === base) {
      return { pai: destino, posicao };
    }
  }
  return { pai: destino, posicao: destino.filhos.length };
};

interface ExclusaoLida {
  lida: RevisaoArticulacaoLida;
  base: string;
  sequencial: number;
  lugar: LugarDaExclusao;
}

const prefixa = (valor: string | undefined, idTemporario: string, base: string): string | undefined =>
  valor?.startsWith(idTemporario) ? base + valor.substring(idTemporario.length) : valor;

const reconstroiRevisoesDeExclusao = (exclusao: ExclusaoLida, anterior: Referencia | undefined): RevisaoElemento[] => {
  const { lida, base, lugar } = exclusao;
  const temporaria = createArticulacao();
  const hospedeiro = criaHospedeiro(temporaria, lugar.pai);
  const raiz = buildDispositivoSoltoFromJsonix(getDestinoDeCriacao(hospedeiro, { tipo: lida.excluido!.name.localPart }), lida.excluido);
  updateIdDispositivoAndFilhos(temporaria);
  const idTemporario = buildId(raiz);
  const elementos = getElementos(raiz, false, false).map(e => {
    e.lexmlId = prefixa(e.lexmlId, idTemporario, base);
    e.hierarquia!.pai!.lexmlId = prefixa(e.hierarquia!.pai!.lexmlId, idTemporario, base);
    return e;
  });
  elementos[0].hierarquia = { ...elementos[0].hierarquia, pai: referenciaDoPai(lugar.pai), posicao: lugar.posicao };
  elementos[0].elementoAnteriorNaSequenciaDeLeitura = anterior;

  const revisoes = elementos.map(e => novaRevisao(StateType.ElementoRemovido, lida, clone(e), { ...clone(e), acoesPossiveis: [] }));
  const porUuid = new Map<number | undefined, RevisaoElemento>(elementos.map((e, i) => [e.uuid, revisoes[i]]));
  revisoes.slice(1).forEach((revisao, i) => {
    const pai = porUuid.get(elementos[i + 1].hierarquia?.pai?.uuid) ?? revisoes[0];
    revisao.idRevisaoElementoPai = pai.id;
    revisao.idRevisaoElementoPrincipal = revisoes[0].id;
  });
  return revisoes;
};

const idSequencial = /^_(.+)-exc(\d+)$/;

const reconstroiRevisoesDeExclusoes = (articulacao: Articulacao, lidas: RevisaoArticulacaoLida[]): RevisaoElemento[] => {
  const exclusoes: ExclusaoLida[] = [];
  lidas.forEach(lida => {
    const [, base, sequencial] = idSequencial.exec(lida.excluido?.value?.id ?? '') ?? [];
    const lugar = base && localizaLugarDaExclusao(articulacao, base, lida.excluido!.name.localPart);
    if (lugar) {
      exclusoes.push({ lida, base, sequencial: Number(sequencial), lugar });
    }
  });

  const lista = getDispositivoAndFilhosAsLista(articulacao);
  exclusoes.sort((a, b) => lista.indexOf(a.lugar.pai) - lista.indexOf(b.lugar.pai) || a.lugar.posicao - b.lugar.posicao || a.sequencial - b.sequencial);

  // O primeiro excluído do lugar tem como anterior o dispositivo que precede o ocupante; os seguintes encadeiam no último descendente do excluído anterior.
  return exclusoes.flatMap((exclusao, i) => {
    const anteriorNoMesmoLugar = i > 0 && exclusoes[i - 1].lugar.pai === exclusao.lugar.pai && exclusoes[i - 1].lugar.posicao === exclusao.lugar.posicao;
    const anterior: Referencia | undefined = anteriorNoMesmoLugar
      ? { tipo: exclusao.lida.excluido!.name.localPart, uuid2: '_encadeado', lexmlId: '_encadeado' }
      : exclusao.lugar.ocupante
      ? createElemento(exclusao.lugar.ocupante, false, true).elementoAnteriorNaSequenciaDeLeitura
      : createElemento(getUltimoFilho(exclusao.lugar.pai), false, false);
    return reconstroiRevisoesDeExclusao(exclusao, anterior);
  });
};

/**
 * Converte as revisões lidas do arquivo em `RevisaoElemento`, no formato que `aplicaRevisoes` espera, a partir da articulação já aberta.
 * Revisão que não se reconstrói (dispositivo inexistente, lugar não localizado) é ignorada, sem impedir as demais.
 */
export const reconstroiRevisoes = (articulacao: Articulacao, lidas: RevisaoArticulacaoLida[]): RevisaoElemento[] => {
  const tentar = <T>(fn: () => T[]): T[] => {
    try {
      return fn();
    } catch {
      return [];
    }
  };
  const naoExcluidas = lidas.filter(l => !l.excluido).flatMap(l => tentar(() => reconstroiRevisoesDeDispositivo(articulacao, l)));
  const excluidas = lidas.filter(l => l.excluido);
  const reconstruidas = excluidas.length ? tentar(() => reconstroiRevisoesDeExclusoes(articulacao, excluidas)) : [];
  return [...naoExcluidas, ...reconstruidas];
};
