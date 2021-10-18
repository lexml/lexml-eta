import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacao-parser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipo-dispositivo';
import { REMOVER_ELEMENTO } from '../../../src/redux/elemento-actions';
import { removeElemento, undo } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;

describe('Testando undo de remover artigo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
      past: [],
      present: [],
    };
  });
  describe('Undo quando não há histórico', () => {
    it('Deveria possui os 5 artigos originais', () => {
      expect(state.articulacao.artigos.length).to.equal(5);
    });
    it('Deveria possuir um historico vazio', () => {
      expect(state.past?.length).to.equal(0);
    });
    it('Ao executar undo é retornado o state atual com o histórico vazio', () => {
      state = undo(state);
      expect(state.past.length).equals(0);
    });
  });
  describe('Undo quando for feita a exclusão de um dispositivo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });
    it('Deveria possui 4 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
    it('Deveria possuir um historico com uma entrada', () => {
      expect(state.past?.length).to.equal(1);
    });
    describe('Testando os eventos resultantes do undo da exclusão', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria possuir um historico vazio', () => {
        expect(state.past?.length).to.equal(0);
      });
      it('Deveria possuir 5 artigos após o undo', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
      it('Deveria apresentar 2 eventos: inclusão e renumeração, nessa ordem', () => {
        expect(state.ui.events.length).to.equal(2);
      });
      it('Deveria apresentar 1 elemento incluído já que o artigo não possui filhos', () => {
        expect(state.ui.events[0].elementos.length).equal(1);
      });
      it('Deveria apresentar o artigo 1 no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 1.');
      });
      it('Deveria apresentar os 4 artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(state.ui.events[1].elementos.length).equal(4);
      });
    });
  });
  describe('Undo quando for feita a exclusão de um dispositivo que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });
    it('Deveria possui 4 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
    it('Deveria possuir um historico com uma entrada', () => {
      expect(state.past?.length).to.equal(1);
    });
    it('Deveria apresentar 2 eventos', () => {
      expect(state.ui.events.length).to.equal(2);
    });
    it('Deveria apresentar 1 elemento incluído já que o artigo não possui filhos', () => {
      expect(state.ui.events[0].elementos.length).equal(11);
    });
    it('Deveria apresentar o artigo 1 no evento de ElementoRemoved', () => {
      expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 4:');
    });
    it('Deveria apresentar o artigo subsequente no evento de ElementoRenumerado', () => {
      expect(state.ui.events[1].elementos.length).equal(1);
    });
    describe('Testando os eventos resultantes do undo da exclusão', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria possuir um historico vazio', () => {
        expect(state.past?.length).to.equal(0);
      });
      it('Deveria possuir 5 artigos após o undo', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
      it('Deveria apresentar 2 eventos: inclusão e validação, nessa ordem', () => {
        expect(state.ui.events.length).to.equal(2);
        expect(state.ui.events[0].stateType).to.equal(StateType.ElementoIncluido);
        expect(state.ui.events[1].stateType).to.equal(StateType.ElementoRenumerado);
      });
      it('Deveria apresentar 11 elementos incluídos', () => {
        expect(state.ui.events[0].elementos.length).equal(11);
      });
      it('Deveria apresentar o artigo 1 no evento de ElementoIncluido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(removidos.elementos![0].conteudo!.texto).equal('Texto do caput do Artigo 4:');
      });
      it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(state.ui.events[1].elementos.length).equal(1);
        expect(state.ui.events[1].elementos[0].rotulo).equal('Art. 5º');
      });
    });
  });
});
