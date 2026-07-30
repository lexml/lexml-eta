import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../src/model/lexml/acao/removerElementoAction';
import { StateEvent, StateType } from '../../src/redux/state';
import { GidRegistry } from '../../src/collab/gid';
import { projetoNormaToYDoc } from '../../src/collab/ydocConverter';
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
