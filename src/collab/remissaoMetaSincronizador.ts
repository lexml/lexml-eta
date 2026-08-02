import * as Y from 'yjs';
import { RemissaoInternaValue } from '../model/remissao';
import { GidRegistry } from './gid';
import { escreverRemissoesNoYMap, extrairEntradasSync, lerRemissoesDoYMap } from './remissaoMetaBinding';
import { StoreColaboracao } from './sincronizadorEstrutural';

// Fase 3c (fiação / A2.b): sincroniza os flags NÃO-DERIVÁVEIS da remissão interna. Em colaboração o único
// que precisa viajar é o tombstone (excluidaManualmente): o texto continua com a referência, então a
// re-detecção (A2.a) recriaria no outro cliente o link que alguém removeu manualmente. valida re-deriva
// (removeElemento em cada cliente) e revisao não ocorre (revisão × colaboração são exclusivos).

export const REMISSAO_LOCAL = 'remissao-local';

export interface AplicadorTombstone {
  // Aplica no editor os tombstones remotos de um dispositivo: marca o state e remove o link do DOM.
  aplicarTombstonesRemotos(uuid: number, chaves: string[]): void;
}

type YArrayDisp = Y.Array<Y.Map<unknown>>;

export class RemissaoMetaSincronizador {
  private arr: YArrayDisp;
  private unsubscribe?: () => void;
  private observer?: (events: Array<Y.YEvent<any>>, tx: Y.Transaction) => void;
  private aplicandoRemoto = false;
  private ultimaRemissoesRef: unknown = null;

  constructor(private doc: Y.Doc, private store: StoreColaboracao, private registry: GidRegistry, private aplicador: AplicadorTombstone) {
    this.arr = doc.getArray<Y.Map<unknown>>('articulacao');
  }

  ligar(): void {
    this.unsubscribe = this.store.subscribe(() => this.onStoreChange());
    this.observer = (events, tx): void => this.onYChange(events, tx);
    this.arr.observeDeep(this.observer);
  }

  desligar(): void {
    this.unsubscribe?.();
    if (this.observer) {
      this.arr.unobserveDeep(this.observer);
    }
    this.unsubscribe = undefined;
    this.observer = undefined;
  }

  private ymapPorGid(gid: string): Y.Map<unknown> | undefined {
    return this.arr.toArray().find(m => m.get('gid') === gid);
  }

  // --- LOCAL → Y ---
  private onStoreChange(): void {
    if (this.aplicandoRemoto) {
      return; // anti-eco: aplicação remota não volta ao Y
    }
    const remissoes: Record<number, RemissaoInternaValue[]> = this.store.getState().elementoReducer?.remissoes ?? {};
    if (remissoes === this.ultimaRemissoesRef) {
      return; // só reage quando o registro de remissões muda (referência imutável do reducer)
    }
    this.ultimaRemissoesRef = remissoes;
    this.doc.transact(() => {
      Object.entries(remissoes).forEach(([uuidStr, lista]) => {
        const gid = this.registry.gidDe(Number(uuidStr));
        const ymap = gid ? this.ymapPorGid(gid) : undefined;
        if (ymap) {
          escreverRemissoesNoYMap(ymap, extrairEntradasSync(lista));
        }
      });
    }, REMISSAO_LOCAL);
  }

  // --- Y → REDUX (remoto) ---
  private onYChange(events: Array<Y.YEvent<any>>, tx: Y.Transaction): void {
    if (tx.origin === REMISSAO_LOCAL) {
      return; // é o próprio eco
    }
    // Pega tanto mudanças DENTRO do sub-mapa "remissoes" (path o inclui) quanto sua CRIAÇÃO
    // (a chave 'remissoes' aparece no keysChanged do Y.Map do dispositivo).
    const tocouRemissoes = events.some(e => (e.path ?? []).includes('remissoes') || (e as Y.YMapEvent<unknown>).keysChanged?.has?.('remissoes'));
    if (!tocouRemissoes) {
      return; // só mudanças de remissão interessam (ignora estrutura/texto)
    }
    this.aplicandoRemoto = true;
    try {
      this.arr.forEach(ymap => {
        const uuid = this.registry.uuidDe(ymap.get('gid') as string);
        if (uuid === undefined) {
          return;
        }
        const chaves = lerRemissoesDoYMap(ymap)
          .filter(e => e.excluidaManualmente)
          .map(e => e.chave);
        if (chaves.length) {
          this.aplicador.aplicarTombstonesRemotos(uuid, chaves); // idempotente no editor
        }
      });
    } finally {
      this.aplicandoRemoto = false;
    }
  }
}
