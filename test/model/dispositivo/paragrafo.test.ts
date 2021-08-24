import { expect } from '@open-wc/testing';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let artigo: Artigo;
let paragrafo: Dispositivo;

describe(TipoDispositivo.paragrafo.tipo, () => {
  beforeEach(function () {
    const articulacao = DispositivoLexmlFactory.createArticulacao();
    artigo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    paragrafo = DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
  });
  describe('Inicialização de Paragrafo', () => {
    it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração e rótulo', () => {
      expect(paragrafo.name).to.equal(TipoDispositivo.paragrafo.tipo);
      expect(paragrafo.uuid).to.greaterThan(0);

      expect(paragrafo.rotulo).to.be.undefined;
    });
    it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
      expect(paragrafo.filhos?.length).to.equal(0);
    });
  });
  describe('Hierarquia de Paragrafo', () => {
    it('quando criado a partir da factory e adicionado ao pai, o paragrafo é filho do artigo', () => {
      expect(artigo.filhos.length).to.be.equal(1);
    });
    it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
      expect(validaHierarquia(paragrafo).length).to.be.equal(0);
    });
  });
  describe('Renumeração de Paragrafo', () => {
    it('quando inicializado corretamente, o paragrafo obtém um número quando comandada a renumeração a partir do pai', () => {
      artigo.renumeraFilhos();
      expect(paragrafo.numero).to.equal('1');
    });
    it('quando inicializado corretamente, o paragrafo obtém um rótulo de parágrafo único quando se trata do único parágrafo', () => {
      artigo.renumeraFilhos();
      expect(paragrafo.rotulo).to.equal('Parágrafo único.');
    });
    it('quando inicializado corretamente, o paragrafo obtém um rótulo de parágrafo 1º quando não se trata do único parágrafo', () => {
      DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
      artigo.renumeraFilhos();
      expect(paragrafo.rotulo).to.equal('§ 1º');
    });
    it('quando inicializado corretamente, o paragrafo gera rótulos sequenciais', () => {
      const p2 = DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
      const p3 = DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
      artigo.renumeraFilhos();
      expect(p2.rotulo).to.equal('§ 2º');
      expect(p3.rotulo).to.equal('§ 3º');
    });
    it('quando inicializado corretamente, o parágrafo gera rótulos diferentes a partir do 10º parágrafo', () => {
      for (let i = 0; i < 8; i++) {
        DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
      }
      const p = DispositivoLexmlFactory.create(artigo, TipoDispositivo.paragrafo.tipo);
      artigo.renumeraFilhos();

      expect(p.rotulo).to.equal('§ 10.');
    });
    it('quando for solicitada a criação de uma rótulo após ter sido definido um número válido, o paragrafo gera um rótulo válido', () => {
      paragrafo.numero = '1';
      paragrafo.createRotulo(paragrafo);
      expect(paragrafo.rotulo).equal('Parágrafo único.');
    });
    it('quando for solicitada a criação de uma rótulo sem que tenha sido definido um número válido, o paragrafo gera um rótulo inválido', () => {
      paragrafo.numero = '0';
      paragrafo.createRotulo(paragrafo);
      expect(paragrafo.rotulo).not.equal('undefined');
    });
  });
});
