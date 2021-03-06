import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquia-validator';
let articulacao: Articulacao;
let capitulo: Dispositivo;

describe('Capitulo', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
    capitulo = DispositivoLexmlFactory.create(TipoDispositivo.capitulo.tipo, articulacao);
  });
  describe('Inicialização de Capítulo', () => {
    it('O capitulo é inicializado corretamente a partir da factory', () => {
      expect(capitulo.name).to.equal(TipoDispositivo.capitulo.tipo);
      expect(capitulo.uuid).to.greaterThan(0);
    });
    describe('A estrutura do Capitulo', () => {
      it('O capitulo não possui filhos ao ser inicializado, mas o método retorna pelo menos um array vazio', () => {
        expect(capitulo.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(capitulo).length).to.be.equal(0);
      });
      it('O capitulo possui pai apenas a Articulação, Parte, Livro, Título ou DispositivoAgrupadorGenerico', () => {
        expect(capitulo.pai).to.be.equal(articulacao);
        const outro = DispositivoLexmlFactory.create(TipoDispositivo.agrupadorGenerico.tipo, articulacao);
        capitulo.pai = outro;
        expect(capitulo.pai).to.be.equal(outro);
      });
      it('O capitulo comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, capitulo);
        capitulo.renumeraFilhos();
        expect(artigo.numero).to.equal('1');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('O capitulo delega a renumeração de artigos à Articulação', () => {
        const outroCapitulo = DispositivoLexmlFactory.create(TipoDispositivo.capitulo.tipo, articulacao);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, capitulo) as Artigo;
        const outroArtigo = DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, outroCapitulo) as Artigo;
        capitulo.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('O capitulo pode possuir, como filhos, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        DispositivoLexmlFactory.create(TipoDispositivo.secao.tipo, capitulo);
        DispositivoLexmlFactory.create(TipoDispositivo.artigo.tipo, capitulo);
        expect(capitulo.filhos?.length).to.equal(2);
      });
    });
  });
});
