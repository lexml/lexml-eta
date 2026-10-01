import assert from 'node:assert';
import { test } from 'node:test';
import * as Y from 'yjs';
import { Articulacao, Artigo, Dispositivo } from '../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { ProjetoNorma } from '../../src/model/lexml/documento/projetoNorma';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { ordemCanonica } from '../../src/collab/canonicalOrder';
import { projetoNormaToYDoc, yDocToProjetoNorma } from '../../src/collab/ydocConverter';

// Reatribui todos os uuid numéricos locais (espelha resetUuidTodaArvore de reducerUtil,
// sem arrastar a cadeia de imports pesada dele) para provar que o gid é independente do uuid.
let contador = 1000;
const reatribuirUuids = (d: Dispositivo): void => {
  d.uuid = ++contador;
  d.filhos?.forEach(f => reatribuirUuids(f));
  d.alteracoes?.filhos?.forEach(f => reatribuirUuids(f));
};

// Monta, do zero via fábrica, um ProjetoNorma com hierarquia representativa.
// Independente do arquivo JSON — determinismo do seed não pode depender de uuid/uuid2 aleatórios.
const montarFixture = (): ProjetoNorma => {
  const articulacao: Articulacao = createArticulacao();

  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.texto = 'Caput do artigo primeiro.';
  const inc1 = criaDispositivo(art1, TipoDispositivo.inciso.tipo);
  inc1.texto = 'primeiro inciso;';
  const ali1 = criaDispositivo(inc1, TipoDispositivo.alinea.tipo);
  ali1.texto = 'alínea a;';
  const inc2 = criaDispositivo(art1, TipoDispositivo.inciso.tipo);
  inc2.texto = 'segundo inciso;';
  const par1 = criaDispositivo(art1, TipoDispositivo.paragrafo.tipo);
  par1.texto = 'Texto do parágrafo único.';
  par1.notaAlteracao = 'NR';

  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art2.texto = 'Caput do artigo segundo.';

  // agrupador com artigo aninhado — exercita o caminho genérico e paiGid de agrupador.
  const cap1 = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
  cap1.texto = 'DISPOSIÇÕES FINAIS';
  const art3 = criaDispositivo(cap1, TipoDispositivo.artigo.tipo) as Artigo;
  art3.texto = 'Caput do artigo terceiro.';

  const projetoNorma = { classificacao: ClassificacaoDocumento.PROJETO, articulacao } as ProjetoNorma;
  articulacao.projetoNorma = projetoNorma;
  return projetoNorma;
};

const bytes = (doc: Y.Doc): number[] => Array.from(Y.encodeStateAsUpdate(doc));

test('round-trip é idempotente (re-seed do reconstruído produz os mesmos bytes)', () => {
  const original = montarFixture();
  const doc1 = projetoNormaToYDoc(original);

  const { projetoNorma: reconstruido } = yDocToProjetoNorma(doc1);
  const doc2 = projetoNormaToYDoc(reconstruido);

  assert.deepStrictEqual(bytes(doc2), bytes(doc1), 'seed(reconstruído) deve ser byte-idêntico a seed(original)');

  // conferência semântica: a projeção canônica (tipo + texto) coincide item a item.
  const projecao = (pn: ProjetoNorma): Array<[string, string]> => ordemCanonica(pn.articulacao as Articulacao).map(d => [d.tipo, d.texto ?? ''] as [string, string]);
  assert.deepStrictEqual(projecao(reconstruido), projecao(original));
  assert.ok(projecao(reconstruido).some(([, t]) => t === 'alínea a;'));
  assert.ok(projecao(reconstruido).some(([tipo, t]) => tipo === TipoDispositivo.capitulo.tipo && t === 'DISPOSIÇÕES FINAIS'));
});

test('determinismo: dois seeds independentes do mesmo documento são byte-idênticos', () => {
  const docA = projetoNormaToYDoc(montarFixture());
  const docB = projetoNormaToYDoc(montarFixture());

  assert.deepStrictEqual(bytes(docB), bytes(docA), 'Y.encodeStateAsUpdate deve coincidir entre seeds independentes');
});

test('gid é estável e desacoplado do uuid numérico local', () => {
  const doc = projetoNormaToYDoc(montarFixture());
  const { projetoNorma } = yDocToProjetoNorma(doc);
  const articulacao = projetoNorma.articulacao as Articulacao;

  const gidsAntes = ordemCanonica(articulacao).map(d => d.gid);

  // reatribuir os uuid numéricos (F4) não pode mudar o gid.
  reatribuirUuids(articulacao);

  const gidsDepois = ordemCanonica(articulacao).map(d => d.gid);
  assert.deepStrictEqual(gidsDepois, gidsAntes);
  assert.ok(gidsAntes.every(g => typeof g === 'string' && g.length > 0));
});

test('a fábrica injeta gid em dispositivos criados ao vivo (distinto por dispositivo)', () => {
  const articulacao = createArticulacao();
  const art = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  const par = criaDispositivo(art, TipoDispositivo.paragrafo.tipo);

  [articulacao.gid, art.gid, art.caput!.gid, par.gid].forEach(g => assert.ok(typeof g === 'string' && g.length > 0, 'gid ausente'));
  const gids = new Set([articulacao.gid, art.gid, art.caput!.gid, par.gid]);
  assert.strictEqual(gids.size, 4, 'gids devem ser distintos entre dispositivos');
});

test('invariantes: gid único e todo paiGid resolve', () => {
  const doc = projetoNormaToYDoc(montarFixture());
  const arr = doc.getArray<Y.Map<unknown>>('articulacao');

  const gids = new Set<string>();
  arr.toArray().forEach(m => {
    const gid = m.get('gid') as string;
    assert.ok(!gids.has(gid), `gid duplicado: ${gid}`);
    gids.add(gid);
  });

  arr.toArray().forEach(m => {
    const paiGid = m.get('paiGid') as string | null;
    if (paiGid !== null) {
      assert.ok(gids.has(paiGid), `paiGid órfão: ${paiGid}`);
    }
  });

  // exatamente uma raiz (paiGid null) = a articulação
  const raizes = arr.toArray().filter(m => (m.get('paiGid') as string | null) === null);
  assert.strictEqual(raizes.length, 1);
});
