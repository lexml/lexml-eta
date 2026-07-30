import * as Y from 'yjs';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { Elemento } from '../model/elemento';
import { AdicionarElemento } from '../model/lexml/acao/adicionarElementoAction';
import { removerElementoAction } from '../model/lexml/acao/removerElementoAction';
import { restaurarElementoAction } from '../model/lexml/acao/restaurarElemento';
import { suprimirElementoAction } from '../model/lexml/acao/suprimirElemento';
import { findDispositivoByUuid, percorreHierarquiaDispositivos } from '../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../model/lexml/tipo/tipoDispositivo';
import { StateEvent, StateType } from '../redux/state';
import { GidRegistry } from './gid';
import { dispositivoParaYMap } from './ydocConverter';

// Fase 2a: sincronização estrutural (add/remove) entre o Redux e o Y.Array, com anti-eco.
// Origem de transação usada nas ops locais: o observer remoto a ignora (é o próprio eco).
export const ORIGEM_LOCAL = 'redux-local';

export interface StoreColaboracao {
  getState(): any;
  dispatch(action: any): any;
  subscribe(listener: () => void): () => void;
}

type YArrayDisp = Y.Array<Y.Map<unknown>>;

// --- helpers puros (testáveis isoladamente) ---

export const lerGids = (arr: YArrayDisp): string[] => arr.map(m => m.get('gid') as string);

export const indiceDoGid = (arr: YArrayDisp, gid: string): number => lerGids(arr).indexOf(gid);

// gid → situacao (de meta.situacao) de cada Y.Map, para detectar supressão/restauração remota.
export const lerSituacoes = (arr: YArrayDisp): Map<string, string | undefined> => {
  const m = new Map<string, string | undefined>();
  arr.forEach(ymap => m.set(ymap.get('gid') as string, (ymap.get('meta') as Y.Map<unknown> | undefined)?.get('situacao') as string | undefined));
  return m;
};

export const diffGids = (antes: string[], depois: string[]): { adicionados: string[]; removidos: string[] } => {
  const setAntes = new Set(antes);
  const setDepois = new Set(depois);
  return {
    adicionados: depois.filter(g => !setAntes.has(g)),
    removidos: antes.filter(g => !setDepois.has(g)),
  };
};

const tipoDispositivoPorNome = (tipo: string) => Object.values(TipoDispositivo).find(t => t.tipo === tipo);

const buscarPorGid = (articulacao: Articulacao, gid: string): Dispositivo | null => {
  let achado: Dispositivo | null = null;
  percorreHierarquiaDispositivos(articulacao, d => {
    if (d.gid === gid) {
      achado = d;
    }
  });
  return achado;
};

export class SincronizadorEstrutural {
  private arr: YArrayDisp;
  private unsubscribe?: () => void;
  private observer?: (events: Array<Y.YEvent<any>>, tx: Y.Transaction) => void;
  private aplicandoRemoto = false;
  private gidsShadow: string[] = [];
  private situacaoShadow = new Map<string, string | undefined>();

  constructor(private doc: Y.Doc, private store: StoreColaboracao, private registry: GidRegistry) {
    this.arr = doc.getArray<Y.Map<unknown>>('articulacao');
  }

