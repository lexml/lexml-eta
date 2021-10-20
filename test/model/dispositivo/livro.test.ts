import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let livro: Dispositivo;

describe('Livro', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    livro = criaDispositivo(articulacao, TipoDispositivo.livro.tipo);
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
        const outro = criaDispositivo(articulacao, TipoDispositivo.parte.tipo);
        livro.pai = outro;
        expect(livro.pai).to.be.equal(outro);
      });
      it('O livro comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = criaDispositivo(livro, TipoDispositivo.artigo.tipo);
        livro.renumeraFilhos();
        expect(artigo.numero).to.equal('1');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('O livro não comanda a renumeração de artigos que não pertençam a ele', () => {
        const outroLivro = criaDispositivo(articulacao, TipoDispositivo.livro.tipo);
        criaDispositivo(livro, TipoDispositivo.artigo.tipo);
        const outroArtigo = criaDispositivo(outroLivro, TipoDispositivo.artigo.tipo);
        livro.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('O livro pode possuir, como filhos, Titulo, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        criaDispositivo(livro, TipoDispositivo.secao.tipo);
        criaDispositivo(livro, TipoDispositivo.artigo.tipo);
        expect(livro.filhos?.length).to.equal(2);
      });
    });
  });
});
