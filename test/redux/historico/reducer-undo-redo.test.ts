import { expect } from '@open-wc/testing';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { MOVER_ELEMENTO_ACIMA } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { moveElementoAcima } from '../../../src/redux/elemento/reducer/moveElementoAcima';
import { moveElementoAbaixo } from '../../../src/redux/elemento/reducer/moveElementoAbaixo';
import { atualizaTextoElemento } from '../../../src/redux/elemento/reducer/atualizaTextoElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

let state: any;

const isUndefinedOrEmptyArray = (array: any) => !array || array.length === 0;

const testesComuns = () => {
  it('Deveria possuir histórico undo com uma entrada', () => {
    expect(state.past?.length).to.equal(1);
  });
  it('Deveria possuir histórico future vazio', () => {
    expect(state.future).to.satisfy(isUndefinedOrEmptyArray);
  });

  describe('Testando histórico após undo', () => {
    beforeEach(function () {
      state = undo(state);
    });
    it('Deveria possuir histórico undo vazio', () => {
      expect(state.past?.length).to.equal(0);
    });
    it('Deveria possuir histórico future com uma entrada', () => {
      expect(state.future?.length).to.equal(1);
    });

    describe('Testando histórico após redo', () => {
      beforeEach(function () {
        state = redo(state);
      });
      it('Deveria possuir histórico undo com uma entrada', () => {
        expect(state.past?.length).to.equal(1);
      });
      it('Deveria possuir histórico redo vazio', () => {
        expect(state.future?.length).to.equal(0);
      });
    });

    describe('Testando histórico após undo + redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
      });
      it('Deveria possuir histórico past com uma entrada', () => {
        expect(state.past?.length).to.equal(1);
      });
      it('Deveria possuir histórico future vazio', () => {
        expect(state.future?.length).to.equal(0);
      });
    });
  });
};

describe('Testando histórico de undo e redo', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR, false);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {};
  });
  describe('Undo/Redo quando não há histórico', () => {
    it('Deveria possui os 5 artigos originais', () => {
      expect(state.articulacao.artigos.length).to.equal(5);
    });
    it('Deveria possuir historico past vazio', () => {
      expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
    });
    it('Deveria possuir historico future vazio', () => {
      expect(state.future).to.satisfy(isUndefinedOrEmptyArray);
    });
    describe('Testando histórico após undo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria possuir histórico past vazio', () => {
        expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
      it('Deveria possuir histórico future vazio', () => {
        expect(state.future?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
    });
    describe('Testando histórico após redo', () => {
      beforeEach(function () {
        state = redo(state);
      });
      it('Deveria possuir histórico past vazio', () => {
        expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
      it('Deveria possuir histórico future vazio', () => {
        expect(state.future?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
    });
    describe('Testando histórico após undo + redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
      });
      it('Deveria possuir histórico past vazio', () => {
        expect(state.past?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
      it('Deveria possuir histórico future vazio', () => {
        expect(state.future?.length).to.satisfy(isUndefinedOrEmptyArray);
      });
    });
  });

  describe('Undo/Redo após ação REMOVER_ELEMENTO', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[2];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });

    testesComuns();
  });

  describe('Undo/Redo após ação ADICIONAR_ELEMENTO', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[4];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
    });

    testesComuns();
  });

  describe('Undo/Redo após ação MOVER_ELEMENTO_ACIMA', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[4];
      state = moveElementoAcima(state, {
        type: MOVER_ELEMENTO_ACIMA,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });

    testesComuns();
  });

  describe('Undo/Redo após ação MOVER_ELEMENTO_ABAIXO', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = moveElementoAbaixo(state, {
        type: MOVER_ELEMENTO_ABAIXO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });

    testesComuns();
  });

  describe('Undo/Redo após ação ATUALIZAR_TEXTO_ELEMENTO', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = atualizaTextoElemento(state, {
        type: ATUALIZAR_TEXTO_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: artigo.texto + 'a' } },
      });
    });

    testesComuns();
  });

  describe('Undo/Redo após várias ações', () => {
    beforeEach(function () {
      let artigo = state.articulacao.artigos[2];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });

      artigo = state.articulacao.artigos[2];
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });

      artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });

      artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });

      artigo = state.articulacao.artigos[2];
      state = moveElementoAcima(state, {
        type: MOVER_ELEMENTO_ACIMA,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      });
    });

    it('Deveria possuir histórico past com 5 entradas', () => {
      expect(state.past?.length).to.equal(5);
    });
    it('Deveria possuir histórico future vazio', () => {
      expect(state.future).to.satisfy(isUndefinedOrEmptyArray);
    });
    describe('Testando histórico undo/redo após undo 2 vezes', () => {
      beforeEach(() => {
        state = undo(state);
        state = undo(state);
      });
      it('Deveria possuir histórico past com 3 entradas', () => {
        expect(state.past?.length).to.equal(3);
      });
      it('Deveria possuir histórico future com 2 entradas', () => {
        expect(state.future?.length).to.equal(2);
      });
      describe('Testando histórico undo/redo após redo 1 vez', () => {
        beforeEach(() => {
          state = redo(state);
        });
        it('Deveria possuir histórico past com 4 entradas', () => {
          expect(state.past?.length).to.equal(4);
        });
        it('Deveria possuir histórico future com 1 entrada', () => {
          expect(state.future?.length).to.equal(1);
        });
      });
    });
  });
});
