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
    titulo = DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
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
        const outro = DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
        titulo.pai = outro;
        expect(titulo.pai).to.be.equal(outro);
      });
      it('O titulo comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, titulo);
        titulo.renumeraFilhos();

        expect(artigo.numero).to.equal('1');
      });
      it('O titulo não comanda a renumeração de artigos que não pertençam a ele', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, titulo);
        const outroTitulo = DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
        const outroArtigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, outroTitulo);
        titulo.renumeraFilhos();
        expect(outroArtigo.rotulo).equals('Art. 2º');
      });
      it('O titulo pode possuir, como filhos, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, titulo);
        DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, titulo);
        expect(titulo.filhos?.length).to.equal(2);
      });
    });
  });
});
