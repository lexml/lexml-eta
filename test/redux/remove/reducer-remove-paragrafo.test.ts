import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacao-parser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipo-dispositivo';
import { REMOVER_ELEMENTO } from '../../../src/redux/elemento-actions';
import { removeElemento } from '../../../src/redux/elemento-reducer';
import { EXEMPLO_PARAGRAFOS } from '../../doc/exemplo-paragrafos';

let state: any;

describe('Testando a exclusão de parágrafos', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_PARAGRAFOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a exclusão do Parágrafo 1 artigo 1, que possui dois parágrafos', () => {
    beforeEach(function () {
      const paragrafo = state.articulacao.artigos[0].filhos[0];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do parágrafo 1 do artigo 1', () => {
      it('Deveria possuir 1 parágrafo', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      });
      it('Deveria possui um paragrafo único', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('Parágrafo único.');
      });
      it('Deveria possuir como paragrafo único o antigo parágrafo 2', () => {
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('Texto do parágrafo 2 do Artigo 1 que não possui incisos.');
      });
      describe('Testando os eventos resultantes da ação de exclusão do paragrafo', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento removido já que o parágrafo não possui filhos', () => {
          expect(state.ui.events[0].elementos.length).equal(1);
        });
        it('Deveria apresentar o parágrafo 1 no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
        });
        it('Deveria apresentar 1 elemento renumerado, o antigo parágrafo 2', () => {
          expect(state.ui.events[1].elementos[0].conteudo.texto).equal('Texto do parágrafo 2 do Artigo 1 que não possui incisos.');
        });
      });
    });
  });
  describe('Testando a exclusão do Parágrafo 2 artigo 1, que possui dois parágrafos', () => {
    beforeEach(function () {
      const paragrafo = state.articulacao.artigos[0].filhos[1];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do parágrafo 2 do artigo 1', () => {
      it('Deveria possuir 1 parágrafo', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      });
      it('Deveria possui um paragrafo único', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('Parágrafo único.');
      });
      it('Deveria possuir como paragrafo único o antigo parágrafo 1', () => {
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
      });
      describe('Testando os eventos resultantes da ação de exclusão do paragrafo', () => {
        it('Deveria apresentar 3 eventos: exclusão, renumeração e validação, nessa ordem', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento removido já que o parágrafo não possui filhos', () => {
          expect(state.ui.events[0].elementos.length).equal(1);
        });
        it('Deveria apresentar o parágrafo 2 no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do parágrafo 2 do Artigo 1 que não possui incisos.');
        });
        it('Deveria apresentar 1 elemento renumerado, o antigo parágrafo 1', () => {
          expect(state.ui.events[1].elementos[0].conteudo.texto).equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
        });
        it('Deveria apresentar 1 elemento renumerado, o antigo parágrafo 2', () => {
          expect(state.ui.events[1].elementos[0].rotulo).equal('Parágrafo único.');
        });
      });
    });
  });
});
