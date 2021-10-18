import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacao-parser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipo-dispositivo';
import { AGRUPAR_ELEMENTO } from '../../../src/redux/elemento-actions';
import { agruparElemento, redo, undo } from '../../../src/redux/elemento-reducer';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/event';
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
      const artigo = state.articulacao.artigos[1];
      state = agruparElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      const capitulo = state.articulacao.filhos[1];
      state = agruparElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: capitulo.uuid },
        novo: {
          tipo: TipoDispositivo.titulo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar o o capítulo sob o novo título', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(1);
      expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO I');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar o titulo,o capitulo e os 4 artigos e seus filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(7);
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
        expect(eventos[0].elementos![1].rotulo).equal('CAPÍTULO I');
        expect(eventos[0].elementos![2].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![3].rotulo).equal('Art. 3º');
        expect(eventos[0].elementos![4].rotulo).equal('Art. 4º');
        expect(eventos[0].elementos![5].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![6].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o TÍTULO incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o capítulo e os 4 artigos e seus filhos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(6);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
        expect(removidos.elementos![1].rotulo).equal('Art. 2º');
        expect(removidos.elementos![2].rotulo).equal('Art. 3º');
        expect(removidos.elementos![3].rotulo).equal('Art. 4º');
        expect(removidos.elementos![4].rotulo).equal('Art. 5º');
        expect(removidos.elementos![5].rotulo).equal('Parágrafo único.');
      });
    });
    describe('Testando undo e redo da inclusão do título de capítulo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar apenas o artigo 1 e o novo titulo como filhos da articulação', () => {
        expect(state.articulacao.filhos.length).equals(2);
      });
      it('Deveria apresentar o capítulo sem título', () => {
        expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO I');
        expect(state.articulacao.filhos[1].pai).equals(state.articulacao);
      });
      it('Deveria apresentar os artigos de 2 a 5 sob o capítulo agora sem título', () => {
        expect(state.articulacao.filhos[1].filhos.length).equals(4);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar o capitulo e os 4 artigos e seus filhos como incluídos', () => {
          expect(eventos[0].elementos!.length).equal(6);
          expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
          expect(eventos[0].elementos![1].rotulo).equal('Art. 2º');
          expect(eventos[0].elementos![2].rotulo).equal('Art. 3º');
          expect(eventos[0].elementos![3].rotulo).equal('Art. 4º');
          expect(eventos[0].elementos![4].rotulo).equal('Art. 5º');
          expect(eventos[0].elementos![5].rotulo).equal('Parágrafo único.');
        });
        it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
          expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
          expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
        });
        it('Deveria apresentar o título, o capítulo e os 4 artigos e seus filhos como removidos', () => {
          const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removidos.elementos!.length).equal(7);
          expect(removidos.elementos![0].rotulo).equal('TÍTULO I');
          expect(removidos.elementos![1].rotulo).equal('CAPÍTULO I');
          expect(removidos.elementos![2].rotulo).equal('Art. 2º');
          expect(removidos.elementos![3].rotulo).equal('Art. 3º');
          expect(removidos.elementos![4].rotulo).equal('Art. 4º');
          expect(removidos.elementos![5].rotulo).equal('Art. 5º');
          expect(removidos.elementos![6].rotulo).equal('Parágrafo único.');
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
          expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO I');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 2 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar o titulo,o capitulo e os 4 artigos e seus filhos como incluídos', () => {
            expect(eventos[0].elementos!.length).equal(7);
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
            expect(eventos[0].elementos![1].rotulo).equal('CAPÍTULO I');
            expect(eventos[0].elementos![2].rotulo).equal('Art. 2º');
            expect(eventos[0].elementos![3].rotulo).equal('Art. 3º');
            expect(eventos[0].elementos![4].rotulo).equal('Art. 4º');
            expect(eventos[0].elementos![5].rotulo).equal('Art. 5º');
            expect(eventos[0].elementos![6].rotulo).equal('Parágrafo único.');
          });
          it('Deveria apresentar o TÍTULO incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
          it('Deveria apresentar o capítulo e os 4 artigos e seus filhos como removidos', () => {
            const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removidos.elementos!.length).equal(6);
            expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
            expect(removidos.elementos![1].rotulo).equal('Art. 2º');
            expect(removidos.elementos![2].rotulo).equal('Art. 3º');
            expect(removidos.elementos![3].rotulo).equal('Art. 4º');
            expect(removidos.elementos![4].rotulo).equal('Art. 5º');
            expect(removidos.elementos![5].rotulo).equal('Parágrafo único.');
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
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar os 4 artigos e seus filhos como incluídos', () => {
          expect(eventos[0].elementos!.length).equal(5);
          expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
          expect(eventos[0].elementos![1].rotulo).equal('Art. 3º');
          expect(eventos[0].elementos![2].rotulo).equal('Art. 4º');
          expect(eventos[0].elementos![3].rotulo).equal('Art. 5º');
          expect(eventos[0].elementos![4].rotulo).equal('Parágrafo único.');
        });
        it('Deveria apresentar o artigo 2 incluído após o artigo 1', () => {
          expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
          expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
        });
        it('Deveria apresentar o título, o capítulo e os 4 artigos e seus filhos como removidos', () => {
          const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removidos.elementos!.length).equal(6);
          expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
          expect(removidos.elementos![1].rotulo).equal('Art. 2º');
          expect(removidos.elementos![2].rotulo).equal('Art. 3º');
          expect(removidos.elementos![3].rotulo).equal('Art. 4º');
          expect(removidos.elementos![4].rotulo).equal('Art. 5º');
          expect(removidos.elementos![5].rotulo).equal('Parágrafo único.');
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
          expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO I');
        });
        it('Deveria apresentar os artigos 2 a 5 sob o capítulo', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(4);
          expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
          expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Art. 3º');
          expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Art. 4º');
          expect(state.articulacao.filhos[1].filhos[3].rotulo).equal('Art. 5º');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 2 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar o capitulo e os 5 artigos e seus filhos como incluídos', () => {
            expect(eventos[0].elementos!.length).equal(6);
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
            expect(eventos[0].elementos![1].rotulo).equal('Art. 2º');
            expect(eventos[0].elementos![2].rotulo).equal('Art. 3º');
            expect(eventos[0].elementos![3].rotulo).equal('Art. 4º');
            expect(eventos[0].elementos![4].rotulo).equal('Art. 5º');
            expect(eventos[0].elementos![5].rotulo).equal('Parágrafo único.');
          });
          it('Deveria apresentar o capítulo incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
          it('Deveria apresentar o capítulo e os 4 artigos e seus filhos como removidos', () => {
            const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removidos.elementos!.length).equal(5);
            expect(removidos.elementos![0].rotulo).equal('Art. 2º');
            expect(removidos.elementos![1].rotulo).equal('Art. 3º');
            expect(removidos.elementos![2].rotulo).equal('Art. 4º');
            expect(removidos.elementos![3].rotulo).equal('Art. 5º');
            expect(removidos.elementos![4].rotulo).equal('Parágrafo único.');
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
          expect(state.articulacao.filhos[1].rotulo).equal('TÍTULO I');
        });
        it('Deveria apresentar o capítulo sob o título', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(1);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 2 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar o título, capitulo e os 5 artigos e seus filhos como incluídos', () => {
            expect(eventos[0].elementos!.length).equal(7);
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
            expect(eventos[0].elementos![1].rotulo).equal('CAPÍTULO I');
            expect(eventos[0].elementos![2].rotulo).equal('Art. 2º');
            expect(eventos[0].elementos![3].rotulo).equal('Art. 3º');
            expect(eventos[0].elementos![4].rotulo).equal('Art. 4º');
            expect(eventos[0].elementos![5].rotulo).equal('Art. 5º');
            expect(eventos[0].elementos![6].rotulo).equal('Parágrafo único.');
          });
          it('Deveria apresentar o título incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('TÍTULO I');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
          it('Deveria apresentar o título, o capítulo e os 4 artigos e seus filhos como removidos', () => {
            const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removidos.elementos!.length).equal(6);
            expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
            expect(removidos.elementos![1].rotulo).equal('Art. 2º');
            expect(removidos.elementos![2].rotulo).equal('Art. 3º');
            expect(removidos.elementos![3].rotulo).equal('Art. 4º');
            expect(removidos.elementos![4].rotulo).equal('Art. 5º');
            expect(removidos.elementos![5].rotulo).equal('Parágrafo único.');
          });
        });
      });
    });
  });
});
