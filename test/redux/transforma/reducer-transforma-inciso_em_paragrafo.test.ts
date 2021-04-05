import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { transformaIncisoEmParagrafo } from '../../../src/redux/elemento-actions';
import { modificaTipoElemento, redo, undo } from '../../../src/redux/elemento-reducer';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../demo/doc/exemplo-dispositivos-artigo';

let state: any;
let eventos: any;

describe('Testando a transformação de inciso em parágrafo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });

  describe('Testando a mudança de um único inciso em parágrafo único', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[0].filhos[0];
      const action = transformaIncisoEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = modificaTipoElemento(state, action);
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar um filho pertencente ao artigo 1', () => {
      expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
    });
    it('Deveria apresentar como filho o parágrafo e não mais o inciso', () => {
      expect(state.articulacao.artigos[0].caput.filhos.length).to.equal(0);
      expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('Parágrafo único.');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o parágrafo incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso do caput do Artigo 1.');
      });
      it('Deveria apresentar o inciso removido no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('I –');
      });
      it('Deveria apresentar o parágrafo único no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Parágrafo único.');
      });
    });

    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar um filho pertencente ao artigo 1', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      });
      it('Deveria voltar a apresentar como filho o inciso', () => {
        expect(state.articulacao.artigos[0].caput.filhos.length).to.equal(1);
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('I –');
      });
      describe('Testando os eventos resultantes da ação', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar o inciso no evento de ElementoIncluido', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('I –');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        it('Deveria apresentar o parágrafo removido no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Parágrafo único.');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar um filho pertencente ao artigo 1', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
        });
        it('Deveria apresentar como filho o parágrafo e não mais o inciso', () => {
          expect(state.articulacao.artigos[0].caput.filhos.length).to.equal(0);
          expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('Parágrafo único.');
        });
        describe('Testando os eventos resultantes da ação', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(eventos.length).to.equal(3);
          });
          it('Deveria apresentar o parágrafo incluído', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso do caput do Artigo 1.');
          });
          it('Deveria apresentar o inciso removido no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('I –');
          });
          it('Deveria apresentar o parágrafo único no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(1);
            expect(validados.elementos![0].rotulo).equal('Parágrafo único.');
          });
        });
      });
    });
  });
  describe('Testando a mudança do primeiro inciso em parágrafo 1', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[3].filhos[0];
      const action = transformaIncisoEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = modificaTipoElemento(state, action);
    });
    it('Deveria apresentar um inciso e 2 parágrafos pertencentes ao artigo 4', () => {
      expect(state.articulacao.artigos[3].filhos.length).to.equal(3);
      expect(state.articulacao.artigos[3].caput.filhos.length).to.equal(1);
    });
    it('Deveria não apresentar mais um parágrafo único e apresentar um inciso I', () => {
      expect(state.articulacao.artigos[3].filhos[0].rotulo).to.equal('I –');
      expect(state.articulacao.artigos[3].filhos[1].rotulo).to.equal('§ 1º');
      expect(state.articulacao.artigos[3].filhos[2].rotulo).to.equal('§ 2º');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o parágrafo incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('§ 1º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso I do caput do Artigo 4;');
      });
      it('Deveria apresentar o inciso removido no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('I –');
      });
      it('Deveria apresentar o parágrafo criado no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('§ 1º');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Parágrafo deveria terminar com ponto');
      });
    });
  });
  describe('Testando a mudança do último inciso em parágrafo 1', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[3].filhos[1];
      const action = transformaIncisoEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = modificaTipoElemento(state, action);
    });
    it('Deveria apresentar um inciso e 2 parágrafos pertencentes ao artigo 4', () => {
      expect(state.articulacao.artigos[3].filhos.length).to.equal(3);
      expect(state.articulacao.artigos[3].caput.filhos.length).to.equal(1);
    });
    it('Deveria não apresentar mais um parágrafo único e apresentar um inciso I', () => {
      expect(state.articulacao.artigos[3].filhos[0].rotulo).to.equal('I –');
      expect(state.articulacao.artigos[3].filhos[1].rotulo).to.equal('§ 1º');
      expect(state.articulacao.artigos[3].filhos[2].rotulo).to.equal('§ 2º');
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o parágrafo incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).to.equal('§ 1º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('texto do inciso II do caput do Artigo 4.');
      });
      it('Deveria apresentar o inciso removido no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('I –');
      });
      it('Deveria apresentar o parágrafo criado no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('§ 1º');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Parágrafo deveria iniciar com letra maiúscula');
      });
    });
  });
  describe('Testando a mudança do inciso com filhos em parágrafo', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[1].filhos[0];
      const action = transformaIncisoEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = modificaTipoElemento(state, action);
    });
    it('Deveria apresentar 1 inciso e um parágrafo pertencentes ao artigo 2', () => {
      expect(state.articulacao.artigos[1].filhos.length).to.equal(2);
      expect(state.articulacao.artigos[1].filhos[0].rotulo).to.equal('I –');
      expect(state.articulacao.artigos[1].filhos[1].rotulo).to.equal('Parágrafo único.');
    });
    it('Deveria apresentar o antigo inciso como primeiro', () => {
      expect(state.articulacao.artigos[1].filhos[0].rotulo).to.equal('I –');
      expect(state.articulacao.artigos[1].filhos[0].filhos.length).to.equal(0);
    });
    describe('Testando os eventos resultantes da ação', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o parágrafo incluído e seus filhos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(6);
        expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
        expect(incluido.elementos![1].rotulo).equal('I –');
        expect(incluido.elementos![2].rotulo).equal('a)');
        expect(incluido.elementos![3].rotulo).equal('II –');
        expect(incluido.elementos![4].rotulo).equal('a)');
        expect(incluido.elementos![5].rotulo).equal('b)');
      });

      it('Deveria apresentar o inciso, suas alineas e itens removidos no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(6);
      });
    });
  });
});
