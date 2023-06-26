import { expect } from '@open-wc/testing';
import { transformaAlineaEmItem } from '../../../src/model/lexml/acao/transformarElementoAction';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando a transformação de alínea em item', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a mudança da segunda alínea em item da primeira', () => {
    beforeEach(function () {
      const alinea = state.articulacao.artigos[1].filhos[0].filhos[1];
      const action = transformaAlineaEmItem.execute({ tipo: TipoDispositivo.alinea.tipo, uuid: alinea.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar a única alinea restante no primeiro inciso do artigo 2', () => {
      expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(1);
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar a antiga alínea como item e seus filhos como dispositivos genéricos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(3);
        expect(incluido.elementos![0].rotulo).to.equal('2.');
        expect(incluido.elementos![0].conteudo?.texto).equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
        expect(incluido.elementos![1].rotulo).to.equal('1 -');
        expect(incluido.elementos![1].tipo).to.equal('DispositivoGenerico');
        expect(incluido.elementos![1].conteudo?.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
        expect(incluido.elementos![2].rotulo).to.equal('2 -');
        expect(incluido.elementos![2].tipo).to.equal('DispositivoGenerico');
        expect(incluido.elementos![1].conteudo?.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
        expect(incluido.elementos![2].conteudo?.texto).equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
      });
      it('Deveria apresentar a antiga alínea e seus filhos no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(3);
        expect(removido.elementos![0].rotulo).equal('b)');
        expect(removido.elementos![1].rotulo).equal('1.');
        expect(removido.elementos![2].rotulo).equal('2.');
      });
      it('Deveria apresentar o item recém criado e seus filhos no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(5);
        expect(validados.elementos![0].rotulo).equal('2 -');
        expect(validados.elementos![1].rotulo).equal('1 -');
        expect(validados.elementos![2].rotulo).equal('2.');
        expect(validados.elementos![3].rotulo).equal('1.');
        expect(validados.elementos![4].rotulo).equal('a)');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria restaurar as alineas do primeiro inciso do artigo 2', () => {
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(2);
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos[0].rotulo).to.equal('a)');
        expect(state.articulacao.artigos[1].caput.filhos[0].filhos[1].rotulo).to.equal('b)');
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar eventos', () => {
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoIncluido).length).to.be.greaterThan(0);
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRemovido).length).to.be.greaterThan(0);
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoValidado).length).to.be.greaterThan(0);
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.SituacaoElementoModificada).length).to.be.greaterThan(0);
        });
        it('Deveria apresentar a antiga alínea e seus filhos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(3);
          expect(incluido.elementos![0].rotulo).to.equal('b)');
          expect(incluido.elementos![0].conteudo?.texto).equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
          expect(incluido.elementos![1].rotulo).to.equal('1.');
          expect(incluido.elementos![1].tipo).to.equal('Item');
          expect(incluido.elementos![1].conteudo?.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
          expect(incluido.elementos![2].rotulo).to.equal('2.');
          expect(incluido.elementos![2].tipo).to.equal('Item');
          expect(incluido.elementos![2].conteudo?.texto).equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
        });
        it('Deveria apresentar o item, criado a partir da alinea, e seus filhos no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(3);
          expect(removido.elementos![0].rotulo).equal('2.');
          expect(removido.elementos![1].rotulo).equal('1 -');
          expect(removido.elementos![2].rotulo).equal('2 -');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar a única alinea restante no primeiro inciso do artigo 2', () => {
          expect(state.articulacao.artigos[1].caput.filhos[0].filhos.length).to.equal(1);
        });
        describe('Testando os eventos resultantes da ação', () => {
          it('Deveria apresentar eventos', () => {
            expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoIncluido).length).to.be.greaterThan(0);
            expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRemovido).length).to.be.greaterThan(0);
            expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoValidado).length).to.be.greaterThan(0);
          });
          it('Deveria apresentar a antiga alínea como item e seus filhos como dispositivos genéricos', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(3);
            expect(incluido.elementos![0].rotulo).to.equal('2.');
            expect(incluido.elementos![0].conteudo?.texto).equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
            expect(incluido.elementos![1].rotulo).to.equal('1 -');
            expect(incluido.elementos![1].tipo).to.equal('DispositivoGenerico');
            expect(incluido.elementos![1].conteudo?.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
            expect(incluido.elementos![2].rotulo).to.equal('2 -');
            expect(incluido.elementos![2].tipo).to.equal('DispositivoGenerico');
            expect(incluido.elementos![1].conteudo?.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
            expect(incluido.elementos![2].conteudo?.texto).equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
          });
          it('Deveria apresentar a antiga alínea e seus filhos no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(3);
            expect(removido.elementos![0].rotulo).equal('b)');
            expect(removido.elementos![1].rotulo).equal('1.');
            expect(removido.elementos![2].rotulo).equal('2.');
          });
          it('Deveria apresentar o item recém criado e seus filhos no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(5);
            expect(validados.elementos![0].rotulo).equal('2 -');
            expect(validados.elementos![1].rotulo).equal('1 -');
            expect(validados.elementos![2].rotulo).equal('2.');
            expect(validados.elementos![3].rotulo).equal('1.');
            expect(validados.elementos![4].rotulo).equal('a)');
          });
        });
      });
    });
  });
});
