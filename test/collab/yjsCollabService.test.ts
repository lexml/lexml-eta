import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { EstadoColaboracao, ParametrosColaboracao, PersistenciaColaboracao, ProviderColaboracao, UsuarioColaboracao, YjsCollabService } from '../../src/collab/yjsCollabService';

const montarProjetoNorma = (): ProjetoNorma => {
  const articulacao: Articulacao = createArticulacao();
  const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
  art.texto = 'Caput do artigo primeiro.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  return projetoNorma;
};

const PARAMS: ParametrosColaboracao = { roomId: 'sala-1', wsUrl: 'ws://sidecar/collab', token: 'tok-123' };
const USUARIO: UsuarioColaboracao = { nome: 'Fulano', id: 42, sigla: 'SF' };

// Provider fake controlável: captura o handler de status para simular connect/disconnect.
class FakeProvider implements ProviderColaboracao {
  private handler?: (e: { status: string }) => void;
  desconectado = false;
  destruido = false;
  on(_evento: 'status', cb: (e: { status: string }) => void): void {
    this.handler = cb;
  }
  emitir(status: string): void {
    this.handler?.({ status });
  }
  disconnect(): void {
    this.desconectado = true;
  }
  destroy(): void {
    this.destruido = true;
  }
}

class FakePersistencia implements PersistenciaColaboracao {
  destruido = false;
  destroy(): void {
    this.destruido = true;
  }
}

test('feature OFF: sem params de colaboração ⇒ DESLIGADO e nenhum Y.Doc', () => {
  const svc = new YjsCollabService();
  svc.attach(undefined, montarProjetoNorma(), USUARIO);
  assert.strictEqual(svc.estado, EstadoColaboracao.DESLIGADO);
  assert.strictEqual(svc.yDoc, undefined);
  assert.strictEqual(svc.ativo, false);
});

test('feature OFF: usuário anônimo ⇒ DESLIGADO (gate de UX)', () => {
  const svc = new YjsCollabService();
  svc.attach(PARAMS, montarProjetoNorma(), { nome: 'Anônimo' });
  assert.strictEqual(svc.estado, EstadoColaboracao.DESLIGADO);
  assert.strictEqual(YjsCollabService.isAnonimo({ nome: 'Anônimo' }), true);
  assert.strictEqual(YjsCollabService.isAnonimo({ nome: 'Fulano', id: 1 }), false);
});

test('attach semeia Y.Doc local e entra em LOCAL antes de qualquer rede', () => {
  const provider = new FakeProvider();
  const persistencia = new FakePersistencia();
  const svc = new YjsCollabService({ criarProvider: () => provider, criarPersistencia: () => persistencia });

  svc.attach(PARAMS, montarProjetoNorma(), USUARIO);

  assert.strictEqual(svc.estado, EstadoColaboracao.LOCAL);
  assert.ok(svc.yDoc instanceof Y.Doc, 'Y.Doc local deve existir');
  assert.ok(svc.yDoc!.getArray('articulacao').length > 0, 'Y.Doc deve estar semeado');
});

test('status connected ⇒ CONECTADO; disconnected ⇒ volta a LOCAL sem perder o Y.Doc (keep-local)', () => {
  const provider = new FakeProvider();
  const svc = new YjsCollabService({ criarProvider: () => provider, criarPersistencia: () => new FakePersistencia(), timeoutConexaoMs: 10000 });
  svc.attach(PARAMS, montarProjetoNorma(), USUARIO);

  provider.emitir('connected');
  assert.strictEqual(svc.estado, EstadoColaboracao.CONECTADO);

  const docAntes = svc.yDoc;
  provider.emitir('disconnected');
  assert.strictEqual(svc.estado, EstadoColaboracao.LOCAL);
  assert.strictEqual(svc.yDoc, docAntes, 'o Y.Doc não pode ser desanexado na queda do transporte');
});

test('degradação: sem fábrica de provider ⇒ permanece LOCAL (app editável/salvável)', () => {
  const svc = new YjsCollabService({ criarPersistencia: () => new FakePersistencia() });
  svc.attach(PARAMS, montarProjetoNorma(), USUARIO);
  assert.strictEqual(svc.estado, EstadoColaboracao.LOCAL);
  assert.ok(svc.yDoc instanceof Y.Doc);
});

test('detach desconecta só o transporte; destruir libera tudo', () => {
  const provider = new FakeProvider();
  const persistencia = new FakePersistencia();
  const svc = new YjsCollabService({ criarProvider: () => provider, criarPersistencia: () => persistencia });
  svc.attach(PARAMS, montarProjetoNorma(), USUARIO);
  provider.emitir('connected');

  svc.detach();
  assert.ok(provider.desconectado && provider.destruido);
  assert.strictEqual(svc.estado, EstadoColaboracao.LOCAL, 'Y.Doc segue vivo após detach');
  assert.ok(svc.yDoc instanceof Y.Doc);

  svc.destruir();
  assert.ok(persistencia.destruido);
  assert.strictEqual(svc.estado, EstadoColaboracao.DESLIGADO);
  assert.strictEqual(svc.yDoc, undefined);
});

test('reconnect morno: edições offline dos dois lados convergem no sync (sem código bespoke)', () => {
  // dois clientes partem do MESMO seed determinístico (Fase 0) ⇒ ancestralidade compartilhada.
  const docA = new YjsCollabService({ criarProvider: () => new FakeProvider(), clientId: 1 });
  const docB = new YjsCollabService({ criarProvider: () => new FakeProvider(), clientId: 2 });
  docA.attach(PARAMS, montarProjetoNorma(), USUARIO);
  docB.attach(PARAMS, montarProjetoNorma(), USUARIO);
  const a = docA.yDoc!;
  const b = docB.yDoc!;

  // "offline": cada lado edita seu próprio Y.Doc (o clientID real difere do seed=0).
  a.transact(() => (a.getArray('articulacao').get(0) as Y.Map<unknown>).set('marcaA', 'x'));
  b.transact(() => (b.getArray('articulacao').get(0) as Y.Map<unknown>).set('marcaB', 'y'));

  // "reconnect": troca de state vectors e merge nativo do Yjs.
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b, Y.encodeStateVector(a)));
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a, Y.encodeStateVector(b)));

  const mapA = a.getArray('articulacao').get(0) as Y.Map<unknown>;
  const mapB = b.getArray('articulacao').get(0) as Y.Map<unknown>;
  assert.strictEqual(mapA.get('marcaA'), 'x');
  assert.strictEqual(mapA.get('marcaB'), 'y');
  assert.strictEqual(mapB.get('marcaA'), 'x');
  assert.strictEqual(mapB.get('marcaB'), 'y');
  assert.deepStrictEqual(Array.from(Y.encodeStateAsUpdate(a)), Array.from(Y.encodeStateAsUpdate(b)));
});
