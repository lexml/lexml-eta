import { expect } from '@open-wc/testing';
import { Articulacao, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let parte: Dispositivo;

describe('Parte', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    parte = criaDispositivo(articulacao, TipoDispositivo.parte.tipo);
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
        const outro = criaDispositivo(articulacao, TipoDispositivo.agrupadorGenerico.tipo);
        parte.pai = outro;
        expect(parte.pai).to.be.equal(outro);
      });
      it('A parte comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = criaDispositivo(parte, TipoDispositivo.artigo.tipo);
        parte.renumeraFilhos();
        expect(artigo.numero).to.equal('1u');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('A parte pode possuir, como filhos, Livro, Titulo, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        criaDispositivo(parte, TipoDispositivo.secao.tipo);
        criaDispositivo(parte, TipoDispositivo.artigo.tipo);
        expect(parte.filhos?.length).to.equal(2);
      });
    });
  });
});
