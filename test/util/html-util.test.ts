import { expect } from '@open-wc/testing';
import { removerMarcacaoRemissao, removerSpanParchmentRemissao } from '../../src/util/html-util';

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

  it('remove span residual sem <a> (unformat do blot não limpou o atributo antes do unwrap)', () => {
    const html = '<span data-ref-id="ref_123">texto sem link</span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('texto sem link');
  });

  it('remove spans residuais aninhados (duas remoções sem limpeza seguidas, ex: bug real de remissão externa)', () => {
    const html = 'Na <span data-ref-id="ref_1787238281540_511n628bc"><span data-ref-id="ref_1787238292055_34nzbelww">lei 14.133 de 2021</span></span> já passou a valer.';
    expect(removerSpanParchmentRemissao(html)).to.equal('Na lei 14.133 de 2021 já passou a valer.');
  });

  it('remove span residual com data-lexml-ref sem <a>', () => {
    const html = '<span data-lexml-ref="art2">art. 2</span>';
    expect(removerSpanParchmentRemissao(html)).to.equal('art. 2');
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

describe('removerMarcacaoRemissao', () => {
  it('reduz link de remissão interna ao texto', () => {
    const html = 'Conforme o <a class="lexml-remissao-interna" href="#lxEtaId7" data-lexml-ref="art2" data-ref-id="ref_1" target="_self">art. 2º</a>, aplica-se.';
    expect(removerMarcacaoRemissao(html)).to.equal('Conforme o art. 2º, aplica-se.');
  });

  it('reduz link inválido ao mesmo texto do válido', () => {
    const valido = 'Ver o <a class="lexml-remissao-interna" href="#lxEtaId7" data-lexml-ref="art2">art. 2º</a>.';
    const invalido = 'Ver o <a class="lexml-remissao-interna lexml-remissao-invalida" href="#lxEtaId7" data-lexml-ref="art2">art. 2º</a>.';
    expect(removerMarcacaoRemissao(invalido)).to.equal(removerMarcacaoRemissao(valido));
  });

  it('reduz link de remissão externa ao texto', () => {
    const html = 'Nos termos da <a class="lexml-remissao-externa" href="urn:lex:br:federal:lei:1966-10-25;5172" data-ref-id="ref_2">Lei nº 5.172</a>.';
    expect(removerMarcacaoRemissao(html)).to.equal('Nos termos da Lei nº 5.172.');
  });

  it('remove também o span do Parchment em volta do link', () => {
    const html = 'Ver o <span data-lexml-ref="art2"><a href="art2" data-lexml-ref="art2">art. 2º</a></span>.';
    expect(removerMarcacaoRemissao(html)).to.equal('Ver o art. 2º.');
  });

  it('preserva outras marcações e texto sem link', () => {
    expect(removerMarcacaoRemissao('<strong>Conforme</strong> o disposto.')).to.equal('<strong>Conforme</strong> o disposto.');
    expect(removerMarcacaoRemissao('<a href="https://www.senado.leg.br">site</a>')).to.equal('<a href="https://www.senado.leg.br">site</a>');
  });
});
