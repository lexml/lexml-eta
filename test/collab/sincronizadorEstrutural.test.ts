import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo, Dispositivo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../src/model/lexml/acao/removerElementoAction';
import { SUPRIMIR_ELEMENTO } from '../../src/model/lexml/acao/suprimirElemento';
import { RESTAURAR_ELEMENTO } from '../../src/model/lexml/acao/restaurarElemento';
import { MOVER_ELEMENTO_ABAIXO } from '../../src/model/lexml/acao/moverElementoAbaixoAction';
import { DescricaoSituacao } from '../../src/model/dispositivo/situacao';
import { StateEvent, StateType } from '../../src/redux/state';
import { GidRegistry } from '../../src/collab/gid';
import { dispositivoParaYMap, projetoNormaToYDoc } from '../../src/collab/ydocConverter';
import { diffGids, lerGids, SincronizadorEstrutural, StoreColaboracao } from '../../src/collab/sincronizadorEstrutural';

// Fake store: guarda estado + eventos, registra dispatches, e permite notificar assinantes.
class FakeStore implements StoreColaboracao {
  private state: any;
  private listeners: Array<() => void> = [];
  dispatched: any[] = [];
  constructor(articulacao: Articulacao) {
    this.state = { elementoReducer: { articulacao, ui: { events: [] as StateEvent[] } } };
  }
  getState(): any {
    return this.state;
  }
  dispatch(action: any): any {
    this.dispatched.push(action);
    return action;
  }
  subscribe(l: () => void): () => void {
    this.listeners.push(l);
    return () => (this.listeners = this.listeners.filter(x => x !== l));
  }
  setEvents(events: StateEvent[]): void {
    this.state.elementoReducer.ui.events = events;
  }
  notificar(): void {
    this.listeners.forEach(l => l());
  }
}

// Articulação base: um artigo com caput. projetoNormaToYDoc grava os gids determinísticos de volta.
const montarBase = (): { articulacao: Articulacao; art1: Artigo; doc: Y.Doc } => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput do artigo primeiro.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  return { articulacao, art1, doc };
};

// Base com dois parágrafos irmãos (par1, par2) já semeados, para testar reordenação.
const montarComDoisParagrafos = (): { articulacao: Articulacao; art1: Artigo; par1: Dispositivo; par2: Dispositivo; doc: Y.Doc } => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput.';
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'Parágrafo primeiro.';
  const par2 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par2.texto = 'Parágrafo segundo.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  return { articulacao, art1, par1, par2, doc };
};

test('helper diffGids identifica adicionados e removidos', () => {
  const r = diffGids(['a', 'b', 'c'], ['a', 'c', 'd']);
  assert.deepStrictEqual(r.adicionados, ['d']);
  assert.deepStrictEqual(r.removidos, ['b']);
});

test('local: ElementoIncluido insere Y.Map na posição do irmão, com gid/tipo/conteúdo', () => {
  const { articulacao, art1, doc } = montarBase();
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'Texto do parágrafo.';

  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  store.setEvents([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par1, false)], referencia: createElemento(art1.caput!, false) }]);
  store.notificar();

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  const gids = lerGids(arr);
  assert.ok(gids.includes(par1.gid!), 'par1 deve estar no Y.Array');
  assert.strictEqual(gids[gids.indexOf(art1.caput!.gid!) + 1], par1.gid, 'par1 logo após o caput');
  const ymap = arr.get(gids.indexOf(par1.gid!));
  assert.strictEqual(ymap.get('tipo'), 'Paragrafo');
  assert.strictEqual((ymap.get('conteudo') as Y.Text).toString(), 'Texto do parágrafo.');
  assert.strictEqual(store.dispatched.length, 0, 'anti-eco: op local não redispacha ao Redux');
});

