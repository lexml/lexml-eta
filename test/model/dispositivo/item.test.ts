import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let alinea: Dispositivo;
let item: Dispositivo;

describe('Item', () => {
  beforeEach(function () {
    const articulacao = DispositivoLexmlFactory.createArticulacao();
    alinea = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.alinea.tipo);
    item = DispositivoLexmlFactory.create(alinea, TipoDispositivo.item.tipo);
  });
  describe('Inicialização de Item', () => {
    it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração e rótulo', () => {
      expect(item.name).to.equal(TipoDispositivo.item.tipo);
      expect(item.uuid).to.greaterThan(0);

      expect(item.numero).to.be.undefined;
      expect(item.rotulo).to.be.undefined;
    });
    it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
      expect(item.filhos?.length).to.equal(0);
    });
  });
  describe('Hierarquia de Item', () => {
    it('quando criado a partir da factory e adicionado ao pai, o item é filho da alinea', () => {
      expect(alinea.filhos.length).to.be.equal(1);
    });
    it('quando solicitda a exclusão ao pai, o item é excluído', () => {
      alinea.removeFilho(item);
      expect(alinea.filhos.length).to.be.equal(0);
    });
    it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
      expect(validaHierarquia(item).length).to.be.equal(0);
    });
  });
  describe('Renumeração de Item', () => {
    it('quando inicializado corretamente, o item obtém um número quando comandada a renumeração a partir do pai', () => {
      alinea.renumeraFilhos();
      expect(item.numero).to.equal('1');
    });
    it('quando inicializado corretamente, o item obtém um rótulo quando comandada a renumeração a partir do pai', () => {
      alinea.renumeraFilhos();
      expect(item.rotulo).to.equal('1.');
    });
    it('quando inicializado corretamente, o item gera rótulos sequenciais', () => {
      const i2 = DispositivoLexmlFactory.create(alinea, TipoDispositivo.item.tipo);
      const i3 = DispositivoLexmlFactory.create(alinea, TipoDispositivo.item.tipo);
      alinea.renumeraFilhos();
      expect(i2.rotulo).to.equal('2.');
      expect(i3.rotulo).to.equal('3.');
    });
    it('quando for solicitada a criação de uma rótulo após ter sido definido um número válido, o item gera um rótulo válido', () => {
      item.numero = '1';
      item.createRotulo();
      expect(item.rotulo).equal('1.');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido, o item gera um rótulo inválido', () => {
      item.numero = '0';
      item.createRotulo();
      expect(item.rotulo).not.equal('1.');
    });
  });
});
