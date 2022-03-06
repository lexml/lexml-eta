import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaHierarquia } from '../../../src/model/lexml/hierarquia/hierarquiaValidator';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
let articulacao: Articulacao;
let capitulo: Dispositivo;

describe('Capitulo', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
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
        const outro = criaDispositivo(articulacao, TipoDispositivo.agrupadorGenerico.tipo);
        capitulo.pai = outro;
        expect(capitulo.pai).to.be.equal(outro);
      });
      it('O capitulo comanda a criação e renumeração dos dispositivos imediatamente abaixo dele', () => {
        const artigo = criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
        capitulo.renumeraFilhos();
        expect(artigo.numero).to.equal('1u');
        expect(artigo.rotulo).to.equal('Artigo único.');
      });
      it('O capitulo delega a renumeração de artigos à Articulação', () => {
        const outroCapitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo) as Artigo;
        const outroArtigo = criaDispositivo(outroCapitulo, TipoDispositivo.artigo.tipo) as Artigo;
        capitulo.renumeraFilhos();
        expect(outroArtigo.rotulo).to.equal('Art. 2º');
      });
      it('O capitulo pode possuir, como filhos, Capitulo, Secao, DispositivoAgrupadorGenerico, Artigo e DispositivoGenerico', () => {
        criaDispositivo(capitulo, TipoDispositivo.secao.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
        expect(capitulo.filhos?.length).to.equal(2);
      });
    });
  });
});
