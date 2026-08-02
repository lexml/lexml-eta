import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { RemissaoInternaValue } from '../../src/model/remissao';
import { GidRegistry } from '../../src/collab/gid';
import { projetoNormaToYDoc } from '../../src/collab/ydocConverter';
import { chaveRemissao, escreverRemissoesNoYMap, extrairEntradasSync, lerRemissoesDoYMap } from '../../src/collab/remissaoMetaBinding';
import { AplicadorTombstone, RemissaoMetaSincronizador } from '../../src/collab/remissaoMetaSincronizador';

class FakeStore {
  state: any;
  private listeners: Array<() => void> = [];
  constructor() {
    this.state = { elementoReducer: { remissoes: {} as Record<number, RemissaoInternaValue[]> } };
  }
  getState(): any {
    return this.state;
  }
  dispatch(a: any): any {
    return a;
  }
  subscribe(l: () => void): () => void {
    this.listeners.push(l);
    return () => (this.listeners = this.listeners.filter(x => x !== l));
  }
  setRemissoes(r: Record<number, RemissaoInternaValue[]>): void {
    this.state.elementoReducer.remissoes = r; // nova referência ⇒ o sync reage
  }
  notificar(): void {
    this.listeners.forEach(l => l());
  }
}

class FakeAplicador implements AplicadorTombstone {
  chamadas: Array<{ uuid: number; chaves: string[] }> = [];
  aplicarTombstonesRemotos(uuid: number, chaves: string[]): void {
    this.chamadas.push({ uuid, chaves });
  }
}

// Doc com um artigo (o caput é o dispositivo-fonte da remissão).
const montar = (): { doc: Y.Doc; caputGid: string; caputUuid: number; registry: GidRegistry } => {
  const articulacao: Articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'vide art. 2º';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  const registry = new GidRegistry();
  registry.registrar(art1.caput!.gid!, art1.caput!.uuid!);
  return { doc, caputGid: art1.caput!.gid!, caputUuid: art1.caput!.uuid!, registry };
};

const ymapDe = (doc: Y.Doc, gid: string): Y.Map<unknown> =>
  doc
    .getArray<Y.Map<unknown>>('articulacao')
    .toArray()
    .find(m => m.get('gid') === gid)!;

const tombstone = (uuid: number): RemissaoInternaValue => ({ refId: 'r1', inicio: 5, targetLexmlId: 'art2', textoRef: 'art. 2º', sourceUuid: uuid, excluidaManualmente: true });

test('local: tombstone em state.remissoes é escrito no Y.Map do gid-fonte', () => {
  const { doc, caputGid, caputUuid, registry } = montar();
  const store = new FakeStore();
  const aplicador = new FakeAplicador();
  new RemissaoMetaSincronizador(doc, store as any, registry, aplicador).ligar();

  store.setRemissoes({ [caputUuid]: [tombstone(caputUuid)] });
  store.notificar();

  const entradas = lerRemissoesDoYMap(ymapDe(doc, caputGid));
  assert.strictEqual(entradas.length, 1);
  assert.strictEqual(entradas[0].chave, chaveRemissao(tombstone(caputUuid)));
  assert.strictEqual(entradas[0].excluidaManualmente, true);
  assert.strictEqual(aplicador.chamadas.length, 0, 'anti-eco: escrita local não chama o aplicador');
});

test('remoto: tombstone externo no Y.Map dispara aplicarTombstonesRemotos(uuid, [chave])', () => {
  const { doc, caputGid, caputUuid, registry } = montar();
  const store = new FakeStore();
  const aplicador = new FakeAplicador();
  new RemissaoMetaSincronizador(doc, store as any, registry, aplicador).ligar();

  doc.transact(() => escreverRemissoesNoYMap(ymapDe(doc, caputGid), extrairEntradasSync([tombstone(caputUuid)])), 'remote');

  assert.strictEqual(aplicador.chamadas.length, 1);
  assert.strictEqual(aplicador.chamadas[0].uuid, caputUuid);
  assert.deepStrictEqual(aplicador.chamadas[0].chaves, [chaveRemissao(tombstone(caputUuid))]);
});

test('convergência: tombstone criado em A propaga o flag para o Y.Doc de B', () => {
  const a = montar();
  const storeA = new FakeStore();
  new RemissaoMetaSincronizador(a.doc, storeA as any, a.registry, new FakeAplicador()).ligar();

  storeA.setRemissoes({ [a.caputUuid]: [tombstone(a.caputUuid)] });
  storeA.notificar();

  const docB = new Y.Doc();
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(a.doc));
  const entradasB = lerRemissoesDoYMap(ymapDe(docB, a.caputGid));
  assert.strictEqual(entradasB.find(e => e.excluidaManualmente)?.chave, chaveRemissao(tombstone(a.caputUuid)));
});
