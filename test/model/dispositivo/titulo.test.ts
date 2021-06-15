import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let articulacao: Articulacao;
let titulo: Dispositivo;

describe('Titulo', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    titulo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
  });
  describe('Inicialização de Título', () => {
    it('O título é inicializado corretamente a partir da factory', () => {
      expect(titulo.name).to.equal('Titulo');
      expect(titulo.uuid).to.greaterThan(0);
    });
    describe('A estrutura do Titulo', () => {
      it('O título não possui filhos ao ser inicializado, mas o método retorna pelo menos um array vazio', () => {
        expect(titulo.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(titulo).length).to.be.equal(0);
      });
      it('O título possui pai apenas a Articulação, Parte, Livro ou DispositivoAgrupadorGenerico', () => {
        titulo.pai = articulacao;
        expect(titulo.pai).to.be.equal(articulacao);
        const outro = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
        titulo.pai = outro;
        expect(titulo.pai).to.be.equal(outro);
      });
      it('O titulo comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = DispositivoLexmlFactory.create(titulo, TipoDispositivo.artigo.tipo);
        titulo.renumeraFilhos();

        expect(artigo.numero).to.equal('1');
      });
      it('O titulo não comanda a renumeração de artigos que não pertençam a ele', () => {
        DispositivoLexmlFactory.create(articulacao, TipoDispositivo.artigo.tipo);
        const outroTitulo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
        const outroArtigo = DispositivoLexmlFactory.create(outroTitulo, TipoDispositivo.artigo.tipo);
        titulo.renumeraFilhos();
        expect(outroArtigo.rotulo).equals('Art. 2º');
      });
      it('O titulo pode possuir, como filhos, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(titulo, TipoDispositivo.secao.tipo);
        DispositivoLexmlFactory.create(titulo, TipoDispositivo.secao.tipo);
        expect(titulo.filhos?.length).to.equal(2);
      });
    });
  });
});
