import { expect } from '@open-wc/testing';
import { ajustarRotuloArtigo, converterSufixoDosRotulos } from '../../../src/redux/elemento/util/colarUtil';

describe('Testando funções do colarUtil', () => {
  it('ajustarRotuloArtigo', () => {
    const texto = 'Art.          1 Novo texto para o artigo.';
    expect(ajustarRotuloArtigo(texto).startsWith('Art. 1 Novo texto')).to.be.true;
  });

  it('converterSufixoDosRotulos', () => {
    const texto = `Art. 1-1 Teste 1.
I - inciso 1;
I-1 - inciso 1;
II - inciso 2:
a) teste 1;
a-1) teste xxx;
a-27) teste xxx;
b) teste 2:
1. teste 1;
1-1. teste xxx;
2. teste 2;
§1 Parágrafo 1.
§1-1 Parágrafo 1.
§2 Parágrafo 2.
Art. 2-1 Teste 1.
`;

    const textoEsperado = `Art. 1-A Teste 1.
I - inciso 1;
I-A - inciso 1;
II - inciso 2:
a) teste 1;
a-A) teste xxx;
a-AA) teste xxx;
b) teste 2:
1. teste 1;
1-A. teste xxx;
2. teste 2;
§1 Parágrafo 1.
§1-A Parágrafo 1.
§2 Parágrafo 2.
Art. 2-A Teste 1.
`;

    expect(converterSufixoDosRotulos(texto)).to.equal(textoEsperado);
  });
});
