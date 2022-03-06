import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let titulo: Dispositivo;

describe('Titulo', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
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
        const outro = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        titulo.pai = outro;
        expect(titulo.pai).to.be.equal(outro);
      });
      it('O titulo comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = criaDispositivo(titulo, TipoDispositivo.artigo.tipo);
        titulo.renumeraFilhos();

        expect(artigo.numero).to.equal('1u');
      });
      it('O titulo não comanda a renumeração de artigos que não pertençam a ele', () => {
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const outroTitulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        const outroArtigo = criaDispositivo(outroTitulo, TipoDispositivo.artigo.tipo);
        titulo.renumeraFilhos();
        expect(outroArtigo.rotulo).equals(undefined);
      });
      it('O titulo pode possuir, como filhos, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        criaDispositivo(titulo, TipoDispositivo.secao.tipo);
        criaDispositivo(titulo, TipoDispositivo.secao.tipo);
        expect(titulo.filhos?.length).to.equal(2);
      });
    });
  });
});
