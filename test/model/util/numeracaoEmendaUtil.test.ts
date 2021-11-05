import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { calculaNumeracao, contaIrmaosNaoOriginaisConsecutivosAte, contaIrmaosOriginaisAte, hasIrmaoOriginalDepois } from '../../../src/model/lexml/numeracao/numeracaoUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { DispositivoOriginal } from '../../../src/model/lexml/situacao/dispositivoOriginal';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;

describe('Numeração de artigos de emenda', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    artigo1.situacao = new DispositivoOriginal();
    artigo1.rotulo = 'Art. 1º';
    const artigo2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    artigo2.situacao = new DispositivoOriginal();
    artigo2.rotulo = 'Art. 2º';
  });
  it('o artigo 1 deveria ter um dispositivo orignal posterior', () => {
    expect(hasIrmaoOriginalDepois(articulacao.artigos[0])).to.true;
  });
  it('o artigo 2 nao deveria ter um dispositivo orignal posterior', () => {
    expect(hasIrmaoOriginalDepois(articulacao.artigos[1])).to.false;
  });
  describe('Testando a numeracao de um dispositivo adicionado após o último artigo', () => {
    let artigo;
    beforeEach(function () {
      artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      artigo.texto = 'novo';
      artigo.situacao = new DispositivoAdicionado();
    });
    it('o artigo 3 deveria ter dois dispositivos originais anteriores', () => {
      expect(contaIrmaosOriginaisAte(articulacao.artigos[2])).to.equal(2);
    });
    it('o artigo 3 é o unico dispositivo nao original', () => {
      expect(contaIrmaosNaoOriginaisConsecutivosAte(articulacao.artigos[2])).to.equal(1);
    });
    it('o artigo 3 deveria ter como numeracao 3', () => {
      expect(calculaNumeracao(articulacao.artigos[2])).to.equal('3');
    });
  });
  describe('Testando a numeracao de um dispositivo adicionado entre dois artigos originais', () => {
    let artigo;
    beforeEach(function () {
      artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, articulacao.artigos[0]);
      artigo.texto = 'novo';
      artigo.situacao = new DispositivoAdicionado();
    });
    it('o artigo criado deveria ter um dispositivo original anterior', () => {
      expect(contaIrmaosOriginaisAte(articulacao.artigos[2])).to.equal(2);
    });
    it('o artigo criado é o unico dispositivo nao original', () => {
      expect(contaIrmaosNaoOriginaisConsecutivosAte(articulacao.artigos[1])).to.equal(1);
    });
    it('o artigo criado deveria ter como numeracao 1-A', () => {
      expect(calculaNumeracao(articulacao.artigos[1])).to.equal('1-A');
    });
  });
  describe('Testando outras situacoes', () => {
    let artigo;
    beforeEach(function () {
      artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, articulacao.artigos[0]);
      artigo.texto = 'novo';
      artigo.situacao = new DispositivoAdicionado();
    });
    describe('Testando a numeracao de um dispositivo adicionado entre um original e um adicionado', () => {
      let artigo;
      beforeEach(function () {
        artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, articulacao.artigos[0]);
        artigo.texto = 'novo2';
        artigo.situacao = new DispositivoAdicionado();
      });
      it('o artigo criado deveria ter um dispositivo original anterior', () => {
        expect(contaIrmaosOriginaisAte(articulacao.artigos[1])).to.equal(1);
      });
      it('o artigo criado nao possui antes um dispositivo nao original', () => {
        expect(contaIrmaosNaoOriginaisConsecutivosAte(articulacao.artigos[1])).to.equal(1);
      });
      it('o artigo criado deveria ter como numeracao 1-A', () => {
        expect(calculaNumeracao(articulacao.artigos[1])).to.equal('1-A');
      });
      it('o artigo criado anteriormente deveria ter como numeracao 1-B', () => {
        expect(calculaNumeracao(articulacao.artigos[2])).to.equal('1-B');
      });
    });
    describe('Testando a numeracao de um dispositivo adicionado entre um adicionado e um original', () => {
      let artigo;
      beforeEach(function () {
        artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, articulacao.artigos[1]);
        artigo.texto = 'novo2';
        artigo.situacao = new DispositivoAdicionado();
      });
      it('o artigo criado deveria ter um dispositivo original anterior', () => {
        expect(contaIrmaosOriginaisAte(articulacao.artigos[1])).to.equal(1);
      });
      it('o artigo criado nao possui antes um dispositivo nao original', () => {
        expect(contaIrmaosNaoOriginaisConsecutivosAte(articulacao.artigos[1])).to.equal(1);
      });
      it('o artigo criado deveria ter como numeracao 1-B', () => {
        expect(calculaNumeracao(articulacao.artigos[2])).to.equal('1-B');
        expect(articulacao.artigos[2].texto).equal('novo2');
      });
      it('o artigo criado anteriormente deveria ter como numeracao 1-A', () => {
        expect(calculaNumeracao(articulacao.artigos[1])).to.equal('1-A');
        expect(articulacao.artigos[1].texto).equal('novo');
      });
      describe('Testando a numeracao de um dispositivo adicionado entre dois adicionados', () => {
        let artigo;
        beforeEach(function () {
          artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, articulacao.artigos[1]);
          artigo.texto = 'novo3';
          artigo.situacao = new DispositivoAdicionado();
        });
        it('o artigo criado deveria ter um dispositivo original anterior', () => {
          expect(contaIrmaosOriginaisAte(articulacao.artigos[1])).to.equal(1);
        });
        it('o artigo criado nao possui antes um dispositivo nao original', () => {
          expect(contaIrmaosNaoOriginaisConsecutivosAte(articulacao.artigos[1])).to.equal(1);
        });
        it('o artigo criado deveria ter como numeracao 1-B', () => {
          expect(calculaNumeracao(articulacao.artigos[2])).to.equal('1-B');
          expect(articulacao.artigos[2].texto).equal('novo3');
        });
        it('o artigo criado anteriormente deveria ter como numeracao 1-C', () => {
          expect(calculaNumeracao(articulacao.artigos[3])).to.equal('1-C');
          expect(articulacao.artigos[3].texto).equal('novo2');
        });
      });
    });
  });
});
