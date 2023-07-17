import { expect } from '@open-wc/testing';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { TEXTO_OMISSIS } from '../../../src/model/lexml/conteudo/textoOmissis';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';
import { StateEvent, StateType } from '../../../src/redux/state';

let state: any;

const isUndefinedOrEmptyArray = (array: any) => !array || array.length === 0;

describe('Testando undo de remover artigo com bloco de alteração', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR, false);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {};
  });
  describe('Undo quando não há histórico', () => {
    it('Deveria possui os 5 artigos originais', () => {
      expect(state.articulacao.artigos.length).to.equal(5);
    });
    it('Deveria possuir um historico vazio', () => {
      expect(state.past).to.satisfy(isUndefinedOrEmptyArray);
    });
    describe('Testando histórico após undo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria possuir histórico past vazio', () => {
        expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
    });
  });
  describe('Undo quando for feita a exclusão do artigo terceiro', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[2];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });
    it('Deveria possuir 4 artigos', () => {
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
        expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
      it('Deveria possuir 5 artigos após o undo', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
      it('Deveria apresentar eventos: inclusão, renumeração e situação modificada, nessa ordem', () => {
        expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoIncluido).length).to.be.greaterThan(0);
        expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoRenumerado).length).to.be.greaterThan(0);
        expect(state.ui.events.filter((ev: StateEvent) => ev.stateType === StateType.SituacaoElementoModificada).length).to.be.greaterThan(0);
      });
      it('Deveria apresentar 14 elementos incluídos já que o artigo possui 13 filhos', () => {
        expect(state.ui.events[0].elementos.length).equal(14);
      });
      it('Deveria apresentar o artigo 3 no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[0].conteudo.texto).equal(
          'A <a href="urn:lex:br:federal:lei:1993-12-09;8745"> Lei nº 8.745, de 9 de dezembro de 1993 </a>, passa a vigorar com as seguintes alterações:'
        );
      });
      it('Deveria apresentar o lexml id do artigo 2 do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[1].lexmlId).equal('art3_cpt_alt1_art2');
      });
      it('Deveria apresentar o texto omisses após o artigo 2 do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[2].conteudo.texto).equal(TEXTO_OMISSIS);
      });
      it('Deveria apresentar o texto omisses após o inciso VI do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[4].conteudo.texto).equal(TEXTO_OMISSIS);
      });
      it('Deveria apresentar o lexml id do artigo 4 do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[7].lexmlId).equal('art3_cpt_alt1_art4');
      });
      it('Deveria apresentar o texto omisses após o artigo 4 do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[8].conteudo.texto).equal(TEXTO_OMISSIS);
      });
      it('Deveria apresentar o texto omisses após o parágrafo único do bloco de alteração no evento de ElementoRemoved', () => {
        expect(state.ui.events[0].elementos[11].conteudo.texto).equal(TEXTO_OMISSIS);
      });
      it('Deveria apresentar os 2 artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(state.ui.events[1].elementos.length).equal(2);
      });
    });
  });
});
