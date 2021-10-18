import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { SHIFT_TAB, TAB } from '../../../src/redux/elemento/action/elementoAction';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { modificaTipoElementoWithTab } from '../../../src/redux/elemento/reducer/modificaTipoElementoWithTab';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando o impacto do uso de tab no elemento selecionado', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Quando se tratar do primeiro artigo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = modificaTipoElementoWithTab(state, { type: TAB, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
    });
    it('não deveria fazer nada', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
  });
  describe('Quando se tratar do segundo artigo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[1];
      state = modificaTipoElementoWithTab(state, { type: TAB, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
    });
    it('Deveria apresentar um artigo a menos', () => {
      expect(state.articulacao.artigos.length).to.equal(3);
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(state.ui.events.length).to.equal(3);
      });
      it('Deveria apresentar 8 elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(8);
        expect(incluido.elementos![0].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o antigo artigo e seus filhos no evento de ElementoRemovido', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(8);
      });
      it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
        const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerado.elementos!.length).equal(2);
      });
    });
    describe('Tornar o parágrafo em artigo novamente', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[0].filhos[1];
        state = modificaTipoElementoWithTab(state, { type: SHIFT_TAB, atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid! } });
      });
      it('deveria apresentar o parágrafo como artigo novamente', () => {
        expect(state.articulacao.artigos.length).to.equal(4);
      });
      describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(3);
        });
        it('Deveria apresentar 8 elementos incluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(8);
          expect(incluido.elementos![0].rotulo).equal('Art. 2º');
        });
        it('Deveria apresentar o antigo artigo e seus filhos no evento de ElementoRemovido', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(8);
        });
        it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
          const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerado.elementos!.length).equal(2);
        });
      });
    });
  });
});
