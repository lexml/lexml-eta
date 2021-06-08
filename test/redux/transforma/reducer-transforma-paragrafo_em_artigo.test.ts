import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { transformaParagrafoEmArtigo } from '../../../src/redux/elemento-actions';
import { redo, transformaTipoElemento, undo } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_PARAGRAFOS } from '../../doc/exemplo-paragrafos';

let state: any;

describe('Testando a transformação de parágrafo em artigo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_PARAGRAFOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  it('Deveria apresentar 3 artigos', () => {
    expect(state.articulacao.artigos.length).to.equal(3);
  });
  describe('Testando a mudança do parágrafo único, que possui filhos, em artigo, quando o artigo anterior não possui incisos de caput', () => {
    beforeEach(function () {
      const paragrafo = state.articulacao.artigos[1].filhos[2];
      const action = transformaParagrafoEmArtigo.execute({ tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 4 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
    it('Deveria apresentar o artigo original somente com dois incisos', () => {
      expect(state.articulacao.artigos[1].filhos.length).to.equal(2);
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar o artigo incluído com seus incisos, já transformados em incisos de caput', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(3);
        expect(incluido.elementos![0].rotulo).to.equal('Art. 3º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('Texto do parágrafo único do artigo 2:');
        expect(incluido.elementos![1].rotulo).to.equal('I –');
        expect(incluido.elementos![1].hierarquia?.pai?.tipo).to.equal('Artigo');
        expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do inciso I do parágrafo único do artigo 2;');
        expect(incluido.elementos![2].rotulo).to.equal('II –');
        expect(incluido.elementos![2].hierarquia?.pai?.tipo).to.equal('Artigo');
        expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do inciso II do parágrafo único do artigo 2.');
      });
      it('Deveria apresentar o paragrafo original e seus filhos no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(3);
        expect(removido.elementos![0].rotulo).equal('Parágrafo único.');
        expect(removido.elementos![1].rotulo).to.equal('I –');
        expect(removido.elementos![2].rotulo).to.equal('II –');
      });
      it('Deveria apresentar o artigo seguinte no array de elementos no evento de ElementoRenumerado', () => {
        const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerado.elementos!.length).equal(1);
        expect(renumerado.elementos![0].rotulo).equal('Art. 4º');
        expect(renumerado.elementos![0].conteudo?.texto).to.equal('Texto do caput do artigo 3 que possui DOIS parágrafos sendo que o primeiro tem DOIS incisos.');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar 3 artigos', () => {
        expect(state.articulacao.artigos.length).to.equal(3);
      });
      it('Deveria apresentar o artigo original restaurado com dois incisos e umn parágrafo', () => {
        expect(state.articulacao.artigos[1].filhos.length).to.equal(3);
      });
      describe('Testando os eventos resultantes da ação', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(3);
        });
        it('Deveria apresentar o artigo restaurado com seus incisos e parágrafo', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(3);
          expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('Texto do parágrafo único do artigo 2:');
          expect(incluido.elementos![1].rotulo).to.equal('I –');
          expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do inciso I do parágrafo único do artigo 2;');
          expect(incluido.elementos![2].rotulo).to.equal('II –');
          expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do inciso II do parágrafo único do artigo 2.');
        });
        it('Deveria apresentar o artigo seus filhos no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(3);
          expect(removido.elementos![0].rotulo).equal('Art. 3º');
          expect(removido.elementos![1].rotulo).to.equal('I –');
          expect(removido.elementos![2].rotulo).to.equal('II –');
        });
        it('Deveria apresentar o artigo seguinte no array de elementos no evento de ElementoRenumerado', () => {
          const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerado.elementos!.length).equal(1);
          expect(renumerado.elementos![0].rotulo).equal('Art. 3º');
          expect(renumerado.elementos![0].conteudo?.texto).to.equal('Texto do caput do artigo 3 que possui DOIS parágrafos sendo que o primeiro tem DOIS incisos.');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar 4 artigos', () => {
          expect(state.articulacao.artigos.length).to.equal(4);
        });
        it('Deveria apresentar o artigo original somente com dois incisos', () => {
          expect(state.articulacao.artigos[1].filhos.length).to.equal(2);
        });
        describe('Testando os eventos resultantes da ação', () => {
          it('Deveria apresentar 4 eventos', () => {
            expect(state.ui.events.length).to.equal(3);
          });
          it('Deveria apresentar o artigo incluído com seus incisos, já transformados em incisos de caput', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(3);
            expect(incluido.elementos![0].rotulo).to.equal('Art. 3º');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('Texto do parágrafo único do artigo 2:');
            expect(incluido.elementos![1].rotulo).to.equal('I –');
            expect(incluido.elementos![1].hierarquia?.pai?.tipo).to.equal('Artigo');
            expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do inciso I do parágrafo único do artigo 2;');
            expect(incluido.elementos![2].rotulo).to.equal('II –');
            expect(incluido.elementos![2].hierarquia?.pai?.tipo).to.equal('Artigo');
            expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do inciso II do parágrafo único do artigo 2.');
          });
          it('Deveria apresentar o paragrafo original e seus filhos no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(3);
            expect(removido.elementos![0].rotulo).equal('Parágrafo único.');
            expect(removido.elementos![1].rotulo).to.equal('I –');
            expect(removido.elementos![2].rotulo).to.equal('II –');
          });
          it('Deveria apresentar o artigo seguinte no array de elementos no evento de ElementoRenumerado', () => {
            const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerado.elementos!.length).equal(1);
            expect(renumerado.elementos![0].rotulo).equal('Art. 4º');
            expect(renumerado.elementos![0].conteudo?.texto).to.equal('Texto do caput do artigo 3 que possui DOIS parágrafos sendo que o primeiro tem DOIS incisos.');
          });
        });
      });
    });
  });
  describe('Testando a mudança do parágrafo 2, que não possui filhos, em artigo, quando o artigo anterior não possui incisos de caput', () => {
    beforeEach(function () {
      const paragrafo = state.articulacao.artigos[0].filhos[1];
      const action = transformaParagrafoEmArtigo.execute({ tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 4 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
    it('Deveria apresentar um parágrafo restante no artigo 1', () => {
      expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('Parágrafo único.');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar o artigo incluído e já renumerado', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('Texto do parágrafo 2 do Artigo 1 que não possui incisos.');
      });
      it('Deveria apresentar o paragrafo original no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('§ 2º');
        expect(removido.elementos![0].conteudo?.texto).equal('Texto do parágrafo 2 do Artigo 1 que não possui incisos.');
      });
      it('Deveria apresentar os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
        const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerado.elementos!.length).equal(3);
        expect(renumerado.elementos![0].rotulo).equal('Art. 3º');
        expect(renumerado.elementos![0].conteudo?.texto).to.equal('Texto do caput do Artigo 2 que possui DOIS incisos e um parágrafo único:');
        expect(renumerado.elementos![1].rotulo).equal('Art. 4º');
        expect(renumerado.elementos![1].conteudo?.texto).to.equal('Texto do caput do artigo 3 que possui DOIS parágrafos sendo que o primeiro tem DOIS incisos.');
        expect(renumerado.elementos![2].rotulo).equal('Parágrafo único.');
        expect(renumerado.elementos![2].conteudo?.texto).equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
      });
    });
  });
});
