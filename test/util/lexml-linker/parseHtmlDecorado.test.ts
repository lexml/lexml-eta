import { expect } from '@open-wc/testing';
import { parseHtmlDecorado } from '../../../src/util/lexml-linker/parseHtmlDecorado';

// Fixtures capturadas de execuções reais do WASM (docs/referencia/LEXML_LINKER_WASM.md) — não inventadas,
// para exercitar exatamente o que o lexml-linker de fato devolve (incluindo escaping de entidades HTML).

describe('parseHtmlDecorado', () => {
  it('devolve [] quando não há nenhum link no HTML decorado', () => {
    expect(parseHtmlDecorado('texto sem nenhuma remissao a normas')).to.deep.equal([]);
  });

  it('extrai offset, texto e urn de uma única remissão', () => {
    const original = 'Vide art. 5º da Lei nº 8.069, de 13 de julho de 1990.';
    const html =
      'Vide <a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1990-07-13;8069!art5" class="lexmlurnlink">art. 5º da Lei nº 8.069, de 13 de julho de 1990</a>.';

    const resultado = parseHtmlDecorado(html);

    expect(resultado).to.have.lengthOf(1);
    const [match] = resultado;
    expect(original.slice(match.inicio, match.fim)).to.equal(match.textoRef);
    expect(match.targetUrn).to.equal('urn:lex:br:federal:lei:1990-07-13;8069');
    expect(match.targetFragmento).to.equal('art5');
  });

  it('divide uma frase com dois incisos em dois matches com fragmentos distintos', () => {
    const original = 'Os incisos I e III do § 3º do art. 8º da Lei nº 12.527, de 18 de novembro de 2011.';
    const html =
      'Os <a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:2011-11-18;12527!art8_par3_inc1" class="lexmlurnlink">incisos I</a> e ' +
      '<a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:2011-11-18;12527!art8_par3_inc3" class="lexmlurnlink">III do § 3º do art. 8º da Lei nº 12.527, de 18 de novembro de 2011</a>.';

    const resultado = parseHtmlDecorado(html);

    expect(resultado).to.have.lengthOf(2);
    resultado.forEach(match => expect(original.slice(match.inicio, match.fim)).to.equal(match.textoRef));
    expect(resultado[0].targetFragmento).to.equal('art8_par3_inc1');
    expect(resultado[1].targetFragmento).to.equal('art8_par3_inc3');
  });

  it('decodifica &amp; e &quot; ao calcular offsets (texto original tem "&" e aspas)', () => {
    const original = 'Fulano & Cia, nos termos do art. 5º da Lei nº 8.069, de 13 de julho de 1990, "citado".';
    const html =
      'Fulano &amp; Cia, nos termos do <a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1990-07-13;8069!art5" class="lexmlurnlink">art. 5º da Lei nº 8.069, de 13 de julho de 1990</a>, &quot;citado&quot;.';

    const resultado = parseHtmlDecorado(html);

    expect(resultado).to.have.lengthOf(1);
    const [match] = resultado;
    expect(original.slice(match.inicio, match.fim)).to.equal(match.textoRef);
    expect(match.textoRef).to.equal('art. 5º da Lei nº 8.069, de 13 de julho de 1990');
  });

  it('lida com dois links adjacentes, sem texto entre eles', () => {
    const original = 'Vide art. 5º da Lei nº 8.069, de 13 de julho de 1990.art. 10 do Decreto nº 7.663, de 2011.';
    const html =
      'Vide <a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1990-07-13;8069!art5" class="lexmlurnlink">art. 5º da Lei nº 8.069, de 13 de julho de 1990</a>.' +
      '<a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:decreto:2011;7663!art10" class="lexmlurnlink">art. 10 do Decreto nº 7.663, de 2011</a>.';

    const resultado = parseHtmlDecorado(html);

    expect(resultado).to.have.lengthOf(2);
    resultado.forEach(match => expect(original.slice(match.inicio, match.fim)).to.equal(match.textoRef));
    expect(resultado[0].fim).to.equal(resultado[1].inicio - 1); // separados só pelo "." entre as duas citações
  });

  it('preserva acentos/unicode sem alterar os offsets (texto não é escapado pelo parser)', () => {
    const original = 'Não é possível, cf. art. 3º da Emenda Constitucional nº 19, de 4 de junho de 1998.';
    const html =
      'Não é possível, cf. <a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:emenda.constitucional:1998-06-04;19!art3" class="lexmlurnlink">art. 3º da Emenda Constitucional nº 19, de 4 de junho de 1998</a>.';

    const resultado = parseHtmlDecorado(html);

    expect(resultado).to.have.lengthOf(1);
    const [match] = resultado;
    expect(original.slice(match.inicio, match.fim)).to.equal(match.textoRef);
  });

  it('não gera targetFragmento quando o href aponta só para a norma inteira (sem "!")', () => {
    const html = '<a href="https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:1990-07-13;8069" class="lexmlurnlink">Lei nº 8.069</a>';

    const [match] = parseHtmlDecorado(html);

    expect(match.targetUrn).to.equal('urn:lex:br:federal:lei:1990-07-13;8069');
    expect(match.targetFragmento).to.be.undefined;
  });
});
