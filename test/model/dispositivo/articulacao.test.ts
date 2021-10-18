import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { DispositivoLexmlFactory } from '../../../src/model/lexml/dispositivo/dispositivo-lexml-factory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipo-dispositivo';

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
      const titulo = DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
      articulacao.renumeraFilhos();
      expect(titulo.rotulo).to.equal('TÍTULO I');
    });
    it('A articulação pode possuir, como filhos, dispositivos agrupadores e artigos', () => {
      DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
      DispositivoLexmlFactory.create(articulacao, TipoDispositivo.titulo.tipo);
      expect(articulacao.filhos?.length).to.equal(2);
    });
  });
});
