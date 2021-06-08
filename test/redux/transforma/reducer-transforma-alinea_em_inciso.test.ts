import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { transformaAlineaEmInciso } from '../../../src/redux/elemento-actions';
import { redo, transformaTipoElemento, undo } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando a transformação de alínea em inciso', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a mudança da segunda alínea em inciso', () => {
    beforeEach(function () {
      const alinea = state.articulacao.artigos[1].filhos[0].filhos[1];
      const action = transformaAlineaEmInciso.execute({ tipo: TipoDispositivo.alinea.tipo, uuid: alinea.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 3 incisos pertencentes ao artigo 2', () => {
      expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(3);
    });
    it('Deveria apresentar um inciso II com duas alíneas, pois a alinea possuía dois itens', () => {
      expect(state.articulacao.artigos[1].filhos[1].filhos.length).to.equal(2);
      expect(state.articulacao.artigos[1].filhos[1].rotulo).to.equal('II –');
      expect(state.articulacao.artigos[1].filhos[1].texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
      expect(state.articulacao.artigos[1].filhos[1].filhos[0].rotulo).to.equal('a)');
      expect(state.articulacao.artigos[1].filhos[1].filhos[1].rotulo).to.equal('b)');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar a alínea incluída como inciso e seus itens como alinea', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(3);
        expect(incluido.elementos![0].rotulo).to.equal('II –');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
        expect(incluido.elementos![1].rotulo).to.equal('a)');
        expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
        expect(incluido.elementos![2].rotulo).to.equal('b)');
        expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
      });
      it('Deveria apresentar a alínea original e seus itens no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(3);
        expect(removido.elementos![0].rotulo).equal('b)');
        expect(removido.elementos![1].rotulo).equal('1.');
        expect(removido.elementos![2].rotulo).equal('2.');
      });
      it('Deveria apresentar o antigo inciso II no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('III –');
        expect(renumerados.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 2.');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar 2 incisos pertencentes ao artigo 2', () => {
        expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(2);
      });
      it('Deveria apresentar o inciso II original, sem filhos', () => {
        expect(state.articulacao.artigos[1].filhos[1].filhos.length).to.equal(0);
        expect(state.articulacao.artigos[1].filhos[1].rotulo).to.equal('II –');
      });
      describe('Testando os eventos resultantes da ação', () => {
        it('Deveria apresentar 4 eventos: inclusão, remoção, renumeração e validação, nessa ordem', () => {
          expect(state.ui.events.length).to.equal(3);
        });
        it('Deveria apresentar a alínea anterior e seus itens', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(3);
          expect(incluido.elementos![0].rotulo).to.equal('b)');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
          expect(incluido.elementos![1].rotulo).to.equal('1.');
          expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
          expect(incluido.elementos![2].rotulo).to.equal('2.');
          expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
        });
        it('Deveria apresentar o inciso anteriomente criado a partir do alinea e seus itens no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(3);
          expect(removido.elementos![0].rotulo).equal('II –');
          expect(removido.elementos![1].rotulo).equal('a)');
          expect(removido.elementos![2].rotulo).equal('b)');
        });
        it('Deveria apresentar o antigo inciso II no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('II –');
          expect(renumerados.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 2.');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar 3 incisos pertencentes ao artigo 2', () => {
          expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(3);
        });
        it('Deveria apresentar um inciso II com um filho, pois a alinea possuía um item', () => {
          expect(state.articulacao.artigos[1].filhos[1].filhos.length).to.equal(2);
          expect(state.articulacao.artigos[1].filhos[1].rotulo).to.equal('II –');
          expect(state.articulacao.artigos[1].filhos[1].filhos[0].rotulo).to.equal('a)');
          expect(state.articulacao.artigos[1].filhos[1].filhos[1].rotulo).to.equal('b)');
        });
        describe('Testando os eventos resultantes da ação', () => {
          it('Deveria apresentar 4 eventos: inclusão, remoção, renumeração e validação, nessa ordem', () => {
            expect(state.ui.events.length).to.equal(3);
          });
          it('Deveria apresentar a alínea incluída como inciso e seus itens como alinea', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(3);
            expect(incluido.elementos![0].rotulo).to.equal('II –');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
            expect(incluido.elementos![1].rotulo).to.equal('a)');
            expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
            expect(incluido.elementos![2].rotulo).to.equal('b)');
            expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
          });
          it('Deveria apresentar a alínea original e seus itens no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(3);
            expect(removido.elementos![0].rotulo).equal('b)');
            expect(removido.elementos![1].rotulo).equal('1.');
            expect(removido.elementos![2].rotulo).equal('2.');
          });
          it('Deveria apresentar o antigo inciso II no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].rotulo).equal('III –');
            expect(renumerados.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 2.');
          });
        });
      });
    });
  });
});
