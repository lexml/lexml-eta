import { expect } from '@open-wc/testing';
import { ATUALIZAR_ELEMENTO } from '../../../src/model/lexml/acoes/acoes';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { atualizaElemento } from '../../../src/redux/elemento/reducer/atualizaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;

describe('Testando undo de artigo atualizado', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
      past: [],
      present: [],
    };
  });
  describe('Undo quando for feita apenas uma atualização de texto de dispositivo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = atualizaElemento(state, {
        type: ATUALIZAR_ELEMENTO,
        atual: {
          tipo: TipoDispositivo.artigo.tipo,
          uuid: artigo.uuid,
          conteudo: {
            texto: 'Texto de Artigo modificado.',
          },
        },
      });
    });
    it('Deveria apresentar o novo conteúdo de texto', () => {
      expect(state.articulacao.artigos[0].texto).equal('Texto de Artigo modificado.');
    });
    it('Deveria possuir um historico com uma entrada', () => {
      expect(state.past?.length).to.equal(1);
    });
    describe('Testando os eventos resultantes do undo da atualização', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria possuir um historico vazio', () => {
        expect(state.past?.length).to.equal(0);
      });
      it('Deveria possuir um elemento no future', () => {
        expect(state.future?.length).to.equal(1);
      });
      it('Deveria possuir 5 artigos após o undo', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
      it('Deveria apresentar 1 evento de modificação', () => {
        expect(state.ui.events.length).to.equal(1);
        expect(state.ui.events[0].stateType).to.equal(StateType.ElementoModificado);
      });
      it('Deveria apresentar 1 elemento atualizado já que o artigo não possui filhos', () => {
        expect(state.ui.events[0].elementos.length).equal(1);
      });
      it('Deveria apresentar o artigo 1 no evento de ElementoModificado', () => {
        expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 1.');
      });
      describe('Testando os eventos resultantes do redo da atualização', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria possuir um past', () => {
          expect(state.past?.length).to.equal(1);
        });
        it('Deveria possuir future vazio', () => {
          expect(state.future?.length).to.equal(0);
        });
        it('Deveria possuir 5 artigos após o undo', () => {
          expect(state.articulacao.artigos.length).to.equal(5);
        });
        it('Deveria apresentar 1 evento de modificação', () => {
          expect(state.ui.events.length).to.equal(1);
          expect(state.ui.events[0].stateType).to.equal(StateType.ElementoModificado);
        });
        it('Deveria apresentar 1 elemento atualizado mas com ambas versões do texto', () => {
          expect(state.ui.events[0].elementos.length).equal(2);
          expect(state.ui.events[0].elementos[0].rotulo).equal('Art. 1º');
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('Texto do caput do Artigo 1.');
          expect(state.ui.events[0].elementos[1].rotulo).equal('Art. 1º');
          expect(state.ui.events[0].elementos[1].conteudo.texto).equal('Texto de Artigo modificado.');
        });
      });
    });
  });
});
