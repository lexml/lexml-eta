import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';

let articulacao: Articulacao;
let parte: Dispositivo;

describe('Parte', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    parte = DispositivoLexmlFactory.create(TipoDispositivo.parte.tipo, articulacao);
  });
  describe('Inicialização de Parte', () => {
    it('A parte é inicializada corretamente a partir da factory', () => {
      expect(parte.name).to.equal(TipoDispositivo.parte.tipo);
      expect(parte.uuid).to.greaterThan(0);
    });
    describe('A estrutura da Parte', () => {
      it('A parte não possui filhos ao ser inicializada, mas o método retorna pelo menos um array vazio', () => {
        expect(parte.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(parte).length).to.be.equal(0);
      });
      it('A parte possui como pai apenas a Articulação ou DispositivoAgrupadorGenerico', () => {
        parte.pai = articulacao;
        expect(parte.pai).to.be.equal(articulacao);
        const outro = DispositivoLexmlFactory.create(TipoDispositivo.agrupadorGenerico.tipo, articulacao);
        parte.pai = outro;
        expect(parte.pai).to.be.equal(outro);
      });
      it('A parte comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, parte);
        parte.renumeraFilhos();
        expect(artigo.numero).to.equal('1');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('A parte comanda a criação e renumeração dos dispositivos agrupadores imediatamente abaixo dele', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, parte);
        const t2 = DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, parte);
        parte.renumeraFilhos();
        expect(t2.numero).to.equal('2');
      });
      it('O parte não comanda a renumeração de artigos que não pertençam a ela', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, parte);
        const outraParte = DispositivoLexmlFactory.create(TipoDispositivo.parte.tipo, articulacao);
        const outroArtigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, outraParte);
        parte.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('A parte pode possuir, como filhos, Livro, Titulo, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, parte);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, parte);
        expect(parte.filhos?.length).to.equal(2);
      });
    });
  });
});