test('local: ElementoRemovido deleta o Y.Map do gid', () => {
  const { articulacao, art1, doc } = montarBase();
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'a remover;';

  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  // primeiro inclui
  store.setEvents([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par1, false)], referencia: createElemento(art1.caput!, false) }]);
  store.notificar();
  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  assert.ok(lerGids(arr).includes(par1.gid!));

  // depois remove
  store.setEvents([{ stateType: StateType.ElementoRemovido, elementos: [createElemento(par1, false)] }]);
  store.notificar();
  assert.ok(!lerGids(arr).includes(par1.gid!), 'par1 removido do Y.Array');
});

test('remoto: inserção externa no Y.Array dispara ADICIONAR_ELEMENTO com tipo e referência corretos', () => {
  const { articulacao, art1, doc } = montarBase();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  // simula um par de outro cliente: Y.Map com paiGid = art1, inserido após o caput, origem != LOCAL
  const remoto = new Y.Map<unknown>();
  remoto.set('gid', 'remoto-par-1');
  remoto.set('tipo', 'Paragrafo');
  remoto.set('paiGid', art1.gid);
  const t = new Y.Text();
  t.insert(0, 'parágrafo remoto');
  remoto.set('conteudo', t);
  remoto.set('meta', new Y.Map());
  const idxCaput = lerGids(arr).indexOf(art1.caput!.gid!);
  doc.transact(() => arr.insert(idxCaput + 1, [remoto]), 'remote');

  assert.strictEqual(store.dispatched.length, 1);
  const acao = store.dispatched[0];
  assert.strictEqual(acao.type, ADICIONAR_ELEMENTO);
  assert.strictEqual(acao.novo.tipo, 'Paragrafo');
  assert.strictEqual(acao.atual.uuid, art1.caput!.uuid, 'referência = caput (predecessor de mesmo pai)');
});

test('remoto: deleção externa no Y.Array dispara REMOVER_ELEMENTO do dispositivo certo', () => {
  const { articulacao, art1, doc } = montarBase();
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'x;';
  // insere par1 no doc (via caminho local) para depois removê-lo remotamente
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();
  store.setEvents([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par1, false)], referencia: createElemento(art1.caput!, false) }]);
  store.notificar();
  store.dispatched = [];

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  doc.transact(() => arr.delete(lerGids(arr).indexOf(par1.gid!), 1), 'remote');

  assert.strictEqual(store.dispatched.length, 1);
  assert.strictEqual(store.dispatched[0].type, REMOVER_ELEMENTO);
  assert.strictEqual(store.dispatched[0].atual.uuid, par1.uuid);
});

const metaSituacao = (doc: Y.Doc, gid: string): string | undefined => {
  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  const idx = lerGids(arr).indexOf(gid);
  return (arr.get(idx).get('meta') as Y.Map<unknown>).get('situacao') as string | undefined;
};

