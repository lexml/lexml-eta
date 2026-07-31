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

// Store fake com um mini-reducer: ao receber ADICIONAR_ELEMENTO, cria o dispositivo de verdade
// (fábrica), emite ElementoIncluido e notifica — exercitando o anti-eco na fronteira do sync.
class StoreSimulado implements StoreColaboracao {
  private state: any;
  private listeners: Array<() => void> = [];
  dispatched: any[] = [];
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
    this.dispatched.push(action);
    if (action.type === ADICIONAR_ELEMENTO) {
      const ref: Dispositivo | null = findDispositivoByUuid(this.state.elementoReducer.articulacao, action.atual.uuid, true);
      const pai = ref?.pai ?? this.state.elementoReducer.articulacao;
      const novo = criaDispositivo(pai, action.novo.tipo);
      novo.texto = action.novo?.conteudo?.texto ?? '';
      this.emitir([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(novo, false)], referencia: action.atual }]);
    }
    return action;
  }
}

class EditorSimulado implements EditorTextoColab {
  aplicados: OpDelta[][] = [];
  constructor(private ranges: RangeBlot[]) {}
  rangesRenderizados(): RangeBlot[] {
    return this.ranges;
  }
  aplicarDeltaSilent(ops: OpDelta[]): void {
    this.aplicados.push(ops);
  }
}

interface Cliente {
  doc: Y.Doc;
  articulacao: Articulacao;
  art1: Artigo;
  store: StoreSimulado;
  editor: EditorSimulado;
  sincEstrutural: SincronizadorEstrutural;
  sincTexto: TextoSincronizador;
}

const OFFSET = 5;

// Cada cliente constrói sua própria árvore (objetos independentes) e semeia seu Y.Doc.
// O seed determinístico dá gids idênticos ⇒ ancestralidade compartilhada entre A e B.
const criarCliente = (clientId: number): Cliente => {
  const articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  doc.clientID = clientId; // identidade CRDT própria para edições ao vivo

  const store = new StoreSimulado(articulacao);
  const sincEstrutural = new SincronizadorEstrutural(doc, store, new GidRegistry());
  sincEstrutural.ligar();

  const editor = new EditorSimulado([{ gid: art1.caput!.gid!, offset: OFFSET, tamanho: 'Caput.'.length }]);
  const sincTexto = new TextoSincronizador(doc, editor);
  sincTexto.observarRenderizados();

  return { doc, articulacao, art1, store, editor, sincEstrutural, sincTexto };
};

const sincronizar = (de: Cliente, para: Cliente): void => {
  Y.applyUpdate(para.doc, Y.encodeStateAsUpdate(de.doc, Y.encodeStateVector(para.doc)));
};

const textoDoCaput = (c: Cliente): string => {
  const arr = c.doc.getArray<Y.Map<unknown>>('articulacao');
  const idx = lerGids(arr).indexOf(c.art1.caput!.gid!);
  return (arr.get(idx).get('conteudo') as Y.Text).toString();
};

test('integração: inclusão estrutural em A propaga para B, converge e não ecoa (sem duplicação)', () => {
  const a = criarCliente(1);
  const b = criarCliente(2);

  // A adiciona um parágrafo (o "reducer" de A já rodou: cria o dispositivo e emite o evento).
  const par = criaDispositivo(a.art1, TipoDispositivo.paragrafo.tipo);
  par.texto = 'Novo parágrafo.';
  a.store.emitir([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par, false)], referencia: createElemento(a.art1.caput!, false) }]);

  sincronizar(a, b);

  // B recebeu a instrução de adicionar, e os dois Y.Docs convergiram sem duplicar o gid.
  assert.ok(
    b.store.dispatched.some(x => x.type === ADICIONAR_ELEMENTO),
    'B recebeu ADICIONAR_ELEMENTO'
  );
  const gidsA = lerGids(a.doc.getArray<Y.Map<unknown>>('articulacao'));
  const gidsB = lerGids(b.doc.getArray<Y.Map<unknown>>('articulacao'));
  assert.deepStrictEqual(gidsB, gidsA, 'Y.Docs convergiram (mesmos gids, sem duplicação)');
  assert.strictEqual(gidsA.filter(g => g === par.gid).length, 1);
});

test('integração: digitação em A propaga para o texto e o Quill de B', () => {
  const a = criarCliente(1);
  const b = criarCliente(2);

  a.sincTexto.onDeltaLocal([{ retain: OFFSET }, { insert: 'X' }]); // 'XCaput.' em A
  sincronizar(a, b);

  assert.strictEqual(textoDoCaput(a), 'XCaput.');
  assert.strictEqual(textoDoCaput(b), 'XCaput.', 'texto convergiu em B');
  assert.ok(b.editor.aplicados.length >= 1, 'o Quill de B recebeu a edição remota');
});

test('integração: estrutura (A) e texto (B) concorrentes convergem nos dois lados', () => {
  const a = criarCliente(1);
  const b = criarCliente(2);

  // Concorrentes: A adiciona um parágrafo; B digita no caput.
  const par = criaDispositivo(a.art1, TipoDispositivo.paragrafo.tipo);
  par.texto = 'Parágrafo de A.';
  a.store.emitir([{ stateType: StateType.ElementoIncluido, elementos: [createElemento(par, false)], referencia: createElemento(a.art1.caput!, false) }]);
  b.sincTexto.onDeltaLocal([{ retain: OFFSET }, { insert: 'Z' }]); // 'ZCaput.' em B

  // Sync bidirecional.
  sincronizar(a, b);
  sincronizar(b, a);

  const gidsA = lerGids(a.doc.getArray<Y.Map<unknown>>('articulacao'));
  const gidsB = lerGids(b.doc.getArray<Y.Map<unknown>>('articulacao'));
  assert.deepStrictEqual(gidsB, gidsA, 'estrutura convergiu nos dois lados');
  assert.ok(gidsA.includes(par.gid!), 'o parágrafo de A está presente');
  assert.strictEqual(textoDoCaput(a), 'ZCaput.');
  assert.strictEqual(textoDoCaput(b), 'ZCaput.', 'texto de B convergiu nos dois lados');
});
