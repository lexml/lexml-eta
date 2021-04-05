import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let articulacao: Articulacao;
let livro: Dispositivo;

describe('Livro', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    livro = DispositivoLexmlFactory.create(TipoDispositivo.livro.tipo, articulacao);
  });
  describe('Inicialização de Livro', () => {
    it('O livro é inicializado corretamente a partir da factory', () => {
      expect(livro.name).to.equal(TipoDispositivo.livro.tipo);
      expect(livro.uuid).to.greaterThan(0);
    });
    describe('A estrutura do Livro', () => {
      it('O livro não possui filhos ao ser inicializado, mas o método retorna pelo menos um array vazio', () => {
        expect(livro.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(livro).length).to.be.equal(0);
      });
      it('O livro possui pai apenas a Articulação, Parte, Título', () => {
        expect(livro.pai).to.be.equal(articulacao);
        const outro = DispositivoLexmlFactory.create(TipoDispositivo.parte.tipo, articulacao);
        livro.pai = outro;
        expect(livro.pai).to.be.equal(outro);
      });
      it('O livro comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, livro);
        livro.renumeraFilhos();
        expect(artigo.numero).to.equal('1');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('O livro não comanda a renumeração de artigos que não pertençam a ele', () => {
        const outroLivro = DispositivoLexmlFactory.create(TipoDispositivo.livro.tipo, articulacao);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, livro);
        const outroArtigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, outroLivro);
        livro.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('O livro pode possuir, como filhos, Titulo, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, livro);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, livro);
        expect(livro.filhos?.length).to.equal(2);
      });
    });
  });
});