test('local: ElementoSuprimido/Restaurado atualiza meta.situacao no Y.Map', () => {
  const { articulacao, art1, doc } = montarBase();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  store.setEvents([{ stateType: StateType.ElementoSuprimido, elementos: [{ gid: art1.gid, descricaoSituacao: DescricaoSituacao.DISPOSITIVO_SUPRIMIDO } as any] }]);
  store.notificar();
  assert.strictEqual(metaSituacao(doc, art1.gid!), DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
  assert.strictEqual(store.dispatched.length, 0, 'anti-eco: supressão local não redispacha');

  store.setEvents([{ stateType: StateType.ElementoRestaurado, elementos: [{ gid: art1.gid, descricaoSituacao: DescricaoSituacao.DISPOSITIVO_ORIGINAL } as any] }]);
  store.notificar();
  assert.strictEqual(metaSituacao(doc, art1.gid!), DescricaoSituacao.DISPOSITIVO_ORIGINAL);
});

test('remoto: meta.situacao → Suprimido dispara SUPRIMIR_ELEMENTO do dispositivo certo', () => {
  const { articulacao, art1, doc } = montarBase();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  const idx = lerGids(arr).indexOf(art1.gid!);
  doc.transact(() => (arr.get(idx).get('meta') as Y.Map<unknown>).set('situacao', DescricaoSituacao.DISPOSITIVO_SUPRIMIDO), 'remote');

  assert.strictEqual(store.dispatched.length, 1);
  assert.strictEqual(store.dispatched[0].type, SUPRIMIR_ELEMENTO);
  assert.strictEqual(store.dispatched[0].atual.uuid, art1.uuid);
});

test('remoto: meta.situacao → Original dispara RESTAURAR_ELEMENTO', () => {
  const { articulacao, art1, doc } = montarBase();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  const idx = lerGids(arr).indexOf(art1.gid!);
  doc.transact(() => (arr.get(idx).get('meta') as Y.Map<unknown>).set('situacao', DescricaoSituacao.DISPOSITIVO_ORIGINAL), 'remote');

  assert.strictEqual(store.dispatched.length, 1);
  assert.strictEqual(store.dispatched[0].type, RESTAURAR_ELEMENTO);
  assert.strictEqual(store.dispatched[0].atual.uuid, art1.uuid);
});

test('local: mover (Removido+Incluido no mesmo lote) reposiciona o gid, sem duplicar', () => {
  const { articulacao, par1, par2, doc } = montarComDoisParagrafos();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  // ordem realista do reducer de mover: Incluido ANTES de Removido, mesmos gids.
  store.setEvents([
    { stateType: StateType.ElementoIncluido, elementos: [createElemento(par1, false)], referencia: createElemento(par2, false) },
    { stateType: StateType.ElementoRemovido, elementos: [createElemento(par1, false)] },
  ]);
  store.notificar();

  const gids = lerGids(doc.getArray<Y.Map<unknown>>('articulacao'));
  assert.strictEqual(gids.filter(g => g === par1.gid).length, 1, 'par1 não pode ficar duplicado');
  assert.ok(gids.indexOf(par2.gid!) < gids.indexOf(par1.gid!), 'par1 passou para depois de par2');
});

test('remoto: reordenação de irmãos no Y.Array dispara MOVER_ELEMENTO_ABAIXO no gid que desceu', () => {
  const { articulacao, par1, par2, doc } = montarComDoisParagrafos();
  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sinc.ligar();

  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  doc.transact(() => {
    const i1 = lerGids(arr).indexOf(par1.gid!);
    arr.delete(i1, 2); // par1, par2 são adjacentes
    arr.insert(i1, [dispositivoParaYMap(par2), dispositivoParaYMap(par1)]); // trocados
  }, 'remote');

  assert.strictEqual(store.dispatched.length, 1);
  assert.strictEqual(store.dispatched[0].type, MOVER_ELEMENTO_ABAIXO);
  assert.strictEqual(store.dispatched[0].atual.uuid, par1.uuid, 'move o par1 (que desceu) para baixo');
});

test('convergência: reordenação em A propaga a nova ordem para B', () => {
  const { par1, par2, doc: docA } = montarComDoisParagrafos();
  const arr = docA.getArray<Y.Map<unknown>>('articulacao');
  docA.transact(() => {
    const i1 = lerGids(arr).indexOf(par1.gid!);
    arr.delete(i1, 2);
    arr.insert(i1, [dispositivoParaYMap(par2), dispositivoParaYMap(par1)]);
  }, 'remote');

  const docB = new Y.Doc();
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  const gidsB = lerGids(docB.getArray<Y.Map<unknown>>('articulacao'));
  assert.ok(gidsB.indexOf(par2.gid!) < gidsB.indexOf(par1.gid!), 'B vê par2 antes de par1');
});

test('convergência: inclusão local em A propaga para o Y.Doc de B pelo sync', () => {
  const { articulacao, art1, doc: docA } = montarBase();
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'convergente;';

  const store = new FakeStore(articulacao);
  const sinc = new SincronizadorEstrutural(docA, store, new GidRegistry());
  sinc.ligar();
  store.setEvents([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par1, false)], referencia: createElemento(art1.caput!, false) }]);
  store.notificar();

  const docB = new Y.Doc();
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  const gidsB = lerGids(docB.getArray<Y.Map<unknown>>('articulacao'));
  assert.ok(gidsB.includes(par1.gid!), 'par1 chegou ao Y.Doc de B');
});
