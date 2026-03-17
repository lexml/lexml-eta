import { expect } from '@open-wc/testing';
import { RemissaoInternaBlot } from '../../../src/util/eta-quill/eta-blot-remissao-interna';
import { ModuloRemissao } from '../../../src/components/editor/moduloRemissao';

// ---------------------------------------------------------------------------
// m2 — Segundo clipboard matcher ('A') e no-op
//
// O matcher registrado para 'A' em moduloRemissao.ts:97-109 sempre retorna
// `delta` inalterado em todos os seus caminhos (codigo morto).
// CORRECAO: remover o matcher.
// ---------------------------------------------------------------------------

// Replica o matcher exatamente como esta no codigo-fonte.
function clipboardMatcherA(node: HTMLElement, delta: any): any {
  const dataLexmlRef = node.getAttribute('data-lexml-ref');

  if (!dataLexmlRef) {
    return delta;
  }

  if (node.classList.contains('lexml-remissao-interna')) {
    return delta;
  }

  return delta;
}

describe('m2 — Clipboard matcher "A": comportamento no-op (codigo morto)', () => {
  const sentinel = { ops: [{ insert: 'texto' }] };

  it('retorna delta inalterado quando no nao tem data-lexml-ref', () => {
    const node = document.createElement('a');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });

  it('retorna delta inalterado quando no tem data-lexml-ref e e lexml-remissao-interna', () => {
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    node.classList.add('lexml-remissao-interna');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });

  it('retorna delta inalterado quando no tem data-lexml-ref e nao e lexml-remissao-interna', () => {
    // Todos os ramos retornam delta: o matcher nao tem efeito em nenhum caso.
    const node = document.createElement('a');
    node.setAttribute('data-lexml-ref', 'art1');
    expect(clipboardMatcherA(node, sentinel)).to.equal(sentinel);
  });
});

// ---------------------------------------------------------------------------
// m3 — Dupla registracao do modulo Quill
//
// 'modules/remissaoInterna' e registrado em:
//   - src/components/editor/moduloRemissao.ts:567
//   - src/util/eta-quill/eta-quill.ts:163
// Ambos usam overwrite:true; o segundo vence silenciosamente.
// CORRECAO: remover Quill.register em moduloRemissao.ts:567.
// ---------------------------------------------------------------------------

describe('m3 — Dupla registracao: Quill.register com overwrite:true e seguro', () => {
  it('registrar o mesmo modulo duas vezes com overwrite:true nao lanca erro', () => {
    let threwError = false;
    try {
      Quill.register('modules/remissaoInterna', ModuloRemissao, true);
      Quill.register('modules/remissaoInterna', ModuloRemissao, true);
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.false;
  });

  it('ModuloRemissao.register() nao lanca erro ao registrar atributos', () => {
    let threwError = false;
    try {
      ModuloRemissao.register();
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.false;
  });
});

// ---------------------------------------------------------------------------
// m5 — extractUuidFromHref duplicado
//
// Implementacao identica existe em RemissaoInternaBlot (estatico, publico)
// e em ModuloRemissao (privado). CORRECAO: remover o metodo privado e
// usar RemissaoInternaBlot.extractUuidFromHref em atualizarReferencias().
// ---------------------------------------------------------------------------

describe('m5 — extractUuidFromHref: implementacao canonica (RemissaoInternaBlot)', () => {
  it('extrai uuid numerico de href valido', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#lxEtaId42')).to.equal(42);
  });

  it('retorna 0 para href sem fragmento lxEtaId', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#outro')).to.equal(0);
    expect(RemissaoInternaBlot.extractUuidFromHref('')).to.equal(0);
    expect(RemissaoInternaBlot.extractUuidFromHref('http://exemplo.com')).to.equal(0);
  });

  it('extrai uuid correto de href composto', () => {
    expect(RemissaoInternaBlot.extractUuidFromHref('#lxEtaId99999')).to.equal(99999);
  });

  it('implementacao privada de ModuloRemissao e identica (documenta duplicacao)', () => {
    // Replica exatamente ModuloRemissao.extractUuidFromHref (privado).
    function extractUuidPrivado(href: string): number {
      const match = href.match(/#lxEtaId(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }

    const hrefs = ['#lxEtaId1', '#lxEtaId0', '#lxEtaId999', '#outro', ''];
    hrefs.forEach(href => {
      expect(extractUuidPrivado(href)).to.equal(RemissaoInternaBlot.extractUuidFromHref(href));
    });
  });
});

// ---------------------------------------------------------------------------
// m6 — querySelector com interpolacao direta de refId/lexmlId sem CSS.escape()
//
// Caracteres especiais CSS (ex: aspas duplas) na interpolacao direta causam
// SyntaxError. CORRECAO: usar CSS.escape() em todos os querySelector do modulo.
// ---------------------------------------------------------------------------

describe('m6 — querySelector: fragilidade sem CSS.escape()', () => {
  it('querySelector sem CSS.escape() lanca SyntaxError para refId com aspas duplas', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComAspa = 'ref_123"evil"';
    a.setAttribute('data-ref-id', refIdComAspa);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    let threwError = false;
    try {
      container.querySelector(`a.lexml-remissao-interna[data-ref-id="${refIdComAspa}"]`);
    } catch (e) {
      threwError = true;
    }
    expect(threwError).to.be.true;
  });

  it('querySelector COM CSS.escape() encontra elemento com refId contendo aspas duplas', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComAspa = 'ref_123"evil"';
    a.setAttribute('data-ref-id', refIdComAspa);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    const found = container.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(refIdComAspa)}"]`);
    expect(found).to.not.be.null;
  });

  it('querySelector COM CSS.escape() encontra elemento com refId com colchetes', () => {
    const container = document.createElement('div');
    const a = document.createElement('a');
    const refIdComColchetes = 'ref_123[0]';
    a.setAttribute('data-ref-id', refIdComColchetes);
    a.classList.add('lexml-remissao-interna');
    container.appendChild(a);

    const found = container.querySelector(`a.lexml-remissao-interna[data-ref-id="${CSS.escape(refIdComColchetes)}"]`);
    expect(found).to.not.be.null;
  });
});
