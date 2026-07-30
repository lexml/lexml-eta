import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { projetoNormaToYDoc } from '../../src/collab/ydocConverter';
import { OpDelta } from '../../src/collab/textoBinding';
import { EditorTextoColab, RangeBlot, TextoSincronizador } from '../../src/collab/textoSincronizador';

const OFFSET = 5; // início fictício do blot de conteúdo no Quill

class FakeEditor implements EditorTextoColab {
  aplicados: OpDelta[][] = [];
  constructor(private ranges: RangeBlot[]) {}
  rangesRenderizados(): RangeBlot[] {
    return this.ranges;
  }
  aplicarDeltaSilent(ops: OpDelta[]): void {
    this.aplicados.push(ops);
  }
}

// Documento com um artigo cujo caput tem texto curto ('Caput.') para indexar fácil.
const montar = (): { doc: Y.Doc; caputGid: string; tamanho: number } => {
  const articulacao: Articulacao = createArticulacao();
  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput.';
  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  const doc = projetoNormaToYDoc(projetoNorma);
  return { doc, caputGid: art1.caput!.gid!, tamanho: 'Caput.'.length };
};

const yTextDe = (doc: Y.Doc, gid: string): Y.Text => {
  const m = doc
    .getArray<Y.Map<unknown>>('articulacao')
    .toArray()
    .find(x => x.get('gid') === gid)!;
  return m.get('conteudo') as Y.Text;
};

test('local: onDeltaLocal roteia a edição para o Y.Text do dispositivo', () => {
  const { doc, caputGid, tamanho } = montar();
  const editor = new FakeEditor([{ gid: caputGid, offset: OFFSET, tamanho }]);
  const sinc = new TextoSincronizador(doc, editor);

  sinc.onDeltaLocal([{ retain: OFFSET }, { insert: 'X' }]);
  assert.strictEqual(yTextDe(doc, caputGid).toString(), 'XCaput.');
});

test('remoto: mudança externa no Y.Text é aplicada ao Quill em coords absolutas', () => {
  const { doc, caputGid, tamanho } = montar();
  const editor = new FakeEditor([{ gid: caputGid, offset: OFFSET, tamanho }]);
  const sinc = new TextoSincronizador(doc, editor);
  sinc.observarRenderizados();

  doc.transact(() => yTextDe(doc, caputGid).insert(2, 'Z'), 'remote');

  assert.strictEqual(editor.aplicados.length, 1);
  assert.deepStrictEqual(editor.aplicados[0], [{ retain: OFFSET }, { retain: 2 }, { insert: 'Z' }]);
});

test('anti-eco: edição local não é reaplicada ao Quill pelo observer', () => {
  const { doc, caputGid, tamanho } = montar();
  const editor = new FakeEditor([{ gid: caputGid, offset: OFFSET, tamanho }]);
  const sinc = new TextoSincronizador(doc, editor);
  sinc.observarRenderizados();

  sinc.onDeltaLocal([{ retain: OFFSET }, { insert: 'X' }]);
  assert.strictEqual(editor.aplicados.length, 0, 'edição local (origin TEXTO_LOCAL) não volta ao Quill');
});

test('convergência: edição local em A chega ao Y.Text e ao Quill de B', () => {
  const a = montar();
  const b = montar(); // mesmo seed determinístico ⇒ Y.Docs compatíveis
  const editorA = new FakeEditor([{ gid: a.caputGid, offset: OFFSET, tamanho: a.tamanho }]);
  const editorB = new FakeEditor([{ gid: b.caputGid, offset: OFFSET, tamanho: b.tamanho }]);
  const sincA = new TextoSincronizador(a.doc, editorA);
  const sincB = new TextoSincronizador(b.doc, editorB);
  sincB.observarRenderizados();

  sincA.onDeltaLocal([{ retain: OFFSET }, { insert: 'X' }]); // 'XCaput.' em A
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, Y.encodeStateVector(b.doc)));

  assert.strictEqual(yTextDe(b.doc, b.caputGid).toString(), 'XCaput.', 'Y.Text de B convergiu');
  assert.ok(editorB.aplicados.length >= 1, 'o Quill de B recebeu a edição remota');
});
