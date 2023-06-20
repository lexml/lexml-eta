import { expect } from '@open-wc/testing';
import { transformarIncisoCaputEmParagrafo } from '../../../src/model/lexml/acao/transformarElementoAction';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

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
      const action = transformarIncisoCaputEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = transformaTipoElemento(state, action);
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
      it('Deveria apresentar o artigo e seu parágrafo único no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        const art = validados.elementos!.find(e => e.rotulo === 'Art. 1º');
        const par = validados.elementos!.find(e => e.rotulo === 'Parágrafo único.');
        expect(art!.rotulo).equal('Art. 1º');
        expect(par!.rotulo).equal('Parágrafo único.');
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
        it('Deveria apresentar eventos', () => {
          expect(state.ui.events).to.exist;
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoIncluido).length).to.be.greaterThan(0);
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRemovido).length).to.be.greaterThan(0);
          expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoValidado).length).to.be.greaterThan(0);
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
            const art = validados.elementos!.find(e => e.rotulo === 'Art. 1º');
            const par = validados.elementos!.find(e => e.rotulo === 'Parágrafo único.');
            expect(art!.rotulo).equal('Art. 1º');
            expect(par!.rotulo).equal('Parágrafo único.');
          });
        });
      });
    });
  });
  describe('Testando a mudança do último inciso em parágrafo 1', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[3].filhos[1];
      const action = transformarIncisoCaputEmParagrafo.execute({ tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! });

      state = transformaTipoElemento(state, action);
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
        const par = validados.elementos!.find(e => e.rotulo === '§ 1º');
        expect(par!.rotulo).equal('§ 1º');
        expect(par!.mensagens![0].descricao).equal('Parágrafo deveria iniciar com letra maiúscula.');
      });
    });
  });
});
