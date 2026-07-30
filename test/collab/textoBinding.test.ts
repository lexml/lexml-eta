import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { paraDeltaQuill, recortarParaYText } from '../../src/collab/textoBinding';

// Blot de conteúdo ocupando [5, 15) no documento Quill.
const OFFSET = 5;
const TAM = 10;

test('recorta insert dentro do blot para coordenadas locais', () => {
  assert.deepStrictEqual(recortarParaYText([{ retain: 8 }, { insert: 'x' }], OFFSET, TAM), [{ retain: 3 }, { insert: 'x' }]);
});

test('recorta delete dentro do blot', () => {
  assert.deepStrictEqual(recortarParaYText([{ retain: 8 }, { delete: 2 }], OFFSET, TAM), [{ retain: 3 }, { delete: 2 }]);
});

test('insert no início do blot não emite retain', () => {
  assert.deepStrictEqual(recortarParaYText([{ retain: 5 }, { insert: 'y' }], OFFSET, TAM), [{ insert: 'y' }]);
});

test('edição antes do blot é ignorada', () => {
  assert.deepStrictEqual(recortarParaYText([{ retain: 2 }, { insert: 'x' }], OFFSET, TAM), []);
});

test('edição depois do blot é ignorada', () => {
  assert.deepStrictEqual(recortarParaYText([{ retain: 20 }, { insert: 'z' }], OFFSET, TAM), []);
});

test('delete que só toca parcialmente o blot recorta ao range', () => {
  // delete de 8 chars a partir do abs 12: [12,20) ∩ [5,15) = [12,15) ⇒ delete 3 locais (12-5=7)
  assert.deepStrictEqual(recortarParaYText([{ retain: 12 }, { delete: 8 }], OFFSET, TAM), [{ retain: 7 }, { delete: 3 }]);
});

test('paraDeltaQuill reposiciona as ops locais no offset absoluto', () => {
  assert.deepStrictEqual(paraDeltaQuill([{ insert: 'y' }], 5), [{ retain: 5 }, { insert: 'y' }]);
  assert.deepStrictEqual(paraDeltaQuill([{ retain: 3 }, { insert: 'x' }], 0), [{ retain: 3 }, { insert: 'x' }]);
});

test('convergência: dois usuários editando o mesmo Y.Text convergem', () => {
  const docA = new Y.Doc();
  const docB = new Y.Doc();
  const tA = docA.getText('t');
  tA.insert(0, 'foo');
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
  const tB = docB.getText('t');
  assert.strictEqual(tB.toString(), 'foo');

  // A insere 'X' após o 1º char; B insere 'Y' no fim — concorrentes, via os tradutores.
  tA.applyDelta(recortarParaYText([{ retain: 1 }, { insert: 'X' }], 0, 3));
  tB.applyDelta(recortarParaYText([{ retain: 3 }, { insert: 'Y' }], 0, 3));

  Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB, Y.encodeStateVector(docA)));
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA, Y.encodeStateVector(docB)));

  assert.strictEqual(tA.toString(), tB.toString(), 'réplicas convergem');
  assert.strictEqual(tA.toString(), 'fXooY');
});
