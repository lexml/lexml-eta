import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { RemissaoInternaValue } from '../../src/model/remissao';
import { aplicarEntradasSync, chaveRemissao, escreverRemissoesNoYMap, extrairEntradasSync, lerRemissoesDoYMap } from '../../src/collab/remissaoMetaBinding';

const linkNormal: RemissaoInternaValue = { refId: 'r1', inicio: 5, targetLexmlId: 'art2', textoRef: 'art. 2º' };
const linkInvalido: RemissaoInternaValue = { refId: 'r2', inicio: 20, targetLexmlId: 'art9', textoRef: 'art. 9º', valida: false };
const tombstone: RemissaoInternaValue = { refId: 'r3', inicio: 40, targetLexmlId: 'art3', textoRef: 'art. 3º', excluidaManualmente: true };

test('chaveRemissao usa a tripla (inicio, targetLexmlId, textoRef)', () => {
  assert.strictEqual(chaveRemissao(linkInvalido), chaveRemissao({ inicio: 20, targetLexmlId: 'art9', textoRef: 'art. 9º' }));
  assert.notStrictEqual(chaveRemissao(linkInvalido), chaveRemissao(tombstone));
});

test('extrairEntradasSync mantém só as remissões com flag não-derivável', () => {
  const entradas = extrairEntradasSync([linkNormal, linkInvalido, tombstone]);
  assert.strictEqual(entradas.length, 2, 'link normal (derivável) é descartado');
  assert.ok(entradas.find(e => e.valida === false));
  assert.ok(entradas.find(e => e.excluidaManualmente === true));
});

test('round-trip: escrever no Y.Map e ler de volta preserva os flags', () => {
  const doc = new Y.Doc();
  const yMap = doc.getMap<unknown>('disp');
  const entradas = extrairEntradasSync([linkInvalido, tombstone]);
  escreverRemissoesNoYMap(yMap, entradas);

  const lidas = lerRemissoesDoYMap(yMap);
  assert.deepStrictEqual(new Set(lidas.map(e => e.chave)), new Set(entradas.map(e => e.chave)));
  assert.strictEqual(lidas.find(e => e.chave === chaveRemissao(linkInvalido))!.valida, false);
});

test('escrever substitui (nunca acumula) as entradas anteriores', () => {
  const doc = new Y.Doc();
  const yMap = doc.getMap<unknown>('disp');
  escreverRemissoesNoYMap(yMap, extrairEntradasSync([linkInvalido, tombstone]));
  escreverRemissoesNoYMap(yMap, extrairEntradasSync([linkInvalido])); // só o inválido agora
  const lidas = lerRemissoesDoYMap(yMap);
  assert.strictEqual(lidas.length, 1);
  assert.strictEqual(lidas[0].chave, chaveRemissao(linkInvalido));
});

test('aplicarEntradasSync mescla flags nas remissões re-detectadas por chave', () => {
  // B re-detectou o link (refId local diferente), sem flag; recebe valida=false pela chave.
  const detectadoEmB: RemissaoInternaValue = { refId: 'LOCAL-B-xyz', inicio: 20, targetLexmlId: 'art9', textoRef: 'art. 9º' };
  const resultado = aplicarEntradasSync([detectadoEmB], extrairEntradasSync([linkInvalido]));
  assert.strictEqual(resultado.length, 1);
  assert.strictEqual(resultado[0].valida, false, 'flag aplicado por identidade semântica, não por refId');
  assert.strictEqual(resultado[0].refId, 'LOCAL-B-xyz', 'preserva o refId local');
});

test('aplicarEntradasSync reinjeta tombstone sem link detectado (bloqueia recriação)', () => {
  const resultado = aplicarEntradasSync([], extrairEntradasSync([tombstone]));
  assert.strictEqual(resultado.length, 1);
  assert.strictEqual(resultado[0].excluidaManualmente, true);
  assert.strictEqual(resultado[0].targetLexmlId, 'art3');
  assert.strictEqual(resultado[0].inicio, 40);
});

test('convergência: flags escritos em A chegam ao Y.Doc de B pelo sync', () => {
  const docA = new Y.Doc();
  const docB = new Y.Doc();
  escreverRemissoesNoYMap(docA.getMap<unknown>('disp'), extrairEntradasSync([linkInvalido, tombstone]));
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));

  const lidasB = lerRemissoesDoYMap(docB.getMap<unknown>('disp'));
  assert.strictEqual(lidasB.length, 2);
  assert.ok(lidasB.find(e => e.excluidaManualmente === true));
});
