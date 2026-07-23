import { Articulacao, Dispositivo } from '../dispositivo/dispositivo';
import { findDispositivoByUuid } from '../lexml/hierarquia/hierarquiaUtil';
import { RemissaoInternaValue } from './remissao';
import {
  compartilhamAncestralDoTipo,
  extrairSufixoContextual,
  foiEditadoManualmente,
  isTextoCanonicoParaId,
  isTextoReconhecivel,
  possuiQualificadorExplicito,
  textoCanonicoDoDispositivo,
  textoCanonicoLocal,
  textoCanonicoRelativoATipo,
} from './lexmlIdUtil';

// Fase 4/5 do plano de simplificação (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md): recalcula o
// registro de remissões a partir do estado ATUAL da articulação, resolvendo cada entrada por
// targetUuid (âncora estável) em vez do diff de lexmlId antigo/novo propagado por evento.
export const sincronizarRemissoesComEstadoAtual = (articulacao: Articulacao, registro: Record<number, RemissaoInternaValue[]>): Record<number, RemissaoInternaValue[]> => {
  const atualizado: Record<number, RemissaoInternaValue[]> = {};

  for (const [uuidStr, entries] of Object.entries(registro)) {
    atualizado[Number(uuidStr)] = entries.map(entry => sincronizarEntrada(articulacao, entry));
  }

  return atualizado;
};

// Duas representações possíveis de "onde está o texto do link dentro de origem.texto":
//   1. Carregado de um documento salvo, ou já sincronizado uma vez (inicializaRemissoesAoAbrir,
//      corrigirLexmlRefsObsoletosNoTexto): o texto já é HTML, com <a data-ref-id="X">texto</a> —
//      não tem `inicio` gravado, mas é localizável por regex procurando data-ref-id.
//   2. Detectado ao vivo, ainda não salvo (adicionaRemissaoInterna): dispositivo.texto é texto
//      puro, sem <a> (o link só existe no DOM do Quill) — só `inicio` + `textoRef` localizam a
//      posição, não tem tag pra buscar.
// Tenta (1) primeiro; cai para (2) se não achar link HTML com esse refId.
interface LocalizacaoTexto {
  textoAtual: string;
  via: 'html' | 'posicao';
}

const construirRegexLinkPorRefId = (refId: string): RegExp => new RegExp(`(<a\\b[^>]*data-ref-id="${refId}"[^>]*>)([^<]*)(</a>)`, 'i');

const localizarTextoAtual = (origemTexto: string, entry: RemissaoInternaValue): LocalizacaoTexto | undefined => {
  if (entry.refId) {
    const match = origemTexto.match(construirRegexLinkPorRefId(entry.refId));
    if (match) return { textoAtual: match[2], via: 'html' };
  }
  if (entry.inicio !== undefined && entry.textoRef !== undefined) {
    return { textoAtual: origemTexto.substring(entry.inicio, entry.inicio + entry.textoRef.length), via: 'posicao' };
  }
  return undefined;
};

const aplicarTextoNovo = (origemTexto: string, entry: RemissaoInternaValue, textoAtual: string, textoNovo: string, lexmlIdNovo: string, via: 'html' | 'posicao'): string => {
  if (via === 'html') {
    return origemTexto.replace(construirRegexLinkPorRefId(entry.refId!), (_match, abertura, _conteudoAntigo, fechamento) => {
      const aberturaAtualizada = abertura.replace(/data-lexml-ref="[^"]*"/, `data-lexml-ref="${lexmlIdNovo}"`);
      return `${aberturaAtualizada}${textoNovo}${fechamento}`;
    });
  }
  const inicio = entry.inicio!;
  // Usa o tamanho do texto ATUAL (não o de entry.textoRef, que pode estar congelado desde uma
  // divergência anterior e não corresponder mais ao trecho realmente presente em origemTexto).
  const tamanhoAtual = textoAtual.length;
  return origemTexto.substring(0, inicio) + textoNovo + origemTexto.substring(inicio + tamanhoAtual);
};

