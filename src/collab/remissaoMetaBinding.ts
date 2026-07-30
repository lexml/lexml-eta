import * as Y from 'yjs';
import { RemissaoInternaValue } from '../model/remissao';

// Fase 3c (núcleo puro): sincronização dos FLAGS NÃO-DERIVÁVEIS da remissão interna.
// O corpo do link é re-detectado por cada cliente (adicionaRemissaoInterna); só viajam
// valida/revisao/excluidaManualmente, chaveados pela IDENTIDADE SEMÂNTICA (inicio, targetLexmlId,
// textoRef) — a mesma chave tripla da lógica de tombstone. O refId é gerado localmente e não serve
// de chave entre clientes.

const SEP = '␟'; // separador improvável no texto

export interface FlagsRemissao {
  valida?: boolean;
  revisao?: true;
  excluidaManualmente?: true;
}

export interface EntradaRemissaoSync extends FlagsRemissao {
  chave: string;
}

export const chaveRemissao = (r: Pick<RemissaoInternaValue, 'inicio' | 'targetLexmlId' | 'textoRef'>): string =>
  [r.inicio ?? '', r.targetLexmlId ?? '', r.textoRef ?? ''].join(SEP);

const temFlagNaoDerivavel = (r: RemissaoInternaValue): boolean => r.valida === false || r.revisao === true || r.excluidaManualmente === true;

const flagsDe = (r: RemissaoInternaValue | EntradaRemissaoSync): FlagsRemissao => {
  const f: FlagsRemissao = {};
  if (r.valida === false) {
    f.valida = false;
  }
  if (r.revisao === true) {
    f.revisao = true;
  }
  if (r.excluidaManualmente === true) {
    f.excluidaManualmente = true;
  }
  return f;
};

// Extrai as entradas a sincronizar — só as remissões com algum flag não-derivável.
export const extrairEntradasSync = (remissoes: RemissaoInternaValue[]): EntradaRemissaoSync[] =>
  remissoes.filter(temFlagNaoDerivavel).map(r => ({ chave: chaveRemissao(r), ...flagsDe(r) }));

// Escreve as entradas no Y.Map do dispositivo (sub-Y.Map "remissoes" chaveado pela chave semântica).
// Substitui, nunca acumula (invariante do registry). Cria o sub-mapa sob demanda (seed intocado).
export const escreverRemissoesNoYMap = (yMapDispositivo: Y.Map<unknown>, entradas: EntradaRemissaoSync[]): void => {
  let mapa = yMapDispositivo.get('remissoes') as Y.Map<FlagsRemissao> | undefined;
  if (!mapa) {
    mapa = new Y.Map<FlagsRemissao>();
    yMapDispositivo.set('remissoes', mapa);
  }
  Array.from(mapa.keys()).forEach(k => mapa!.delete(k));
  entradas.forEach(({ chave, ...flags }) => mapa!.set(chave, flags));
};

export const lerRemissoesDoYMap = (yMapDispositivo: Y.Map<unknown>): EntradaRemissaoSync[] => {
  const mapa = yMapDispositivo.get('remissoes') as Y.Map<FlagsRemissao> | undefined;
  if (!mapa) {
    return [];
  }
  return Array.from(mapa.entries()).map(([chave, flags]) => ({ chave, ...flags }));
};

// Aplica os flags sincronizados às remissões re-detectadas (por chave) e reinjeta tombstones
// (excluidaManualmente sem link detectado correspondente) para bloquear a recriação.
export const aplicarEntradasSync = (detectadas: RemissaoInternaValue[], entradas: EntradaRemissaoSync[]): RemissaoInternaValue[] => {
  const porChave = new Map(entradas.map(e => [e.chave, e]));
  const resultado = detectadas.map(r => {
    const e = porChave.get(chaveRemissao(r));
    if (!e) {
      return r;
    }
    porChave.delete(e.chave);
    return { ...r, ...flagsDe(e) };
  });

  porChave.forEach(e => {
    if (e.excluidaManualmente) {
      const [inicio, targetLexmlId, textoRef] = e.chave.split(SEP);
      resultado.push({
        refId: '',
        excluidaManualmente: true,
        inicio: inicio ? Number(inicio) : undefined,
        targetLexmlId: targetLexmlId || undefined,
        textoRef: textoRef || undefined,
      });
    }
  });
  return resultado;
};
