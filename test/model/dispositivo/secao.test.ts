import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let articulacao: Articulacao;
let secao: Dispositivo;

describe('Secao', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    secao = DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, articulacao);
  });
  describe('Inicialização de Secao', () => {
    it('A Seção é inicializada corretamente a partir da factory', () => {
      expect(secao.name).to.equal('Secao');
      expect(secao.uuid).to.greaterThan(0);
    });
    describe('A estrutura da Secao', () => {
      it('A Seção não possui filhos ao ser inicializada, mas o método retorna pelo menos um array vazio', () => {
        expect(secao.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(secao).length).to.be.equal(0);
      });
      it('A Seção possui, como pai, Articulação, Parte, Livro, Capitulo ou DispositivoAgrupadorGenerico', () => {
        secao.pai = articulacao;
        expect(secao.pai).to.be.equal(articulacao);
        const outro = DispositivoLexmlFactory.create(TipoDispositivo.agrupadorGenerico.tipo, articulacao);
        secao.pai = outro;
        expect(secao.pai).to.be.equal(outro);
      });
      it('A seção comanda a criação e renumeração dos dispositivos imediatamente abaixo dela', () => {
        const artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, secao);
        secao.renumeraFilhos();
        expect(artigo.numero).to.equal('1');
      });
      it('A secao não comanda a renumeração de artigos que não pertençam a ela', () => {
        const outraSecao = DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, articulacao);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, secao);
        const outroArtigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, outraSecao);
        secao.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('O secao pode possuir, como filhos, Capitulo, Subsecao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.subsecao.tipo, secao);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, secao);
        expect(secao.filhos?.length).to.equal(2);
      });
    });
  });
});
