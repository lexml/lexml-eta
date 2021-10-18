import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { REMOVER_ELEMENTO } from '../../../src/redux/elemento/action/elementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;

describe('Testando a exclusão de artigos', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Inicialização do teste utilizando uma norma com 5 artigos, sem agrupadores', () => {
    it('Deveria possui 5 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(5);
    });
  });
  describe('Testando a exclusão do artigo 1º, que não possui somente incisos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
    });
    describe('Testando a articulação resultante da ação de exclusão do artigo', () => {
      it('Deveria possuir 4 artigos após excluir o artigo 1º', () => {
        expect(state.articulacao.artigos.length).to.equal(4);
      });
      it('Deveria retornar o artigo 2º no lugar do artigo 1º, mas já renumeradoº', () => {
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do Artigo 2.');
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
      });
      it('Deveria apresentar o último artigo renumerado para 3º', () => {
        expect(state.articulacao.artigos[3].rotulo).to.equal('Art. 4º');
      });
    });
    describe('Testando os eventos resultantes da ação de exclusão do artigo', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(state.ui.events.length).to.equal(2);
      });
      it('Deveria apresentar 1 elemento removido já que o artigo não possui filhos', () => {
        expect(state.ui.events[0].elementos.length).equal(1);
      });
      it('Deveria apresentar o artigo 1 no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 1.');
      });
      it('Deveria apresentar o artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(state.ui.events[1].elementos.length).equal(4);
      });
    });
  });
  describe('Testando a exclusão do artigo 5º, que não possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[4];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
    });
    describe('Testando a articulação resultante da ação de exclusão do artigo', () => {
      it('Deveria possuir 4 artigos após excluir o artigo 1º', () => {
        expect(state.articulacao.artigos.length).to.equal(4);
      });
      it('Deveria apresentar como último artigo o artigo 4º', () => {
        expect(state.articulacao.artigos[3].rotulo).to.equal('Art. 4º');
      });
    });
    describe('Testando os eventos resultantes da ação de exclusão do artigo', () => {
      it('Deveria apresentar 1 evento', () => {
        expect(state.ui.events.length).to.equal(1);
      });
      it('Deveria apresentar 1 elemento removido já que o artigo não possui filhos', () => {
        expect(state.ui.events[0].elementos.length).equal(1);
      });
      it('Deveria apresentar o artigo 5 no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 5.');
      });
    });
  });
});
