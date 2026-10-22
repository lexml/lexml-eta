import { expect } from '@open-wc/testing';
import { buildHtmlLink, formataNumero, getDataPorExtenso, getNomeExtensoComDataExtenso, getNumero, getTipo } from '../../../src/model/lexml/documento/urnUtil';

describe('formataNumero', () => {
  it('formata número simples com separador de milhar', () => {
    expect(formataNumero('14133')).to.equal('14.133');
  });

  it('formata número composto preservando o sufixo', () => {
    expect(formataNumero('2158-35')).to.equal('2.158-35');
  });

  it('devolve a entrada quando não é numérica, nunca NaN', () => {
    expect(formataNumero('abc')).to.equal('abc');
    expect(formataNumero('')).to.equal('');
  });
});

describe('Nome da norma com número composto', () => {
  const URN_MP = 'urn:lex:br:federal:medida.provisoria:2001-08-24;2158-35';

  it('exibe o número composto no nome por extenso', () => {
    expect(getNomeExtensoComDataExtenso(URN_MP)).to.contain('nº 2.158-35');
    expect(getNomeExtensoComDataExtenso(URN_MP)).not.to.contain('NaN');
  });

  it('exibe o número composto no link gerado', () => {
    expect(buildHtmlLink(URN_MP)).to.contain('nº 2.158-35');
  });

  it('compõe a frase gerada pelo diálogo e pelo assistente sem NaN', () => {
    const urn = 'urn:lex:br:federal:medida.provisoria:2001;2158-35';
    const frase = `${getTipo(urn).descricao} nº ${formataNumero(getNumero(urn))}, de ${getDataPorExtenso(urn)}`;
    expect(frase).to.equal('Medida Provisória nº 2.158-35, de 2001');
  });

  it('mantém o separador de milhar em número simples', () => {
    expect(getNomeExtensoComDataExtenso('urn:lex:br:federal:lei:2021-04-01;14133')).to.contain('Lei nº 14.133');
  });
});
