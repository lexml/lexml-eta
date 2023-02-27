import { getEvento } from './../../../src/redux/elemento/evento/eventosUtil';
import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { State, StateEvent, StateType } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

let state: State;
let eventos: StateEvent[];

describe('Testando a exclusão de artigos', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  describe('Inicialização do teste utilizando uma norma com 5 artigos, sem agrupadores', () => {
    it('Deveria possui 5 artigos', () => {
      expect(state.articulacao!.artigos.length).to.equal(5);
    });
  });

  describe('Testando a inclusão de artigo antes do Art. 1º', () => {
    beforeEach(function () {
      const artigo = state.articulacao!.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
        posicao: 'antes',
      });
    });

    it('Deveria possuir 6 artigos na articulação', () => {
      expect(state.articulacao!.artigos.length).to.equal(6);
    });

    it('Deveria possuir Art. 0 como rótulo do primeiro artigo da articulação', () => {
      expect(state.articulacao!.artigos[0].rotulo).to.equal('Art. 0.');
    });

    describe('Testando a exclusão do Art. 0', () => {
      beforeEach(function () {
        const artigo = state.articulacao!.artigos[0];
        state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
      });

      it('Deveria possuir 5 artigos na articulação', () => {
        expect(state.articulacao!.artigos.length).to.equal(5);
      });

      it('Deveria possuir Art. 1º como rótulo do primeiro artigo da articulação', () => {
        expect(state.articulacao!.artigos[0].rotulo).to.equal('Art. 1º');
      });

      describe('Testando undo da exclusão do Art. 0', () => {
        beforeEach(function () {
          state = undo(state);
          eventos = getEventosQuePossuemElementos(state.ui!.events);
        });

        it('Deveria possuir 6 artigos na articulação', () => {
          expect(state.articulacao!.artigos.length).to.equal(6);
        });

        it('Deveria possuir Art. 0 como rótulo do primeiro artigo da articulação', () => {
          expect(state.articulacao!.artigos[0].rotulo).to.equal('Art. 0.');
        });

        it('A referência para inclusão do Art. 0 deveria ser a ementa', () => {
          const incluido = getEvento(eventos, StateType.ElementoIncluido);
          expect(incluido.referencia!.tipo).to.equal('Ementa');
        });
      });
    });
  });
});
