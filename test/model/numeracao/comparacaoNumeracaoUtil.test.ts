import { expect } from '@open-wc/testing';
import { comparaNumeracao } from '../../../src/model/lexml/numeracao/numeracaoUtil';

describe('Testando Comparação de NumeracaoUtil', () => {
  describe('Testando a comparação de números', () => {
    it('1 deveria ser igual a 1', () => {
      const um = '1';
      const outro = '1';

      expect(comparaNumeracao(um, outro)).to.equal(0);
    });
    it('0 deveria ser menor do que 1', () => {
      const um = '0';
      const outro = '1';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('2 deveria ser menor do que 10', () => {
      const um = '2';
      const outro = '10';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('0-1 deveria ser menor do que 1', () => {
      const um = '0-1';
      const outro = '1';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('1 deveria ser menor do que 1-1', () => {
      const um = '1';
      const outro = '1-1';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('1 deveria ser menor do que 1-1', () => {
      const um = '1-1';
      const outro = '1-2';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('2 deveria ser maior do que 1-2', () => {
      const um = '2';
      const outro = '1-2';

      expect(comparaNumeracao(um, outro)).to.equal(-1);
    });
    it('1-1 deveria ser menor do que 1-1-1', () => {
      const um = '1-1';
      const outro = '1-1-1';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('1-1-9 deveria ser menor do que 1-1-10', () => {
      const um = '1-1-9';
      const outro = '1-1-10';

      expect(comparaNumeracao(um, outro)).to.equal(1);
    });
    it('1-10 deveria ser maior do que 1-9-1', () => {
      const um = '1-10';
      const outro = '1-9-1';

      expect(comparaNumeracao(um, outro)).to.equal(-1);
    });
    it('1-10-1 deveria ser igual a 1-10-1', () => {
      const um = '1-10-1';
      const outro = '1-10-1';

      expect(comparaNumeracao(um, outro)).to.equal(0);
    });
  });
});
