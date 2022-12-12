import { expect } from '@open-wc/testing';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { AGRUPAR_ELEMENTO } from '../../../src/model/lexml/acao/agruparElementoAction';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent } from '../../../src/redux/state';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupadores', () => {
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
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e o novo capítulo como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar o artigo 2 e os demais sob o novo capítulo', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(4);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capitulo como incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
    });
    describe('Testando o undo da inclusão', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar apenas os artigos como filhos da articulação', () => {
        expect(state.articulacao.filhos.length).equals(5);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(eventos.length).to.equal(5);
        });
      });
      describe('Testando o redo da inclusão', () => {
        beforeEach(function () {
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar apenas o artigo 1 e o novo capítulo como filhos da articulação', () => {
          expect(state.articulacao.filhos.length).equals(2);
        });
        it('Deveria apresentar o artigo 2 e os demais sob o novo capítulo', () => {
          expect(state.articulacao.filhos[1].filhos.length).equals(4);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 5 eventos', () => {
            expect(eventos.length).to.equal(5);
          });
          it('Deveria apresentar o capitulo como incluído', () => {
            expect(eventos[0].elementos!.length).equal(1);
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
          });
          it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
            expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
            expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
          });
        });
      });
    });
  });
  describe('Testando a inclusão quando há capitulo anterior', () => {
    beforeEach(function () {
      // state = agrupaElemento(state, {
      //   type: AGRUPAR_ELEMENTO,
      //   atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
      //   novo: {
      //     tipo: TipoDispositivo.capitulo.tipo,
      //   },
      // });
      // state = agrupaElemento(state, {
      //   type: AGRUPAR_ELEMENTO,
      //   atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
      //   novo: {
      //     tipo: TipoDispositivo.capitulo.tipo,
      //   },
      // });

      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('1 Deveria apresentar apenas o artigo 1 e os capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(3);
    });
    it('Deveria apresentar o artigo 5 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[2].filhos.length).equals(1);
      expect(state.articulacao.filhos[2].rotulo).equal('CAPÍTULO II');
      expect(state.articulacao.filhos[2].filhos[0].numero).equals('5');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o novo capitulo como incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 4', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].referencia!.rotulo).equal('Art. 4º');
      });
    });
  });
  describe('Testando a inclusão quando há capitulo posterior', () => {
    beforeEach(function () {
      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('2 Deveria apresentar apenas o artigo 1 e os capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(3);
    });
    it('Deveria apresentar os artigos 2 a 4 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(3);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      // it('Deveria apresentar o capitulo II como renumerado', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO II');
      // });
    });
  });
  describe('Testando a inclusão quando há capitulo anterior e posterior', () => {
    beforeEach(function () {
      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art4 = createElemento(state.articulacao.artigos[3]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art4, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e os 3 capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(4);
    });
    it('Deveria apresentar o artigo 4 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[3].filhos.length).equals(1);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o novo capitulo como incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 3', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].referencia!.rotulo).equal('Art. 3º');
      });
      // it('Deveria apresentar o capitulo III como renumerado', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(1);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO III');
      // });
    });
  });
  describe('Testando a inclusão de agrupador filho quando não há agrupador do mesmo tipo posterior', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art2b = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o capitulo e o artigo 1 como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os 4 artigos sob a nova seção', () => {
      const secao = state.articulacao.filhos[1].filhos[0];
      expect(secao.filhos.length).equals(4);
      expect(secao.rotulo).equal('SEÇÃO ÚNICA');
      expect(secao.filhos[0].rotulo).equals('Art. 2º');
      expect(secao.filhos[1].rotulo).equals('Art. 3º');
      expect(secao.filhos[2].rotulo).equals('Art. 4º');
      expect(secao.filhos[3].rotulo).equals('Art. 5º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar a secao como incluída', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO ÚNICA');
      });
      it('Deveria apresentar a seção incluída após o capítulo', () => {
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO ÚNICA');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO ÚNICO');
      });
    });
  });
  describe('Testando a inclusão de agrupador filho quando há agrupador do mesmo tipo posterior', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const art2b = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o capitulo e o artigo 1 como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os 3 artigos sob a nova seção', () => {
      const secao1 = state.articulacao.filhos[1].filhos[0];
      expect(secao1.filhos.length).equals(3);
      expect(secao1.rotulo).equal('Seção I');
      expect(secao1.filhos[0].rotulo).equals('Art. 2º');
      expect(secao1.filhos[1].rotulo).equals('Art. 3º');
      expect(secao1.filhos[2].rotulo).equals('Art. 4º');

      const secao2 = state.articulacao.filhos[1].filhos[1];
      expect(secao2.filhos.length).equals(1);
      expect(secao2.rotulo).equal('Seção II');
      expect(secao2.filhos[0].rotulo).equals('Art. 5º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar a secao como incluída', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('Seção I');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 4', () => {
        expect(eventos[0].elementos![0].rotulo).equal('Seção I');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO ÚNICO');
      });
      // it('Deveria apresentar a seção renumerada', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(1);
      //   expect(renumerados.elementos![0].rotulo).equal('Seção II');
      // });
    });
  });
});