  ligar(): void {
    this.popularRegistry();
    this.gidsShadow = lerGids(this.arr);
    this.situacaoShadow = lerSituacoes(this.arr);
    this.unsubscribe = this.store.subscribe(() => this.onStoreChange());
    this.observer = (_events, tx): void => this.onYArrayChange(tx);
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

  private popularRegistry(): void {
    const articulacao = this.store.getState().elementoReducer?.articulacao;
    if (!articulacao) {
      return;
    }
    percorreHierarquiaDispositivos(articulacao, d => {
      if (d.gid && d.uuid !== undefined) {
        this.registry.registrar(d.gid, d.uuid);
      }
    });
  }

  // --- LOCAL → Y.Array ---

  private onStoreChange(): void {
    if (this.aplicandoRemoto) {
      return; // anti-eco: mutação originada de op remota não volta ao Y.Array
    }
    const state = this.store.getState().elementoReducer;
    const eventos: StateEvent[] = state?.ui?.events ?? [];
    const estruturais = eventos.filter(
      e =>
        e.stateType === StateType.ElementoIncluido ||
        e.stateType === StateType.ElementoRemovido ||
        e.stateType === StateType.ElementoSuprimido ||
        e.stateType === StateType.ElementoRestaurado
    );
    if (!estruturais.length) {
      return;
    }
    const articulacao: Articulacao = state.articulacao;
    this.doc.transact(() => {
      estruturais.forEach(ev => {
        switch (ev.stateType) {
          case StateType.ElementoIncluido:
            this.incluirNoYArray(ev, articulacao);
            break;
          case StateType.ElementoRemovido:
            this.removerDoYArray(ev);
            break;
          case StateType.ElementoSuprimido:
          case StateType.ElementoRestaurado:
            this.atualizarSituacaoNoYArray(ev);
            break;
        }
      });
    }, ORIGEM_LOCAL);
    this.gidsShadow = lerGids(this.arr);
    this.situacaoShadow = lerSituacoes(this.arr);
  }

  private atualizarSituacaoNoYArray(ev: StateEvent): void {
    (ev.elementos ?? []).forEach(el => {
      if (!el.gid || !el.descricaoSituacao) {
        return;
      }
      const idx = indiceDoGid(this.arr, el.gid);
      if (idx < 0) {
        return;
      }
      (this.arr.get(idx).get('meta') as Y.Map<unknown> | undefined)?.set('situacao', el.descricaoSituacao);
    });
  }

  private incluirNoYArray(ev: StateEvent, articulacao: Articulacao): void {
    let refGid = ev.referencia?.gid;
    (ev.elementos ?? []).forEach(el => {
      const disp = el.uuid !== undefined ? findDispositivoByUuid(articulacao, el.uuid, true) : null;
      if (!disp?.gid || disp.uuid === undefined) {
        return;
      }
      this.registry.registrar(disp.gid, disp.uuid);
      const idxRef = refGid ? indiceDoGid(this.arr, refGid) : -1;
      const idx = idxRef >= 0 ? idxRef + 1 : this.arr.length;
      this.arr.insert(idx, [dispositivoParaYMap(disp)]);
      refGid = disp.gid; // encadeia inclusões do mesmo lote em sequência
    });
  }

  private removerDoYArray(ev: StateEvent): void {
    (ev.elementos ?? []).forEach(el => {
      if (!el.gid) {
        return;
      }
      const idx = indiceDoGid(this.arr, el.gid);
      if (idx >= 0) {
        this.arr.delete(idx, 1);
      }
    });
  }

  // --- Y.Array → REDUX (remoto) ---

  private onYArrayChange(tx: Y.Transaction): void {
    if (tx.origin === ORIGEM_LOCAL) {
      return; // é o próprio eco das ops locais
    }
    const { adicionados, removidos } = diffGids(this.gidsShadow, lerGids(this.arr));
    const situacoesMudadas = this.diffSituacoes(lerSituacoes(this.arr));
    if (!adicionados.length && !removidos.length && !situacoesMudadas.length) {
      return;
    }
    this.aplicandoRemoto = true;
    try {
      removidos.forEach(gid => this.aplicarRemocaoRemota(gid));
      adicionados.forEach(gid => this.aplicarInclusaoRemota(gid));
      situacoesMudadas.forEach(({ gid, situacao }) => this.aplicarSituacaoRemota(gid, situacao));
    } finally {
      this.aplicandoRemoto = false;
      this.gidsShadow = lerGids(this.arr);
      this.situacaoShadow = lerSituacoes(this.arr);
    }
  }

  // Só considera gids presentes antes E depois (add/remove já são tratados à parte).
  private diffSituacoes(depois: Map<string, string | undefined>): Array<{ gid: string; situacao: string | undefined }> {
    const mudou: Array<{ gid: string; situacao: string | undefined }> = [];
    depois.forEach((sit, gid) => {
      if (this.situacaoShadow.has(gid) && this.situacaoShadow.get(gid) !== sit) {
        mudou.push({ gid, situacao: sit });
      }
    });
    return mudou;
  }

  private aplicarSituacaoRemota(gid: string, situacao: string | undefined): void {
    const articulacao = this.store.getState().elementoReducer?.articulacao;
    const disp = articulacao ? buscarPorGid(articulacao, gid) : null;
    if (!disp) {
      return;
    }
    const el = { uuid: disp.uuid, gid } as Elemento;
    if (situacao === DescricaoSituacao.DISPOSITIVO_SUPRIMIDO) {
      this.store.dispatch(suprimirElementoAction.execute(el));
    } else if (situacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
      this.store.dispatch(restaurarElementoAction.execute(el));
    }
  }

  private aplicarRemocaoRemota(gid: string): void {
    const articulacao = this.store.getState().elementoReducer?.articulacao;
    const disp = articulacao ? buscarPorGid(articulacao, gid) : null;
    if (!disp) {
      return;
    }
    const el = { uuid: disp.uuid, gid } as Elemento;
    this.store.dispatch(removerElementoAction.execute(el, undefined));
  }

  private aplicarInclusaoRemota(gid: string): void {
    const idx = indiceDoGid(this.arr, gid);
    if (idx < 0) {
      return;
    }
    const ymap = this.arr.get(idx);
    const tipo = ymap.get('tipo') as string;
    const paiGid = ymap.get('paiGid') as string | null;
    const conteudo = (ymap.get('conteudo') as Y.Text).toString();
    const articulacao = this.store.getState().elementoReducer?.articulacao;

    // referência de inserção: irmão predecessor de mesmo pai; na falta, o próprio pai.
    const refGid = this.gidPredecessorMesmoPai(idx, paiGid) ?? paiGid ?? undefined;
    const refDisp = refGid && articulacao ? buscarPorGid(articulacao, refGid) : null;
    if (!refDisp) {
      return;
    }
    const refEl = { uuid: refDisp.uuid, gid: refDisp.gid } as Elemento;

    const acao = new AdicionarElemento(tipoDispositivoPorNome(tipo));
    this.store.dispatch(acao.execute(refEl, conteudo));
    this.reconciliarGidRecemCriado(gid);
  }

  // O dispositivo recém-criado localmente (uuid novo) adota o gid remoto — identidade compartilhada.
  private reconciliarGidRecemCriado(gid: string): void {
    const state = this.store.getState().elementoReducer;
    const evInclusao = (state?.ui?.events ?? []).filter((e: StateEvent) => e.stateType === StateType.ElementoIncluido).slice(-1)[0];
    const novo = evInclusao?.elementos?.[0];
    if (novo?.uuid === undefined || !state?.articulacao) {
      return;
    }
    const disp = findDispositivoByUuid(state.articulacao, novo.uuid, true);
    if (disp) {
      disp.gid = gid;
      this.registry.registrar(gid, disp.uuid!);
    }
  }

  private gidPredecessorMesmoPai(idx: number, paiGid: string | null): string | undefined {
    for (let i = idx - 1; i >= 0; i--) {
      const m = this.arr.get(i);
      if ((m.get('paiGid') as string | null) === paiGid) {
        return m.get('gid') as string;
      }
    }
    return undefined;
  }
}
