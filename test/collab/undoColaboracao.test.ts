import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo, Dispositivo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { findDispositivoByUuid } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { StateEvent, StateType } from '../../src/redux/state';
import { GidRegistry } from '../../src/collab/gid';
import { lerGids, SincronizadorEstrutural, StoreColaboracao } from '../../src/collab/sincronizadorEstrutural';
import { EditorTextoColab, RangeBlot, TextoSincronizador } from '../../src/collab/textoSincronizador';
import { OpDelta } from '../../src/collab/textoBinding';
import { projetoNormaToYDoc } from '../../src/collab/ydocConverter';
import { UndoColaboracao } from '../../src/collab/undoColaboracao';

class StoreSimulado implements StoreColaboracao {
  private state: any;
  private listeners: Array<() => void> = [];
  constructor(articulacao: Articulacao) {
    this.state = { elementoReducer: { articulacao, ui: { events: [] as StateEvent[] } } };
  }
  getState(): any {
    return this.state;
  }
  subscribe(l: () => void): () => void {
    this.listeners.push(l);
    return () => (this.listeners = this.listeners.filter(x => x !== l));
  }
  private notificar(): void {
    this.listeners.forEach(l => l());
  }
  emitir(events: StateEvent[]): void {
    this.state.elementoReducer.ui.events = events;
    this.notificar();
  }
  dispatch(action: any): any {
    if (action.type === ADICIONAR_ELEMENTO) {
      const ref: Dispositivo | null = findDispositivoByUuid(this.state.elementoReducer.articulacao, action.atual.uuid, true);
      const pai = ref?.pai ?? this.state.elementoReducer.articulacao;
      const novo = criaDispositivo(pai, action.novo.tipo);
      this.emitir([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(novo, false)], referencia: action.atual }]);
    }
    return action;
  }
}

class EditorSimulado implements EditorTextoColab {
  constructor(private ranges: RangeBlot[]) {}
  rangesRenderizados(): RangeBlot[] {
    return this.ranges;
  }
  aplicarDeltaSilent(): void {
    /* no-op no teste */
  }
}

interface Cliente {
  doc: Y.Doc;
  art1: Artigo;
  store: StoreSimulado;
  sincTexto: TextoSincronizador;
  undoColab: UndoColaboracao;
}

const OFFSET = 5;

const criarCliente = (clientId: number): Cliente => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  doc.clientID = clientId;

  const store = new StoreSimulado(articulacao);
  new SincronizadorEstrutural(doc, store, new GidRegistry()).ligar();
  const sincTexto = new TextoSincronizador(doc, new EditorSimulado([{ gid: art1.caput!.gid!, offset: OFFSET, tamanho: 'Caput.'.length }]));
  sincTexto.observarRenderizados();
  const undoColab = new UndoColaboracao(doc); // criado após os sincronizadores

  return { doc, art1, store, sincTexto, undoColab };
};

const sincronizar = (de: Cliente, para: Cliente): void => {
  Y.applyUpdate(para.doc, Y.encodeStateAsUpdate(de.doc, Y.encodeStateVector(para.doc)));
};

const gids = (c: Cliente): string[] => lerGids(c.doc.getArray<Y.Map<unknown>>('articulacao'));
const adicionar = (c: Cliente, texto: string): Dispositivo => {
  const par = criaDispositivo(c.art1, TipoDispositivo.paragrafo.tipo);
  par.texto = texto;
  c.store.emitir([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par, false)], referencia: createElemento(c.art1.caput!, false) }]);
  return par;
};
const textoCaput = (c: Cliente): string => {
  const arr = c.doc.getArray<Y.Map<unknown>>('articulacao');
  return (arr.get(lerGids(arr).indexOf(c.art1.caput!.gid!)).get('conteudo') as Y.Text).toString();
};

test('undo estrutural desfaz só a própria inclusão e propaga a remoção', () => {
  const a = criarCliente(1);
  const b = criarCliente(2);

  const parA = adicionar(a, 'de A');
  const parB = adicionar(b, 'de B');
  sincronizar(a, b);
  sincronizar(b, a);
  assert.ok(gids(a).includes(parA.gid!) && gids(a).includes(parB.gid!), 'ambos presentes antes do undo');

  a.undoColab.undo(); // desfaz só a inclusão de A (a de B chegou como remota, não rastreada)
  sincronizar(a, b);

  assert.ok(!gids(a).includes(parA.gid!), 'parágrafo de A desfeito');
  assert.ok(gids(a).includes(parB.gid!), 'parágrafo de B preservado');
  assert.deepStrictEqual(gids(b), gids(a), 'convergiu nos dois lados');
});

test('redo reaplica a inclusão desfeita', () => {
  const a = criarCliente(1);
  const par = adicionar(a, 'x');
  assert.ok(gids(a).includes(par.gid!));

  a.undoColab.undo();
  assert.ok(!gids(a).includes(par.gid!));
  a.undoColab.redo();
  assert.ok(gids(a).includes(par.gid!), 'reaplicado pelo redo');
});

test('1 ação = 1 passo: undo remove só a última inclusão', () => {
  const a = criarCliente(1);
  const par1 = adicionar(a, 'primeiro');
  const par2 = adicionar(a, 'segundo');

  a.undoColab.undo(); // só o segundo
  assert.ok(gids(a).includes(par1.gid!), 'primeiro permanece');
  assert.ok(!gids(a).includes(par2.gid!), 'segundo desfeito');
});

test('undo de texto reverte a digitação', () => {
  const a = criarCliente(1);
  a.sincTexto.onDeltaLocal([{ retain: OFFSET }, { insert: 'X' }] as OpDelta[]);
  assert.strictEqual(textoCaput(a), 'XCaput.');

  a.undoColab.undo();
  assert.strictEqual(textoCaput(a), 'Caput.', 'texto revertido');
});

test('mudança remota não é desfazível pelo undo local', () => {
  const a = criarCliente(1);
  const b = criarCliente(2);
  adicionar(b, 'de B');
  sincronizar(b, a); // chega em A como remota

  assert.strictEqual(a.undoColab.podeDesfazer(), false, 'A não tem nada local a desfazer');
});
