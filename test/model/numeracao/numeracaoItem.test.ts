import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { calculaNumeracao } from '../../../src/model/lexml/numeracao/numeracaoUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { DispositivoOriginal } from '../../../src/model/lexml/situacao/dispositivoOriginal';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let alinea: Dispositivo;
let item: Dispositivo;
let segundoItem: Dispositivo;
let terceiroItem: Dispositivo;

describe('Item', () => {
  beforeEach(function () {
    const articulacao = createArticulacao();
    alinea = criaDispositivo(articulacao, TipoDispositivo.alinea.tipo);
    item = criaDispositivo(alinea, TipoDispositivo.item.tipo);
  });
  it('deveria ser inicializada sem informação de numeração e rótulo', () => {
    expect(item.name).to.equal(TipoDispositivo.item.tipo);
    expect(item.uuid).to.greaterThan(0);

    expect(item.numero).to.be.undefined;
    expect(item.rotulo).to.be.undefined;
  });
  describe('Testando a numeração do item adicionado quando este for único', () => {
    beforeEach(function () {
      item.situacao = new DispositivoAdicionado();
      item.numero = calculaNumeracao(item);
      item.createRotulo(item);
    });
    it('deveria ser numerado como 1. ao numerar', () => {
      expect(item.numero).equal('1');
    });
    it('deveria ser rotulado como 1. ao criar rótulo', () => {
      expect(item.rotulo).equal('1.');
    });
  });
  describe('Testando a numeração do item adicionado antes do primeiro dispositivo original', () => {
    beforeEach(function () {
      item.situacao = new DispositivoOriginal();
      item.numero = calculaNumeracao(item);
      item.createRotulo(item);

      segundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, undefined, 0);
      segundoItem.situacao = new DispositivoAdicionado();
      segundoItem.numero = calculaNumeracao(segundoItem);
      segundoItem.createRotulo(segundoItem);
    });
    it('deveria ser numerado como 0 ao numerar', () => {
      expect(segundoItem.numero).equal('0');
    });
    it('deveria ser rotulado como 0. ao criar rótulo', () => {
      expect(segundoItem.rotulo).equal('0.');
    });
  });
  describe('Testando a numeração do item adicionado após o último dispositivo original', () => {
    beforeEach(function () {
      item.situacao = new DispositivoOriginal();
      item.numero = calculaNumeracao(item);
      item.createRotulo(item);

      segundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, item);
      segundoItem.situacao = new DispositivoAdicionado();
      segundoItem.numero = calculaNumeracao(segundoItem);
      segundoItem.createRotulo(segundoItem);
    });
    it('deveria ser numerado como 2 ao numerar', () => {
      expect(segundoItem.numero).equal('2');
    });
    it('deveria ser rotulado como 2. ao criar rótulo', () => {
      expect(segundoItem.rotulo).equal('2.');
    });
  });
  describe('Testando a numeração do item adicionado entre dispositivos em diferentes situações', () => {
    beforeEach(function () {
      item.situacao = new DispositivoOriginal();
      item.numero = calculaNumeracao(item);
      item.createRotulo(item);

      terceiroItem = criaDispositivo(alinea, TipoDispositivo.item.tipo);
      terceiroItem.situacao = new DispositivoOriginal();
      terceiroItem.numero = calculaNumeracao(terceiroItem);
      terceiroItem.createRotulo(terceiroItem);

      segundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, undefined, 1);
      segundoItem.situacao = new DispositivoAdicionado();
      segundoItem.isDispositivoAlteracao = true;

      item.pai!.renumeraFilhos();
    });
    describe('Testando a numeração do item adicionado entre dois dispositivos originais', () => {
      it('deveria ser numerado como 1-1 ao numerar', () => {
        expect(segundoItem.numero).equal('1-1');
      });
      it('deveria ser rotulado como 1-1. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-A.');
      });
    });
    describe('Testando a numeração do item adicionado entre dois dispositivos originais que possuam numeracao 1-1 e 1-2', () => {
      it('deveria ser numerado como 1-1 ao numerar', () => {
        expect(segundoItem.numero).equal('1-1');
      });
      it('deveria ser rotulado como 1-1. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-A.');
      });
    });
    describe('Testando a numeração do item adicionado após original e antes de adicionado', () => {
      let antesSegundoItem;
      beforeEach(function () {
        antesSegundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, item);
        antesSegundoItem.situacao = new DispositivoAdicionado();
        antesSegundoItem.isDispositivoAlteracao = true;
        item.pai!.renumeraFilhos();
      });
      it('deveria ser numerado como 1.1 ao numerar', () => {
        expect(antesSegundoItem.numero).equal('1-1');
      });
      it('deveria ser rotulado como 1.1. ao criar rótulo', () => {
        expect(antesSegundoItem.rotulo).equal('1-A.');
      });
      it('deveria ser numerado como 1.2 ao numerar', () => {
        expect(segundoItem.numero).equal('1-2');
      });
      it('deveria ser rotulado como 1.2. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-B.');
      });
    });
    describe('Testando a numeração do item adicionado após adicionado e antes de original', () => {
      let aposSegundoItem;
      beforeEach(function () {
        aposSegundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, segundoItem);
        aposSegundoItem.situacao = new DispositivoAdicionado();
        aposSegundoItem.isDispositivoAlteracao = true;

        item.pai!.renumeraFilhos();
      });
      it('deveria ser numerado como 1.2 ao numerar', () => {
        expect(aposSegundoItem.numero).equal('1-2');
      });
      it('deveria ser rotulado como 1.2. ao criar rótulo', () => {
        expect(aposSegundoItem.rotulo).equal('1-B.');
      });
    });
    describe('Testando a numeração do item adicionado entre dois adicionados', () => {
      let aposSegundoItem;
      let entreItensAdicionados;
      beforeEach(function () {
        aposSegundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, segundoItem);
        aposSegundoItem.situacao = new DispositivoAdicionado();
        aposSegundoItem.isDispositivoAlteracao = true;

        item.pai!.renumeraFilhos();

        entreItensAdicionados = criaDispositivo(alinea, TipoDispositivo.item.tipo, segundoItem);
        entreItensAdicionados.situacao = new DispositivoAdicionado();
        item.pai!.renumeraFilhos();
      });
      it('deveria ser numerado como 1.3 ao numerar', () => {
        expect(aposSegundoItem.numero).equal('1-3');
      });
      it('deveria ser rotulado como 1.3. ao criar rótulo', () => {
        expect(aposSegundoItem.rotulo).equal('1-C.');
      });
    });
    describe('Testando a numeração do item adicionado entre dois dispositivos originais com numeração em dois níveis', () => {
      beforeEach(function () {
        item.numero = '1-1';
        item.rotulo = '1-1.';

        terceiroItem.numero = '1-2';
        terceiroItem.rotulo = '1-2.';

        item.pai!.renumeraFilhos();
      });
      it('deveria ser numerado como 1-1-1 ao numerar', () => {
        expect(segundoItem.numero).equal('1-1-1');
      });
      it('deveria ser rotulado como 1-1. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-A-A.');
      });
    });
  });

  describe('Testando a numeração do item adicionado em situações envolvendo 3 níveis', () => {
    beforeEach(function () {
      item.situacao = new DispositivoOriginal();
      item.numero = '1-1';
      item.createRotulo(item);

      terceiroItem = criaDispositivo(alinea, TipoDispositivo.item.tipo);
      terceiroItem.situacao = new DispositivoOriginal();
      terceiroItem.numero = '1-2';
      terceiroItem.createRotulo(terceiroItem);

      segundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, undefined, 1);
      segundoItem.situacao = new DispositivoAdicionado();
      segundoItem.isDispositivoAlteracao = true;

      item.pai!.renumeraFilhos();
    });
    describe('Testando a numeração do item adicionado entre dois dispositivos originais com dois níveis', () => {
      it('deveria ser numerado como 1-1-1 ao numerar', () => {
        expect(segundoItem.numero).equal('1-1-1');
      });
      it('deveria ser rotulado como 1-1. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-A-A.');
      });
    });
    describe('Testando a numeração do item adicionado após original e antes de adicionado', () => {
      let antesSegundoItem;
      beforeEach(function () {
        antesSegundoItem = criaDispositivo(alinea, TipoDispositivo.item.tipo, item);
        antesSegundoItem.situacao = new DispositivoAdicionado();
        antesSegundoItem.isDispositivoAlteracao = true;

        item.pai!.renumeraFilhos();
      });
      it('deveria ser numerado como 1.1.1 ao numerar', () => {
        expect(antesSegundoItem.numero).equal('1-1-1');
      });
      it('deveria ser rotulado como 1.A-A. ao criar rótulo', () => {
        expect(antesSegundoItem.rotulo).equal('1-A-A.');
      });
      it('deveria ser numerado como 1.1.2 ao numerar', () => {
        expect(segundoItem.numero).equal('1-1-2');
      });
      it('deveria ser rotulado como 1.2. ao criar rótulo', () => {
        expect(segundoItem.rotulo).equal('1-A-B.');
      });
    });
  });
});
