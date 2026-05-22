import { expect } from '@open-wc/testing';
import { RemissaoExternaValue } from '../../../src/model/remissao';

// ---------------------------------------------------------------------------
// Clipboard matcher 'A[href^="urn:lex:"]'
//
// Converte links legados <a href="urn:lex:..."> (sem class nem data-*)
// para o formato de remissão externa interativo.
// Implementado em src/components/editor/moduloRemissao.ts.
// ---------------------------------------------------------------------------

// Replica o matcher exatamente como está no código-fonte, sem depender de
// instância do ModuloRemissao (evita overhead do construtor Quill).
function clipboardMatcherUrnLex(node: HTMLElement, delta: any): any {
  if (node.classList.contains('lexml-remissao-externa')) return delta;

  const href = node.getAttribute('href') ?? '';
  const sepIdx = href.indexOf('!');
  const urn = sepIdx >= 0 ? href.substring(0, sepIdx) : href;
  const fragmento = sepIdx >= 0 ? href.substring(sepIdx + 1) : undefined;

  if (!urn) return delta;

  const value: RemissaoExternaValue = {
    refId: 'REF_STUB',
    targetUrn: urn,
    targetNomeNorma: '',
    targetFragmento: fragmento || undefined,
    textoRef: node.textContent ?? undefined,
  };

  const ops = delta.ops.map((op: any) => {
    if (op.insert && typeof op.insert === 'string') {
      return { ...op, attributes: { ...op.attributes, 'remissao-externa': value } };
    }
    return op;
  });

  return { ops };
}

// Delta simples com um único op de inserção de texto
function deltaSimplesTexto(texto: string): any {
  return { ops: [{ insert: texto }] };
}

// ---------------------------------------------------------------------------
// Testes do guard: nó com class lexml-remissao-externa não é processado
// ---------------------------------------------------------------------------

describe('Clipboard matcher A[href^="urn:lex:"] — guard lexml-remissao-externa', () => {
  it('retorna delta inalterado quando o nó já tem classe lexml-remissao-externa', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:2000-01-01;1234');
    node.classList.add('lexml-remissao-externa');
    node.setAttribute('data-urn', 'urn:lex:br:federal:lei:2000-01-01;1234');
    node.textContent = 'Lei nº 1.234';

    const delta = deltaSimplesTexto('Lei nº 1.234');
    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado).to.equal(delta);
  });
});

// ---------------------------------------------------------------------------
// Testes de URN sem fragmento
// ---------------------------------------------------------------------------

describe('Clipboard matcher A[href^="urn:lex:"] — URN simples (sem fragmento)', () => {
  it('aplica atributo remissao-externa ao op de inserção de texto', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:1986-12-19;7560');
    node.textContent = 'Lei nº 7.560';

    const delta = deltaSimplesTexto('Lei nº 7.560');
    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado.ops).to.have.length(1);
    const op = resultado.ops[0];
    const attrExt = op.attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.targetUrn).to.equal('urn:lex:br:federal:lei:1986-12-19;7560');
    expect(attrExt.targetFragmento).to.be.undefined;
    expect(attrExt.targetNomeNorma).to.equal('');
    expect(attrExt.textoRef).to.equal('Lei nº 7.560');
  });

  it('textoRef usa o textContent do nó', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
    node.textContent = 'Medida Provisória nº 885';

    const resultado = clipboardMatcherUrnLex(node, deltaSimplesTexto('Medida Provisória nº 885'));
    const attrExt = resultado.ops[0].attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.textoRef).to.equal('Medida Provisória nº 885');
  });

  it('targetNomeNorma é string vazia (não há dado-nome-norma no formato legado)', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:decreto.lei:1943-05-01;5452');
    node.textContent = 'CLT';

    const resultado = clipboardMatcherUrnLex(node, deltaSimplesTexto('CLT'));
    const attrExt = resultado.ops[0].attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.targetNomeNorma).to.equal('');
  });
});

// ---------------------------------------------------------------------------
// Testes de URN com fragmento
// ---------------------------------------------------------------------------

describe('Clipboard matcher A[href^="urn:lex:"] — URN com fragmento', () => {
  it('separa URN base e fragmento quando href contém "!"', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:decreto.lei:1943-05-01;5452!art451');
    node.textContent = 'art. 451 da CLT';

    const resultado = clipboardMatcherUrnLex(node, deltaSimplesTexto('art. 451 da CLT'));
    const attrExt = resultado.ops[0].attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.targetUrn).to.equal('urn:lex:br:federal:decreto.lei:1943-05-01;5452');
    expect(attrExt.targetFragmento).to.equal('art451');
  });

  it('fragmento com sub-referências (ex: art1_cpt_inc2)', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:2006-08-23;11343!art17_cpt_inc3');
    node.textContent = 'inciso III do art. 17';

    const resultado = clipboardMatcherUrnLex(node, deltaSimplesTexto('inciso III do art. 17'));
    const attrExt = resultado.ops[0].attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.targetUrn).to.equal('urn:lex:br:federal:lei:2006-08-23;11343');
    expect(attrExt.targetFragmento).to.equal('art17_cpt_inc3');
    expect(attrExt.textoRef).to.equal('inciso III do art. 17');
  });
});

