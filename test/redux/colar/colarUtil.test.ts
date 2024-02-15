import { expect } from '@open-wc/testing';
import { ajustarRotuloArtigo } from '../../../src/redux/elemento/util/colarUtil';

describe('Testando funções do colarUtil', () => {
  it('ajustarRotuloArtigo', () => {
    const texto = 'Art.          1 Novo texto para o artigo.';
    expect(ajustarRotuloArtigo(texto).startsWith('Art. 1 Novo texto')).to.be.true;
  });
});
