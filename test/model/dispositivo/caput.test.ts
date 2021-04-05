import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let articulacao: Articulacao;
let artigo: Artigo;
let caput: Dispositivo;

describe('Caput: inicialização', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, articulacao) as Artigo;
    caput = artigo.caput!;
  });
  describe('Inicialização de Caput', () => {
    it('quando criado a partir da factory, o dispositivo é inicializado corretamente mas sem informação de numeração e rótulo', () => {
      expect(caput.name).to.equal(TipoDispositivo.caput.tipo);
      expect(caput.uuid).to.greaterThan(0);

      expect(caput.numero).to.be.undefined;
      expect(caput.rotulo).to.be.undefined;
    });
    it('quando criado a partir da factory, o dispositivo não possui filhos, mas o método retorna pelo menos um array vazio', () => {
      expect(caput.filhos?.length).to.equal(0);
    });
    it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
      expect(validaHierarquia(caput).length).to.be.equal(0);
    });
  });
  describe('Hierarquia de Caput', () => {
    it('quando o Artigo é criado a partir da factory, o caput é criado automaticamente', () => {
      expect(artigo.caput).to.be.equal(caput);
    });
    it('quando criado a partir da factory, o caput NÃO é filho desse artigo mas um atributo do mesmo', () => {
      expect(artigo.filhos.length).to.be.equal(0);
      expect(artigo.caput).not.to.be.undefined;
    });
  });
  describe('Renumeração de Caput', () => {
    it('Quando renumerado, o caput não cria número ou rótulo', () => {
      artigo.renumeraFilhos();

      expect(caput.numero).to.be.undefined;
      expect(caput.rotulo).to.be.undefined;
    });
    it('Quando solicitada a criação de rótulo, o caput não cria rótulo', () => {
      caput.createRotulo();

      expect(caput.rotulo).to.be.undefined;
    });
  });
});