const sincronizarEntrada = (articulacao: Articulacao, entry: RemissaoInternaValue): RemissaoInternaValue => {
  if (entry.valida === false || entry.targetUuid === undefined || entry.sourceUuid === undefined) {
    return entry;
  }

  const destino = findDispositivoByUuid(articulacao as unknown as Dispositivo, entry.targetUuid, true);
  if (!destino?.id || destino.id === entry.targetLexmlId) {
    // Não encontrado (invalidação é responsabilidade do fluxo de remoção) ou nada mudou.
    return entry;
  }

  const origem = findDispositivoByUuid(articulacao as unknown as Dispositivo, entry.sourceUuid, true);
  if (!origem?.texto) {
    return entry;
  }

  const localizacao = localizarTextoAtual(origem.texto, entry);
  if (!localizacao) {
    // Não foi possível localizar o texto atual (nem HTML por data-ref-id, nem posição gravada):
    // preserva o texto e sinaliza revisão, mesmo espírito do fluxo hoje (marcarRemissaoPendenteRevisaoAction).
    return { ...entry, targetLexmlId: destino.id, revisao: true };
  }

  const textoAtual = localizacao.textoAtual;

  // Nota D6 do plano: texto arbitrário/livre (ex.: remissão manual "o dispositivo mencionado
  // acima") nunca deve ser regenerado, mesmo que bata com o textoRef gravado — D6 só decide se
  // uma referência RECONHECÍVEL foi editada; isTextoReconhecivel decide se vale a pena tentar
  // regenerar em primeiro lugar.
  if (!isTextoReconhecivel(textoAtual)) {
    return { ...entry, targetLexmlId: destino.id, revisao: true };
  }

  // Duas formas de aceitar o texto atual como "seguro para regenerar": (a) ainda é exatamente o
  // último texto que o sistema gravou (D6), ou (b) mesmo divergindo do gravado, o usuário já
  // restaurou manualmente para a forma canônica esperada do alvo ANTES desta renumeração — sem
  // essa segunda checagem, uma entrada marcada revisao:true numa renumeração nunca mais sairia
  // desse estado sozinha, mesmo que o texto já estivesse de volta ao padrão correto.
  const aindaBateComGravado = !foiEditadoManualmente(textoAtual, entry.textoRef);
  const restauradoParaCanonicoDoAlvoAntigo = !!entry.targetLexmlId && isTextoCanonicoParaId(textoAtual, entry.targetLexmlId);

  if (!aindaBateComGravado && !restauradoParaCanonicoDoAlvoAntigo) {
    return { ...entry, targetLexmlId: destino.id, revisao: true };
  }

  const sufixo = extrairSufixoContextual(textoAtual);
  let textoNovo: string;
  if (sufixo && compartilhamAncestralDoTipo(origem, destino, sufixo.tipo)) {
    textoNovo = `${textoCanonicoRelativoATipo(destino, sufixo.tipo)} ${sufixo.texto}`;
  } else if (!sufixo && !possuiQualificadorExplicito(textoAtual)) {
    // D4 do plano de simplificação: referência "enxuta" (ex.: "inciso I", sem "do art. X") — nunca
    // ganha uma cadeia de qualificadores que não tinha originalmente. Só corrige o segmento local se
    // a posição do próprio alvo dentro do seu pai imediato mudou de fato.
    textoNovo = textoCanonicoLocal(destino);
  } else {
    textoNovo = textoCanonicoDoDispositivo(destino);
  }

  if (textoNovo !== textoAtual) {
    origem.texto = aplicarTextoNovo(origem.texto, entry, textoAtual, textoNovo, destino.id, localizacao.via);
  }

  // Chegar até aqui significa que esta sincronização decidiu que é seguro auto-atualizar — limpa
  // um eventual `revisao:true` de uma divergência anterior, senão a repintura (moduloRemissao.ts)
  // continuaria tratando a entrada como "preservar texto" para sempre, mesmo já resolvida.
  return { ...entry, targetLexmlId: destino.id, textoRef: textoNovo, revisao: undefined };
};
