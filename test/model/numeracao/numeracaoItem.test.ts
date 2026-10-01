import { expect } from '@open-wc/testing';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { calculaNumeracao } from '../../../src/model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let alinea: Dispositivo;
let item: Dispositivo;

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

  describe('Testando a extração de número do rótulo para itens aninhados (normalizaNumeracao)', () => {
    describe('Rótulo com notação de ponto para item aninhado de primeiro nível', () => {
      beforeEach(function () {
        // Simula rótulo de item aninhado: "34.1)" deve extrair apenas "1"
        item.createNumeroFromRotulo('34.1)');
      });
      it('deveria extrair apenas o número do item filho (1), não o do pai (34)', () => {
        expect(item.numero).equal('1');
      });
    });
    describe('Rótulo com notação de ponto para item aninhado de primeiro nível - caso 2', () => {
      beforeEach(function () {
        // Simula rótulo de item aninhado: "34.2)" deve extrair apenas "2"
        item.createNumeroFromRotulo('34.2)');
      });
      it('deveria extrair apenas o número do item filho (2), não o do pai (34)', () => {
        expect(item.numero).equal('2');
      });
    });
    describe('Rótulo com notação de ponto para item aninhado de segundo nível', () => {
      beforeEach(function () {
        // Simula rótulo de item aninhado de segundo nível: "34.1.2)" deve extrair apenas "2"
        item.createNumeroFromRotulo('34.1.2)');
      });
      it('deveria extrair apenas o número do último nível (2)', () => {
        expect(item.numero).equal('2');
      });
    });
    describe('Rótulo com notação de ponto para item aninhado de terceiro nível', () => {
      beforeEach(function () {
        // Simula rótulo de item aninhado de terceiro nível: "1.2.3)" deve extrair apenas "3"
        item.createNumeroFromRotulo('1.2.3)');
      });
      it('deveria extrair apenas o número do último nível (3)', () => {
        expect(item.numero).equal('3');
      });
    });
    describe('Rótulo simples sem aninhamento', () => {
      beforeEach(function () {
        // Rótulo simples: "1)" deve funcionar normalmente
        item.createNumeroFromRotulo('1)');
      });
      it('deveria extrair o número 1', () => {
        expect(item.numero).equal('1');
      });
    });
    describe('Rótulo simples com número maior', () => {
      beforeEach(function () {
        // Rótulo simples: "34)" deve extrair 34
        item.createNumeroFromRotulo('34)');
      });
      it('deveria extrair o número 34', () => {
        expect(item.numero).equal('34');
      });
    });
    describe('Rótulo com hífen (formato alternativo)', () => {
      beforeEach(function () {
        // Rótulo com hífen: "34-1)" - formato alternativo para item aninhado
        item.createNumeroFromRotulo('34-1)');
      });
      it('deveria extrair apenas o número do item filho (1)', () => {
        expect(item.numero).equal('1');
      });
    });
    describe('Rótulo com hífen de múltiplos níveis', () => {
      beforeEach(function () {
        // Rótulo com hífen múltiplo: "34-1-2)" - formato alternativo
        item.createNumeroFromRotulo('34-1-2)');
      });
      it('deveria extrair apenas o número do último nível (2)', () => {
        expect(item.numero).equal('2');
      });
    });
    describe('Rótulo com ponto e hífen misturados', () => {
      beforeEach(function () {
        // Rótulo misto: "34.1-2)" deve extrair 2
        item.createNumeroFromRotulo('34.1-2)');
      });
      it('deveria extrair apenas o número do último segmento (2)', () => {
        expect(item.numero).equal('2');
      });
    });
    describe('Rótulo com letra no complemento', () => {
      beforeEach(function () {
        // Rótulo com letra: "1-A)" - pode ocorrer em alterações
        // O sistema converte a letra A para número 1 internamente
        item.createNumeroFromRotulo('1-A)');
      });
      it('deveria converter a letra A para número 1 (resultado: 1-1)', () => {
        expect(item.numero).equal('1-1');
      });
    });
  });
});
