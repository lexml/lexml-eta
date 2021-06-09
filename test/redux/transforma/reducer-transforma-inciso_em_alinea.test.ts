import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { transformarIncisoEmAlinea } from '../../../src/redux/elemento-actions';
import { redo, transformaTipoElemento, undo } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando a transformação de inciso em alínea', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a mudança do segundo inciso, que não tem filhos, em alínea do primeiro', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[1].filhos[1];
      const action = transformarIncisoEmAlinea.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 1 inciso pertencente ao artigo 2', () => {
      expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(1);
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(state.ui.events.length).to.equal(2);
      });
      it('Deveria apresentar o antigo inciso II como alínea do primeiro inciso', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('c)');
        expect(incluido.elementos![0].conteudo?.texto).equal('texto do inciso II do caput do Artigo 2.');
      });
      it('Deveria apresentar inciso no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('II –');
        expect(removido.elementos![0].conteudo?.texto).equal('texto do inciso II do caput do Artigo 2.');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar novamente 2 incisos pertencente ao artigo 2', () => {
        expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(2);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar o antigo inciso II no evento de ElementoIncluido', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('II –');
        });
        it('Deveria apresentar a alínea no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('c)');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar 1 inciso pertencente ao artigo 2', () => {
          expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(1);
        });
        describe('Testando os eventos resultantes da ação', () => {
          it('Deveria apresentar 2 eventos', () => {
            expect(state.ui.events.length).to.equal(2);
          });
          it('Deveria apresentar o antigo inciso II como alínea do primeiro inciso', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('c)');
            expect(incluido.elementos![0].conteudo?.texto).equal('texto do inciso II do caput do Artigo 2.');
          });
          it('Deveria apresentar o antigo inciso no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('II –');
          });
        });
      });
    });
  });
  describe('Testando a mudança do segundo inciso, que possui alíneas com itens, em alínea do primeiro', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[2].filhos[1];
      const action = transformarIncisoEmAlinea.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = transformaTipoElemento(state, action);
    });
    it('Deveria apresentar 1 inciso pertencente ao artigo 2', () => {
      expect(state.articulacao.artigos[2].caput.filhos.length).to.equal(1);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar o antigo inciso II e seus filhos transformados no evento de ElementoIncluido', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(6);
        expect(incluido.elementos![0].rotulo).to.equal('a)');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 3:');
        expect(incluido.elementos![1].rotulo).to.equal('1.');
        expect(incluido.elementos![1].conteudo?.texto).to.equal('texto da alinea 1 do inciso 2 do caput do artigo 3:');
        expect(incluido.elementos![2].rotulo).to.equal('1 -');
        expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
        expect(incluido.elementos![3].rotulo).to.equal('2.');
        expect(incluido.elementos![3].conteudo?.texto).to.equal('texto da alinea 2 do inciso 2 do caput do artigo 3:');
        expect(incluido.elementos![4].rotulo).to.equal('1 -');
        expect(incluido.elementos![4].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 2 do caput do artigo 3;');
        expect(incluido.elementos![5].rotulo).to.equal('2 -');
        expect(incluido.elementos![5].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 2 do caput do artigo 3.');
      });
      it('Deveria apresentar os 6 elementos originais no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(6);
        expect(removido.elementos![0].rotulo).to.equal('II –');
        expect(removido.elementos![1].rotulo).to.equal('a)');
        expect(removido.elementos![2].rotulo).to.equal('1.');
        expect(removido.elementos![3].rotulo).to.equal('b)');
        expect(removido.elementos![4].rotulo).to.equal('1.');
        expect(removido.elementos![5].rotulo).to.equal('2.');
      });
      it('Deveria apresentar o inciso para onde foram copiados os elementos e a alínea recém criada e seus filhos no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(5);
        expect(validados.elementos![0].rotulo).equal('1.');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Segundo a Legislação vigente, Item não poderia possuir filhos');
        expect(validados.elementos![1].rotulo).equal('1 -');
        expect(validados.elementos![1].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
        expect(validados.elementos![2].rotulo).equal('2.');
        expect(validados.elementos![2].mensagens![0].descricao).equal('Segundo a Legislação vigente, Item não poderia possuir filhos');
        expect(validados.elementos![3].rotulo).equal('1 -');
        expect(validados.elementos![3].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
        expect(validados.elementos![4].rotulo).equal('2 -');
        expect(validados.elementos![4].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar 2 incisos pertencentes ao artigo 2', () => {
        expect(state.articulacao.artigos[2].caput.filhos.length).to.equal(2);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar o antigo inciso II e seus filhos transformados no evento de ElementoIncluido', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(6);
          expect(incluido.elementos![0].rotulo).to.equal('II –');
          expect(incluido.elementos![1].rotulo).to.equal('a)');
          expect(incluido.elementos![2].rotulo).to.equal('1.');
          expect(incluido.elementos![3].rotulo).to.equal('b)');
          expect(incluido.elementos![4].rotulo).to.equal('1.');
          expect(incluido.elementos![5].rotulo).to.equal('2.');
        });
        it('Deveria apresentar os 6 elementos originais no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(6);
          expect(removido.elementos![0].rotulo).to.equal('a)');
          expect(removido.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 3:');
          expect(removido.elementos![1].rotulo).to.equal('1.');
          expect(removido.elementos![1].conteudo?.texto).to.equal('texto da alinea 1 do inciso 2 do caput do artigo 3:');
          expect(removido.elementos![2].rotulo).to.equal('1 -');
          expect(removido.elementos![2].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
          expect(removido.elementos![3].rotulo).to.equal('2.');
          expect(removido.elementos![3].conteudo?.texto).to.equal('texto da alinea 2 do inciso 2 do caput do artigo 3:');
          expect(removido.elementos![4].rotulo).to.equal('1 -');
          expect(removido.elementos![4].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 2 do caput do artigo 3;');
          expect(removido.elementos![5].rotulo).to.equal('2 -');
          expect(removido.elementos![5].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 2 do caput do artigo 3.');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar 1 inciso pertencente ao artigo 2', () => {
          expect(state.articulacao.artigos[2].caput.filhos.length).to.equal(1);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(state.ui.events.length).to.equal(3);
          });
          it('Deveria apresentar o antigo inciso II e seus filhos transformados no evento de ElementoIncluido', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(6);
            expect(incluido.elementos![0].rotulo).to.equal('a)');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 3:');
            expect(incluido.elementos![1].rotulo).to.equal('1.');
            expect(incluido.elementos![1].conteudo?.texto).to.equal('texto da alinea 1 do inciso 2 do caput do artigo 3:');
            expect(incluido.elementos![2].rotulo).to.equal('1 -');
            expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
            expect(incluido.elementos![3].rotulo).to.equal('2.');
            expect(incluido.elementos![3].conteudo?.texto).to.equal('texto da alinea 2 do inciso 2 do caput do artigo 3:');
            expect(incluido.elementos![4].rotulo).to.equal('1 -');
            expect(incluido.elementos![4].conteudo?.texto).to.equal('texto do item 1 da alinea 2 do inciso 2 do caput do artigo 3;');
            expect(incluido.elementos![5].rotulo).to.equal('2 -');
            expect(incluido.elementos![5].conteudo?.texto).to.equal('texto do item 2 da alinea 2 do inciso 2 do caput do artigo 3.');
          });
          it('Deveria apresentar os 6 elementos originais no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(6);
            expect(removido.elementos![0].rotulo).to.equal('II –');
            expect(removido.elementos![1].rotulo).to.equal('a)');
            expect(removido.elementos![2].rotulo).to.equal('1.');
            expect(removido.elementos![3].rotulo).to.equal('b)');
            expect(removido.elementos![4].rotulo).to.equal('1.');
            expect(removido.elementos![5].rotulo).to.equal('2.');
          });
          it('Deveria apresentar a alínea recém criada e seus filhos no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(5);
            expect(validados.elementos![0].rotulo).equal('1.');
            expect(validados.elementos![0].mensagens![0].descricao).equal('Segundo a Legislação vigente, Item não poderia possuir filhos');
            expect(validados.elementos![1].rotulo).equal('1 -');
            expect(validados.elementos![1].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
            expect(validados.elementos![2].rotulo).equal('2.');
            expect(validados.elementos![2].mensagens![0].descricao).equal('Segundo a Legislação vigente, Item não poderia possuir filhos');
            expect(validados.elementos![3].rotulo).equal('1 -');
            expect(validados.elementos![3].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
            expect(validados.elementos![4].rotulo).equal('2 -');
            expect(validados.elementos![4].mensagens![0].descricao).equal('Não foi possível validar a natureza deste dispositivo com base na legislação vigente');
          });
        });
      });
    });
  });
});
