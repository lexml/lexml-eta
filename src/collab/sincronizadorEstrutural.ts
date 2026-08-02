import * as Y from 'yjs';
import { Articulacao, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../model/dispositivo/situacao';
import { Elemento } from '../model/elemento';
import { AdicionarElemento } from '../model/lexml/acao/adicionarElementoAction';
import { AtualizarNotaAlteracao } from '../model/lexml/acao/atualizarNotaAlteracaoAction';
import { moverElementoAbaixoAction } from '../model/lexml/acao/moverElementoAbaixoAction';
import { removerElementoAction } from '../model/lexml/acao/removerElementoAction';
import { restaurarElementoAction } from '../model/lexml/acao/restaurarElemento';
import { suprimirElementoAction } from '../model/lexml/acao/suprimirElemento';
import { findDispositivoByUuid, getDispositivoCabecaAlteracao, percorreHierarquiaDispositivos } from '../model/lexml/hierarquia/hierarquiaUtil';
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

// gid → notaAlteracao (de meta.notaAlteracao) de cada Y.Map, para detectar mudança de nota remota.
// A nota é canônica no gid da cabeça-de-alteração (só ela carrega o campo no domínio).
export const lerNotas = (arr: YArrayDisp): Map<string, string | undefined> => {
  const m = new Map<string, string | undefined>();
  arr.forEach(ymap => m.set(ymap.get('gid') as string, (ymap.get('meta') as Y.Map<unknown> | undefined)?.get('notaAlteracao') as string | undefined));
  return m;
};

// gid → paiGid de cada Y.Map, para detectar reordenação de irmãos (mover) remota.
export const lerPaiGids = (arr: YArrayDisp): Map<string, string | null> => {
  const m = new Map<string, string | null>();
  arr.forEach(ymap => m.set(ymap.get('gid') as string, (ymap.get('paiGid') as string | null) ?? null));
  return m;
};

// Agrupa os gids por pai, preservando a ordem canônica (⇒ ordem entre irmãos).
const agruparFilhos = (ordem: string[], paiGids: Map<string, string | null>): Map<string | null, string[]> => {
  const grupos = new Map<string | null, string[]>();
  ordem.forEach(g => {
    const pai = paiGids.get(g) ?? null;
    (grupos.get(pai) ?? grupos.set(pai, []).get(pai)!).push(g);
  });
  return grupos;
};

const mesmoConjunto = (a: string[], b: string[]): boolean => a.length === b.length && new Set([...a, ...b]).size === a.length;
const mesmaOrdem = (a: string[], b: string[]): boolean => a.length === b.length && a.every((g, i) => g === b[i]);

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
  private notaShadow = new Map<string, string | undefined>();
  private paiGidShadow = new Map<string, string | null>();

  constructor(private doc: Y.Doc, private store: StoreColaboracao, private registry: GidRegistry) {
    this.arr = doc.getArray<Y.Map<unknown>>('articulacao');
  }

  ligar(): void {
    this.popularRegistry();
    this.atualizarShadows();
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
    // Mudança de nota de alteração chega como ElementoModificado [original, alterado]; detecta pela
    // diferença de notaAlteracao entre os dois (O(1), distingue de edição de texto, que não muda a nota).
    const notaEventos = eventos.filter(
      e => e.stateType === StateType.ElementoModificado && (e.elementos?.length ?? 0) >= 2 && e.elementos![0].notaAlteracao !== e.elementos![1].notaAlteracao
    );
    if (!estruturais.length && !notaEventos.length) {
      return;
    }
    const articulacao: Articulacao = state.articulacao;
    // Um lote de "mover" emite Incluido ANTES de Removido com os mesmos gids; processar removes
    // primeiro evita duplicar o gid transitoriamente (deleta a posição antiga, depois reinsere).
    this.doc.transact(() => {
      estruturais.filter(e => e.stateType === StateType.ElementoRemovido).forEach(ev => this.removerDoYArray(ev));
      estruturais.filter(e => e.stateType === StateType.ElementoIncluido).forEach(ev => this.incluirNoYArray(ev, articulacao));
      estruturais.filter(e => e.stateType === StateType.ElementoSuprimido || e.stateType === StateType.ElementoRestaurado).forEach(ev => this.atualizarSituacaoNoYArray(ev));
      notaEventos.forEach(ev => this.atualizarNotaNoYArray(ev, articulacao));
    }, ORIGEM_LOCAL);
    this.atualizarShadows();
  }

  private atualizarShadows(): void {
    this.gidsShadow = lerGids(this.arr);
    this.situacaoShadow = lerSituacoes(this.arr);
    this.notaShadow = lerNotas(this.arr);
    this.paiGidShadow = lerPaiGids(this.arr);
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

  private atualizarNotaNoYArray(ev: StateEvent, articulacao: Articulacao): void {
    const alterado = ev.elementos?.[1];
    if (alterado?.uuid === undefined) {
      return;
    }
    const disp = findDispositivoByUuid(articulacao, alterado.uuid, true);
    // A nota é canônica na cabeça-de-alteração; o dispositivo do evento pode ser um membro do bloco.
    const cabeca = disp ? getDispositivoCabecaAlteracao(disp) : null;
    if (!cabeca?.gid) {
      return;
    }
    const idx = indiceDoGid(this.arr, cabeca.gid);
    if (idx < 0) {
      return;
    }
    const meta = this.arr.get(idx).get('meta') as Y.Map<unknown> | undefined;
    if (!meta) {
      return;
    }
    if (cabeca.notaAlteracao) {
      meta.set('notaAlteracao', cabeca.notaAlteracao);
    } else {
      meta.delete('notaAlteracao');
    }
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
    const notasMudadas = this.diffNotas(lerNotas(this.arr));
    const movidos = this.diffReorder(lerGids(this.arr), lerPaiGids(this.arr));
    if (!adicionados.length && !removidos.length && !situacoesMudadas.length && !notasMudadas.length && !movidos.length) {
      return;
    }
    this.aplicandoRemoto = true;
    try {
      removidos.forEach(gid => this.aplicarRemocaoRemota(gid));
      adicionados.forEach(gid => this.aplicarInclusaoRemota(gid));
      situacoesMudadas.forEach(({ gid, situacao }) => this.aplicarSituacaoRemota(gid, situacao));
      notasMudadas.forEach(({ gid, nota }) => this.aplicarNotaRemota(gid, nota));
      movidos.forEach(gid => this.aplicarMoveRemoto(gid));
    } finally {
      this.aplicandoRemoto = false;
      this.atualizarShadows();
      this.popularRegistry(); // uuids da subárvore movida/criada podem ter mudado
    }
  }

  // Reorder de irmãos: para cada pai com o MESMO conjunto de filhos em ordem diferente,
  // devolve o filho que "desceu" (novo índice > antigo) — reproduzido via moverElementoAbaixo.
  private diffReorder(gidsDepois: string[], paiGidsDepois: Map<string, string | null>): string[] {
    const antes = agruparFilhos(this.gidsShadow, this.paiGidShadow);
    const depois = agruparFilhos(gidsDepois, paiGidsDepois);
    const movidos: string[] = [];
    depois.forEach((seqDepois, pai) => {
      const seqAntes = antes.get(pai) ?? [];
      if (!mesmoConjunto(seqAntes, seqDepois) || mesmaOrdem(seqAntes, seqDepois)) {
        return; // add/remove sob esse pai, ou ordem inalterada
      }
      const desceu = seqDepois.find((g, i) => seqAntes.indexOf(g) < i);
      if (desceu) {
        movidos.push(desceu);
      }
    });
    return movidos;
  }

  private aplicarMoveRemoto(gid: string): void {
    const articulacao = this.store.getState().elementoReducer?.articulacao;
    const disp = articulacao ? buscarPorGid(articulacao, gid) : null;
    if (!disp) {
      return;
    }
    const el = { uuid: disp.uuid, gid } as Elemento;
    this.store.dispatch(moverElementoAbaixoAction.execute(el));
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

  // Só considera gids presentes antes E depois (add/remove já são tratados à parte).
  private diffNotas(depois: Map<string, string | undefined>): Array<{ gid: string; nota: string | undefined }> {
    const mudou: Array<{ gid: string; nota: string | undefined }> = [];
    depois.forEach((nota, gid) => {
      if (this.notaShadow.has(gid) && this.notaShadow.get(gid) !== nota) {
        mudou.push({ gid, nota });
      }
    });
    return mudou;
  }

  private aplicarNotaRemota(gid: string, nota: string | undefined): void {
    const articulacao = this.store.getState().elementoReducer?.articulacao;
    const disp = articulacao ? buscarPorGid(articulacao, gid) : null;
    if (!disp) {
      return;
    }
    const el = { uuid: disp.uuid, gid } as Elemento;
    // '' limpa a nota no reducer (action.notaAlteracao || undefined).
    this.store.dispatch(new AtualizarNotaAlteracao().execute(el, nota ?? ''));
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

    // Referência de inserção guard-safe (o reducer só adiciona irmão de mesmo tipo, exceto com posicao='antes'):
    //  (1) sucessor de mesmo pai ⇒ inserir 'antes' dele (sempre aceito); (2) predecessor ⇒ inserir depois;
    //  (3) sem irmãos ⇒ 'filho' do próprio pai.
    const predecessor = this.gidPredecessorMesmoPai(idx, paiGid);
    const sucessor = this.gidSucessorMesmoPai(idx, paiGid);
    let refGid: string | undefined;
    let posicao: string | undefined;
    if (sucessor) {
      refGid = sucessor;
      posicao = 'antes';
    } else if (predecessor) {
      refGid = predecessor;
      posicao = undefined;
    } else {
      refGid = paiGid ?? undefined;
      posicao = 'filho';
    }
    const refDisp = refGid && articulacao ? buscarPorGid(articulacao, refGid) : null;
    if (!refDisp) {
      return;
    }
    const refEl = { uuid: refDisp.uuid, gid: refDisp.gid } as Elemento;

    this.store.dispatch(new AdicionarElemento(tipoDispositivoPorNome(tipo), posicao).execute(refEl, conteudo));
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

  private gidSucessorMesmoPai(idx: number, paiGid: string | null): string | undefined {
    for (let i = idx + 1; i < this.arr.length; i++) {
      const m = this.arr.get(i);
      if ((m.get('paiGid') as string | null) === paiGid) {
        return m.get('gid') as string;
      }
    }
    return undefined;
  }
}
