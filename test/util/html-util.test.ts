import { expect } from '@open-wc/testing';
import { removerSpanParchmentRemissao } from '../../src/util/html-util';

describe('removerSpanParchmentRemissao', () => {
  it('remove <span data-lexml-ref> em volta de <a>', () => {
    const html = '<span data-lexml-ref="art2"><a href="art2" class="lexml-remissao-interna">art. 2</a></span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<a href="art2" class="lexml-remissao-interna">art. 2</a>');
  });

  it('remove <span data-ref-id> em volta de <a>', () => {
    const html = '<span data-ref-id="ref_123"><a href="art2" class="lexml-remissao-interna">art. 2</a></span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<a href="art2" class="lexml-remissao-interna">art. 2</a>');
  });

  it('remove <span> com ambos os atributos', () => {
    const html = '<span data-lexml-ref="art2" data-ref-id="ref_123"><a href="art2">art. 2</a></span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<a href="art2">art. 2</a>');
  });

  it('não remove span sem atributos de remissão', () => {
    const html = '<span class="outro"><a href="art2">art. 2</a></span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<span class="outro"><a href="art2">art. 2</a></span>');
  });

  it('não modifica texto sem spans', () => {
    const html = 'Texto simples sem spans.';
    expect(removerSpanParchmentRemissao(html)).to.equal('Texto simples sem spans.');
  });

  it('não remove span que não envolve <a>', () => {
    const html = '<span data-ref-id="ref_123">texto sem link</span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<span data-ref-id="ref_123">texto sem link</span>');
  });

  it('preserva conteúdo do <a> ao remover span', () => {
    const html = '<span data-ref-id="ref_1"><a href="art2" data-lexml-ref="art2" class="lexml-remissao-interna" target="_self">art. 2º</a></span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('<a href="art2" data-lexml-ref="art2" class="lexml-remissao-interna" target="_self">art. 2º</a>');
  });

  it('funciona com múltiplos spans no mesmo texto', () => {
    const html =
      'No <span data-ref-id="ref_1"><a href="art2" data-lexml-ref="art2">art. 2</a></span> e ' +
      'no <span data-lexml-ref="art3"><a href="art3" data-lexml-ref="art3">art. 3</a></span> desta lei.';
    expect(removerSpanParchmentRemissao(html)).to.equal('No <a href="art2" data-lexml-ref="art2">art. 2</a> e ' + 'no <a href="art3" data-lexml-ref="art3">art. 3</a> desta lei.');
  });
});
