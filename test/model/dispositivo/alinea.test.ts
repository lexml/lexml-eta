import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let inciso: Dispositivo;
let alinea: Dispositivo;

describe('Alínea', () => {
  beforeEach(function () {
    const articulacao = DispositivoLexmlFactory.createArticulacao();
    inciso = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, articulacao);
    alinea = DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
  });
  describe('Inicialização de Alinea', () => {
    it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração e rótulo', () => {
      expect(alinea.name).to.equal(TipoDispositivo.alinea.tipo);
      expect(alinea.uuid).to.greaterThan(0);

      expect(alinea.numero).to.be.undefined;
      expect(alinea.rotulo).to.be.undefined;
    });
    it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
      expect(alinea.filhos?.length).to.equal(0);
    });
  });
  describe('Hierarquia de Alinea', () => {
    it('quando criado a partir da factory e adicionado ao parágrafo, a alinea é filha do inciso', () => {
      expect(inciso.filhos.length).to.be.equal(1);
    });
    it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
      expect(validaHierarquia(alinea).length).to.be.equal(0);
    });
  });
  describe('Renumeração de Alinea', () => {
    it('quando inicializada corretamente, a alinea obtém um número quando comandada a renumeração a partir do pai', () => {
      inciso.renumeraFilhos();
      expect(alinea.numero).to.equal('1');
    });
    it('quando inicializada corretamente, a alinea obtém um rótulo quando comandada a renumeração a partir do pai', () => {
      inciso.renumeraFilhos();
      expect(alinea.rotulo).to.equal('a)');
    });
    it('quando inicializada corretamente, a alinea gera rótulos sequenciais', () => {
      inciso.renumeraFilhos();
      expect(alinea.rotulo).to.equal('a)');

      const a2 = DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
      const a3 = DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
      inciso.renumeraFilhos();
      expect(a2.rotulo).to.equal('b)');
      expect(a3.rotulo).to.equal('c)');
    });
    it('Mesmo que inicializada corretamente, a alinea não gera rótulos sequenciais quando ultrapassar o número de letras do alfabeto', () => {
      for (let i = 0; i < 24; i++) {
        DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
      }
      const a1 = DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
      inciso.renumeraFilhos();
      expect(a1.rotulo).to.equal('z)');
      const a2 = DispositivoLexmlFactory.create(TipoDispositivo.alinea.tipo, inciso);
      inciso.renumeraFilhos();
      expect(a2.rotulo).to.equal('{)');
    });
    it('quando for solicitada a criação de uma rótulo após ter sido definido um número válido, a alinea gera um rótulo válido', () => {
      alinea.numero = '1';
      alinea.createRotulo();
      expect(alinea.rotulo).equal('a)');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido, a alinea gera um rótulo inválido', () => {
      alinea.numero = '0';
      alinea.createRotulo();
      expect(alinea.rotulo).not.equal('a)');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido ou executada a renumeração, a alinea gera um rótulo inválido', () => {
      alinea.createRotulo();
      expect(alinea.rotulo).to.equal('undefined)');
    });
  });
});
