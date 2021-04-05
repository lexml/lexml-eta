import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/factory/dispositivo-lexml-factory';

let articulacao: Articulacao;

describe('Articulacao', () => {
  beforeEach(function () {
    articulacao = DispositivoLexmlFactory.createArticulacao();
  });
  describe('A estrutura da Articulacao', () => {
    it('A articulação não possui filhos ao ser inicializado, mas o método retorna pelo menos um array vazio', () => {
      expect(articulacao.filhos?.length).to.equal(0);
    });
    it('A articulação não possui pai', () => {
      const articulacao = DispositivoLexmlFactory.createArticulacao();
      articulacao.pai = undefined;
      expect(articulacao.pai).to.be.undefined;
    });
    it('A articulação comanda a criação e renumeração dos dispositivos imediatamente abaixo dela', () => {
      const titulo = DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
      articulacao.renumeraFilhos();
      expect(titulo.rotulo).to.equal('TÍTULO I');
    });
    it('A articulação pode possuir, como filhos, dispositivos agrupadores e artigos', () => {
      DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
      DispositivoLexmlFactory.create(TipoDispositivo.titulo.tipo, articulacao);
      expect(articulacao.filhos?.length).to.equal(2);
    });
  });
});
