import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { corDeUsuario, cursorParaIndiceAbsoluto, indiceAbsolutoParaCursor, PresencaSincronizador } from '../../src/collab/presencaSincronizador';
import { RangeBlot } from '../../src/collab/textoSincronizador';

const RANGES: RangeBlot[] = [
  { gid: 'g1', offset: 5, tamanho: 10 },
  { gid: 'g2', offset: 20, tamanho: 8 },
];

// Mini-transporte guiado pelo evento 'update' (como um provider faz): propaga added/updated/removed.
const conectar = (de: Awareness, para: Awareness): void => {
  de.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
    applyAwarenessUpdate(para, encodeAwarenessUpdate(de, added.concat(updated, removed)), 'test');
  });
};

const criarPar = (): { awA: Awareness; awB: Awareness } => {
  const docA = new Y.Doc();
  docA.clientID = 1;
  const docB = new Y.Doc();
  docB.clientID = 2;
  const awA = new Awareness(docA);
  const awB = new Awareness(docB);
  conectar(awA, awB);
  return { awA, awB };
};

test('corDeUsuario é determinística e da paleta', () => {
  assert.strictEqual(corDeUsuario(42), corDeUsuario(42));
  assert.ok(corDeUsuario('joao').startsWith('#'));
});

test('indiceAbsolutoParaCursor localiza o blot que contém o índice', () => {
  assert.deepStrictEqual(indiceAbsolutoParaCursor(8, RANGES), { gid: 'g1', index: 3 });
  assert.deepStrictEqual(indiceAbsolutoParaCursor(20, RANGES), { gid: 'g2', index: 0 });
  assert.strictEqual(indiceAbsolutoParaCursor(50, RANGES), null, 'fora de qualquer blot');
});

test('cursorParaIndiceAbsoluto reposiciona no offset do blot', () => {
  assert.strictEqual(cursorParaIndiceAbsoluto({ gid: 'g2', index: 2 }, RANGES), 22);
  assert.strictEqual(cursorParaIndiceAbsoluto({ gid: 'gX', index: 0 }, RANGES), null, 'dispositivo não renderizado');
});

test('presenças: cursor publicado em A é visto por B (exclui o próprio)', () => {
  const { awA, awB } = criarPar();
  const pA = new PresencaSincronizador(awA, { nome: 'Ana', id: 1, cor: corDeUsuario(1) });
  const pB = new PresencaSincronizador(awB, { nome: 'Bia', id: 2, cor: corDeUsuario(2) });

  pA.publicarCursor({ gid: 'g1', index: 3 });

  const remotas = pB.presencas();
  assert.strictEqual(remotas.length, 1, 'B vê só A (não a si mesmo)');
  assert.strictEqual(remotas[0].user.nome, 'Ana');
  assert.deepStrictEqual(remotas[0].cursor, { gid: 'g1', index: 3 });
  awA.destroy();
  awB.destroy();
});

test('presencasPorDispositivo agrega quem está em cada gid', () => {
  const { awA, awB } = criarPar();
  const pA = new PresencaSincronizador(awA, { nome: 'Ana', id: 1, cor: corDeUsuario(1) });
  const pB = new PresencaSincronizador(awB, { nome: 'Bia', id: 2, cor: corDeUsuario(2) });

  pA.publicarCursor({ gid: 'g1', index: 3 });

  const mapa = pB.presencasPorDispositivo();
  assert.deepStrictEqual(
    mapa.get('g1')?.map(u => u.nome),
    ['Ana']
  );
  assert.strictEqual(mapa.get('g2'), undefined);
  awA.destroy();
  awB.destroy();
});

test('destruir remove a presença local e propaga a remoção', () => {
  const { awA, awB } = criarPar();
  const pA = new PresencaSincronizador(awA, { nome: 'Ana', id: 1, cor: corDeUsuario(1) });
  const pB = new PresencaSincronizador(awB, { nome: 'Bia', id: 2, cor: corDeUsuario(2) });
  pA.publicarCursor({ gid: 'g1', index: 3 });
  assert.strictEqual(pB.presencas().length, 1);

  pA.destruir();
  assert.strictEqual(pB.presencas().length, 0, 'presença de A removida em B');
  awA.destroy();
  awB.destroy();
});
