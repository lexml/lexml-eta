import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { transformarItemEmAlinea } from '../../../src/redux/elemento/action/elementoAction';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { getEvento } from '../../../src/redux/evento';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando a transformação de item em alínea', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  it('Deveria apresentar 2 alíneas pertencentes ao artigo 2', () => {
    expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(2);
  });
  describe('Testando a mudança do único item em alínea', () => {
    beforeEach(function () {
      const item = state.articulacao.artigos[1].caput.filhos[0].filhos[0].filhos[0];
      const action = transformarItemEmAlinea.execute({ tipo: TipoDispositivo.item.tipo, uuid: item.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 3 alíneas', () => {
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(3);
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[0].rotulo).to.equal('a)');
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[1].rotulo).to.equal('b)');
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[2].rotulo).to.equal('c)');
    });
    describe('Testando os eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(state.ui.events.length).to.equal(4);
      });
      it('Deveria apresentar o item transformado', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('b)');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
      });
      it('Deveria apresentar o item original no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('1.');
      });
      it('Deveria apresentar a última alinea no array de elementos no evento de ElementoRenumerado', () => {
        const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerado.elementos!.length).equal(1);
        expect(renumerado.elementos![0].rotulo).equal('c)');
        expect(renumerado.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
      });
      it('Deveria apresentar o item recém criado e seu filho no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).to.equal('b)');
        expect(validados.elementos![0].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar as 2 alíneas originalmente pertencentes ao inciso', () => {
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(2);
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos[0].rotulo).to.equal('a)');
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos[1].rotulo).to.equal('b)');
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(3);
        });
        it('Deveria apresentar o item original no evento de ElementoIncluido', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('1.');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
        });
        it('Deveria apresentar a alínea no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('b)');
        });
        it('Deveria apresentar a última alinea no array de elementos no evento de ElementoRenumerado', () => {
          const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerado.elementos!.length).equal(1);
          expect(renumerado.elementos![0].rotulo).equal('b)');
          expect(renumerado.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria voltar a apresentar 3 alíneas', () => {
          expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(3);
          expect(state.articulacao.artigos[1].caput.filhos[0].filhos[0].rotulo).to.equal('a)');
          expect(state.articulacao.artigos[1].caput.filhos[0].filhos[1].rotulo).to.equal('b)');
          expect(state.articulacao.artigos[1].caput.filhos[0].filhos[2].rotulo).to.equal('c)');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 4 eventos', () => {
            expect(state.ui.events.length).to.equal(4);
          });
          it('Deveria apresentar o item transformado em alínea', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('b)');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
          });
          it('Deveria apresentar o item original no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('1.');
          });
          it('Deveria apresentar a última alinea no array de elementos no evento de ElementoRenumerado', () => {
            const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerado.elementos!.length).equal(1);
            expect(renumerado.elementos![0].rotulo).equal('c)');
            expect(renumerado.elementos![0].conteudo?.texto).to.equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
          });
          it('Deveria apresentar a alínea no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(1);
            expect(validados.elementos![0].rotulo).to.equal('b)');
            expect(validados.elementos![0].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
            expect(validados.elementos![0].mensagens?.length).equal(1);
            expect(validados.elementos![0].mensagens![0].descricao).equal('Alínea deveria terminar com uma das seguintes possibilidades: ;     ; e     ; ou');
          });
        });
      });
    });
  });
  describe('Testando a mudança do segundo item em alínea', () => {
    beforeEach(function () {
      const item = state.articulacao.artigos[1].caput.filhos[0].filhos[1].filhos[1];
      const action = transformarItemEmAlinea.execute({ tipo: TipoDispositivo.item.tipo, uuid: item.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 3 alíneas pertencentes ao artigo 2', () => {
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(3);
    });
    it('Deveria apresentar as 2 alíneas asnteriores e o antigo item', () => {
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[0].rotulo).to.equal('a)');
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[1].rotulo).to.equal('b)');
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos[2].rotulo).to.equal('c)');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(state.ui.events.length).to.equal(2);
      });
      it('Deveria apresentar o item transformado', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('c)');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
      });
      it('Deveria apresentar o item original no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('2.');
      });
    });
  });
});
