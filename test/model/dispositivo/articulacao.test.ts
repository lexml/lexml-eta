import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;

describe('Articulacao', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
  });
  describe('A estrutura da Articulacao', () => {
    it('A articulação não possui filhos ao ser inicializado, mas o método retorna pelo menos um array vazio', () => {
      expect(articulacao.filhos?.length).to.equal(0);
    });
    it('A articulação não possui pai', () => {
      const articulacao = createArticulacao();
      articulacao.pai = undefined;
      expect(articulacao.pai).to.be.undefined;
    });
    it('A articulação comanda a criação e renumeração dos dispositivos imediatamente abaixo dela', () => {
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      articulacao.renumeraFilhos();
      expect(titulo.rotulo).to.equal('Título único');
    });
    it('A articulação pode possuir, como filhos, dispositivos agrupadores e artigos', () => {
      criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      expect(articulacao.filhos?.length).to.equal(2);
    });
  });
});