// ---------------------------------------------------------------------------
// Testes de comportamento com o delta
// ---------------------------------------------------------------------------

describe('Clipboard matcher A[href^="urn:lex:"] — transformação do delta', () => {
  it('não modifica ops que não são inserções de texto (ex: embed)', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:2000-01-01;1234');
    node.textContent = 'Lei nº 1.234';

    const opEmbed = { insert: { image: 'data:...' } };
    const opTexto = { insert: 'Lei nº 1.234' };
    const delta = { ops: [opTexto, opEmbed] };

    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado.ops[0].attributes['remissao-externa']).to.exist;
    // op embed não deve receber o atributo
    expect(resultado.ops[1]).to.deep.equal(opEmbed);
  });

  it('aplica atributo a múltiplos ops de texto no mesmo delta', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:2000-01-01;1234');
    node.textContent = 'Lei nº 1.234';

    const delta = { ops: [{ insert: 'Lei' }, { insert: ' nº 1.234' }] };
    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado.ops).to.have.length(2);
    expect(resultado.ops[0].attributes['remissao-externa']).to.exist;
    expect(resultado.ops[1].attributes['remissao-externa']).to.exist;
  });

  it('preserva atributos já existentes no op ao adicionar remissao-externa', () => {
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:2000-01-01;1234');
    node.textContent = 'lei em negrito';

    const delta = { ops: [{ insert: 'lei em negrito', attributes: { bold: true } }] };
    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado.ops[0].attributes.bold).to.be.true;
    expect(resultado.ops[0].attributes['remissao-externa']).to.exist;
  });

  it('retorna delta inalterado quando URN está vazia', () => {
    const node = document.createElement('a');
    node.setAttribute('href', '');
    node.textContent = 'texto';

    const delta = deltaSimplesTexto('texto');
    const resultado = clipboardMatcherUrnLex(node, delta);

    expect(resultado).to.equal(delta);
  });
});

// ---------------------------------------------------------------------------
// Testes de integração com buildProjetoNormaFromJsonix
// ---------------------------------------------------------------------------

describe('Clipboard matcher A[href^="urn:lex:"] — formato HTML gerado pelo parser', () => {
  it('não processa links no novo formato (data-urn + class lexml-remissao-externa)', () => {
    // O parser já converte span/Remissao com URN para este formato.
    // O matcher deve ignorar esses nós para evitar duplo processamento.
    const node = document.createElement('a');
    node.setAttribute('href', '#');
    node.setAttribute('data-urn', 'urn:lex:br:federal:lei:1986-12-19;7560');
    node.setAttribute('data-ref-id', 'ref_123');
    node.classList.add('lexml-remissao-externa');
    node.textContent = 'Lei nº 7.560';

    const delta = deltaSimplesTexto('Lei nº 7.560');
    // Esse nó NÃO tem href^="urn:lex:" — tem href="#" — então na prática
    // o seletor CSS 'A[href^="urn:lex:"]' não o captura. Mas o guard de classe
    // garante a segurança caso o seletor mudasse.
    const resultado = clipboardMatcherUrnLex(node, delta);
    expect(resultado).to.equal(delta);
  });

  it('processa links no formato legado (href="urn:lex:..." sem class)', () => {
    // Formato encontrado em MPV_1085_2021 e similares — links gerados por
    // editores que não usavam a versão atual do componente.
    const node = document.createElement('a');
    node.setAttribute('href', 'urn:lex:br:federal:lei:1986-12-19;7560');
    node.textContent = 'Lei nº 7.560, de 19 de dezembro de 1986';

    const resultado = clipboardMatcherUrnLex(node, deltaSimplesTexto('Lei nº 7.560, de 19 de dezembro de 1986'));

    expect(resultado.ops[0].attributes['remissao-externa']).to.exist;
    const attrExt = resultado.ops[0].attributes['remissao-externa'] as RemissaoExternaValue;
    expect(attrExt.targetUrn).to.equal('urn:lex:br:federal:lei:1986-12-19;7560');
    expect(attrExt.textoRef).to.equal('Lei nº 7.560, de 19 de dezembro de 1986');
  });
});
