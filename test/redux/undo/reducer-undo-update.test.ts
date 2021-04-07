import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { UPDATE_ELEMENTO } from '../../../src/redux/elemento-actions';
import { atualizaElemento, undo } from '../../../src/redux/elemento-reducer';
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
  describe('Undo quando não há histórico', () => {
    it('Deveria possui os 5 artigos originais', () => {
      expect(state.articulacao.artigos.length).to.equal(5);
    });
    it('Deveria possuir um historico vazio', () => {
      expect(state.past?.length).to.equal(0);
    });
    it('Deveria apresentar o texto original do artigo', () => {
      expect(state.articulacao.artigos[0].texto).equal('Texto do caput do Artigo 1.');
    });
  });
  describe('Undo quando for feita apenas uma atualização de texto de dispositivo', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = atualizaElemento(state, {
        type: UPDATE_ELEMENTO,
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
    });
  });
});
