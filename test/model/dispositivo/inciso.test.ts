import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let inciso: Dispositivo;
let paragrafo: Dispositivo;
let artigo: Artigo;

describe('Inciso', () => {
  beforeEach(function () {
    const articulacao = DispositivoLexmlFactory.createArticulacao();
    artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, articulacao) as Artigo;
    paragrafo = DispositivoLexmlFactory.create(TipoDispositivo.paragrafo.tipo, artigo);
    inciso = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, paragrafo);
  });
  describe('Inicialização de Inciso', () => {
    it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração e rótulo', () => {
      expect(inciso.name).to.equal(TipoDispositivo.inciso.tipo);
      expect(inciso.uuid).to.greaterThan(0);

      expect(inciso.numero).to.be.undefined;
      expect(inciso.rotulo).to.be.undefined;
    });
    it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
      expect(inciso.filhos?.length).to.equal(0);
    });
  });
  describe('Hierarquia de Inciso', () => {
    it('quando criado a partir da factory e adicionado ao parágrafo, o inciso é filho do parágrafo', () => {
      expect(paragrafo.filhos.length).to.be.equal(1);
    });
    it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
      expect(validaHierarquia(inciso).length).to.be.equal(0);
    });
    it('quando criado a partir da factory e adicionado ao caput, o inciso é filho do caput', () => {
      DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, artigo.caput!);

      expect(artigo.caput!.filhos.length).to.be.equal(1);
    });
    it('quando criado a partir da factory e adicionado ao caput, o inciso é listado como filho do artigo', () => {
      const inc = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, artigo.caput!);
      expect(artigo.filhos).includes(inc);
    });
  });
  describe('Renumeração de Inciso', () => {
    it('quando inicializado corretamente, o inciso obtém um número quando comandada a renumeração a partir do pai', () => {
      paragrafo.renumeraFilhos();
      expect(inciso.numero).to.equal('1');
    });
    it('quando inicializado corretamente, o inciso obtém um rótulo quando comandada a renumeração a partir do pai', () => {
      paragrafo.renumeraFilhos();
      expect(inciso.rotulo).to.equal('I –');
    });
    it('quando inicializado corretamente, o inciso gera rótulos sequenciais', () => {
      const i2 = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, paragrafo);
      const i3 = DispositivoLexmlFactory.create(TipoDispositivo.inciso.tipo, paragrafo);
      paragrafo.renumeraFilhos();
      expect(i2.rotulo).to.equal('II –');
      expect(i3.rotulo).to.equal('III –');
    });
    it('quando for solicitada a criação de uma rótulo após ter sido definido um número válido, o inciso gera um rótulo válido', () => {
      inciso.numero = '1';
      inciso.createRotulo();
      expect(inciso.rotulo).equal('I –');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido, o inciso gera um rótulo inválido', () => {
      inciso.numero = '0';
      inciso.createRotulo();
      expect(inciso.rotulo).not.equal('I –');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido ou executada a renumeração, a inciso gera um rótulo inválido', () => {
      inciso.createRotulo();
      expect(inciso.rotulo).to.undefined;
    });
  });
});
