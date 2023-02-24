import { createElemento } from './../../../src/model/elemento/elementoUtil';
import { expect } from '@open-wc/testing';
import { AGRUPAR_ELEMENTO } from '../../../src/model/lexml/acao/agruparElementoAction';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupadores de agrupadores', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a inclusão quando não há agrupadores e se trata do segundo artigo', () => {
    beforeEach(function () {
      const artigo = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: artigo, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const capitulo = createElemento(state.articulacao.filhos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: capitulo, novo: { tipo: TipoDispositivo.titulo.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar o capítulo sob o novo título', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(1);
      expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO ÚNICO');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o titulo como incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
      });
      it('1 Deveria apresentar o TÍTULO incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
    });
    describe('Testando undo e redo da inclusão do título de capítulo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar apenas o artigo 1 e o capítulo como filhos da articulação', () => {
        expect(state.articulacao.filhos.length).equals(2);
      });
      it('Deveria apresentar o capítulo sem título', () => {
        expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO ÚNICO');
        expect(state.articulacao.filhos[1].pai).equals(state.articulacao);
      });
      it('Deveria apresentar os artigos de 2 a 5 sob o capítulo agora sem título', () => {
        expect(state.articulacao.filhos[1].filhos.length).equals(4);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(eventos.length).to.equal(5);
        });
        it('Deveria apresentar o título como removido', () => {
          const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removidos.elementos!.length).equal(1);
          expect(removidos.elementos![0].rotulo).equal('TÍTULO ÚNICO');
        });
      });
      describe('Testando redo da inclusão do título de capítulo', () => {
        beforeEach(function () {
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
          expect(state.articulacao.filhos.length).equals(2);
        });
        it('Deveria apresentar o o capítulo sob o novo título', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(1);
          expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO ÚNICO');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 5 eventos', () => {
            expect(eventos.length).to.equal(5);
          });
          it('Deveria apresentar o titulo como incluído', () => {
            expect(eventos[0].elementos!.length).equal(1);
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
          });
          it('2 Deveria apresentar o TÍTULO incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
        });
      });
    });
    describe('Testando undo e redo da inclusão do título e do capítulo, nessa ordem', () => {
      beforeEach(function () {
        state = undo(state);
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar os artigos 1 a 5 como filhos da articulação', () => {
        expect(state.articulacao.filhos.length).equals(5);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(eventos.length).to.equal(5);
        });
        it('Deveria apresentar o capítulo como removido', () => {
          const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removidos.elementos!.length).equal(1);
          expect(removidos.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
        });
      });
      describe('Testando redo da inclusão do capítulo', () => {
        beforeEach(function () {
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar apenas o artigo 1 e o capítulo como filhos da articulação', () => {
          expect(state.articulacao.filhos.length).equals(2);
          expect(state.articulacao.filhos[0].rotulo).equals('Art. 1º');
          expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO ÚNICO');
        });
        it('Deveria apresentar os artigos 2 a 5 sob o capítulo', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(4);
          expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
          expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Art. 3º');
          expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Art. 4º');
          expect(state.articulacao.filhos[1].filhos[3].rotulo).equal('Art. 5º');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar o capitulo como incluído', () => {
            expect(eventos[0].elementos!.length).equal(1);
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
          });
          it('Deveria apresentar o capítulo incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
        });
      });
      describe('Testando redo da inclusão do titulo e do capítulo', () => {
        beforeEach(function () {
          state = redo(state);
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
          expect(state.articulacao.filhos.length).equals(2);
        });
        it('Deveria apresentar o artigo e o título como filhos da articulação', () => {
          expect(state.articulacao.filhos[0].rotulo).equal('Art. 1º');
          expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO ÚNICO');
        });
        it('Deveria apresentar o capítulo sob o título', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(1);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 5 eventos', () => {
            expect(eventos.length).to.equal(5);
          });
          it('Deveria apresentar o título como incluído', () => {
            expect(eventos[0].elementos!.length).equal(1);
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
          });
          it('3 Deveria apresentar o título incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO ÚNICO');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
        });
      });
    });
  });
});
