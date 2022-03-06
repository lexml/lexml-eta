import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let subsecao: Dispositivo;

// todo bug estranho. permite subsecao ter como pai uma articulacao
describe('Subsecao', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    const secao = criaDispositivo(articulacao, TipoDispositivo.secao.tipo);
    subsecao = criaDispositivo(secao, TipoDispositivo.subsecao.tipo);
  });
  describe('Inicialização de Título', () => {
    it('A Subseção é inicializada corretamente a partir da factory', () => {
      expect(subsecao.name).to.equal(TipoDispositivo.subsecao.tipo);
      expect(subsecao.uuid).to.greaterThan(0);
    });
    describe('A estrutura da subsecao', () => {
      it('A Subseção não possui filhos ao ser inicializada, mas o método retorna pelo menos um array vazio', () => {
        expect(subsecao.filhos?.length).to.equal(0);
      });
      it('quando criado a partir da factory a hierarquia do dispositivo é válida', () => {
        expect(validaHierarquia(subsecao).length).to.be.equal(0);
      });
      it('A seção comanda a criação e renumeração dos dispositivos imediatamente abaixo dela', () => {
        const artigo = criaDispositivo(subsecao, TipoDispositivo.artigo.tipo);
        subsecao.renumeraFilhos();
        expect(artigo.numero).to.equal('1u');
      });
      it('O subsecao pode possuir, como filhos, apenas Artigo', () => {
        criaDispositivo(subsecao, TipoDispositivo.subsecao.tipo);
        expect(subsecao.filhos?.length).to.equal(1);
      });
    });
  });
});
