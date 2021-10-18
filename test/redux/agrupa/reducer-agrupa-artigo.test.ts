import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { AGRUPAR_ELEMENTO } from '../../../src/redux/elemento/action/elementoAction';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/evento';
import { StateEvent, StateType } from '../../../src/redux/state';
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
      const artigo = state.articulacao.artigos[1];
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e o novo capítulo como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar o artigo 2 e os demais sob o novo capítulo', () => {
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
      it('Deveria apresentar os 4 artigos e seus filhos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(5);
        expect(removidos.elementos![0].rotulo).equal('Art. 2º');
        expect(removidos.elementos![1].rotulo).equal('Art. 3º');
        expect(removidos.elementos![2].rotulo).equal('Art. 4º');
        expect(removidos.elementos![3].rotulo).equal('Art. 5º');
        expect(removidos.elementos![4].rotulo).equal('Parágrafo único.');
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
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar os artigos e seus filhos como incluídos', () => {
          expect(eventos[0].elementos!.length).equal(5);
          expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
          expect(eventos[0].elementos![1].rotulo).equal('Art. 3º');
          expect(eventos[0].elementos![2].rotulo).equal('Art. 4º');
          expect(eventos[0].elementos![3].rotulo).equal('Art. 5º');
          expect(eventos[0].elementos![4].rotulo).equal('Parágrafo único.');
        });
        it('Deveria apresentar o art. 2 incluído após o artigo 1', () => {
          expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
          expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
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
          it('Deveria apresentar os 4 artigos e seus filhos como removidos', () => {
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
    });
  });
  describe('Testando a inclusão quando há capitulo anterior', () => {
    beforeEach(function () {
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e os capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(3);
    });
    it('Deveria apresentar o artigo 5 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[2].filhos.length).equals(1);
      expect(state.articulacao.filhos[2].rotulo).equal('CAPÍTULO II');
      expect(state.articulacao.filhos[2].filhos[0].numero).equals('5');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar o novo capitulo, o artigo e seu filho como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(3);
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![2].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 4', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].referencia!.rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o artigo e seu filho como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(2);
        expect(removidos.elementos![0].rotulo).equal('Art. 5º');
        expect(removidos.elementos![1].rotulo).equal('Parágrafo único.');
      });
    });
  });
  describe('Testando a inclusão quando há capitulo posterior', () => {
    beforeEach(function () {
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e os capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(3);
    });
    it('Deveria apresentar os artigos 2 a 4 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[1].filhos.length).equals(3);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o capitulo incluído após o artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO I');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar os 4 artigos e seus filhos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(3);
      });
      it('Deveria apresentar o capitulo II como renumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO II');
      });
    });
  });
  describe('Testando a inclusão quando há capitulo anterior e posterior', () => {
    beforeEach(function () {
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
          conteudo: { texto: '3' },
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
          conteudo: { texto: '1' },
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[3].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
          conteudo: { texto: '2' },
        },
      });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o artigo 1 e os 3 capítulos como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(4);
    });
    it('Deveria apresentar o artigo 4 sob o novo capítulo', () => {
      expect(state.articulacao.filhos[3].filhos.length).equals(1);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o novo capitulo e seu filho como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(2);
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 3', () => {
        expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        expect(eventos[0].referencia!.rotulo).equal('Art. 3º');
      });
      it('Deveria apresentar o artigo 4 como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o capitulo III como renumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO III');
      });
    });
  });
  describe('Testando a inclusão de agrupador filho quando não há agrupador do mesmo tipo posterior', () => {
    beforeEach(function () {
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.secao.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o capitulo e o artigo 1 como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os 4 artigos sob a nova seção', () => {
      const secao = state.articulacao.filhos[1].filhos[0];
      expect(secao.filhos.length).equals(4);
      expect(secao.rotulo).equal('SEÇÃO I');
      expect(secao.filhos[0].rotulo).equals('Art. 2º');
      expect(secao.filhos[1].rotulo).equals('Art. 3º');
      expect(secao.filhos[2].rotulo).equals('Art. 4º');
      expect(secao.filhos[3].rotulo).equals('Art. 5º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar o novo capitulo, a secao, os artigos e filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(6);
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![2].rotulo).equal('Art. 3º');
        expect(eventos[0].elementos![3].rotulo).equal('Art. 4º');
        expect(eventos[0].elementos![4].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![5].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 4', () => {
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO I');
      });
      it('Deveria apresentar o artigo e seu filho como removidos', () => {
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
  describe('Testando a inclusão de agrupador filho quando há agrupador do mesmo tipo posterior', () => {
    beforeEach(function () {
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
        novo: {
          tipo: TipoDispositivo.secao.tipo,
        },
      });
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[1].uuid },
        novo: {
          tipo: TipoDispositivo.secao.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar apenas o capitulo e o artigo 1 como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os 3 artigos sob a nova seção', () => {
      const secao1 = state.articulacao.filhos[1].filhos[0];
      expect(secao1.filhos.length).equals(3);
      expect(secao1.rotulo).equal('SEÇÃO I');
      expect(secao1.filhos[0].rotulo).equals('Art. 2º');
      expect(secao1.filhos[1].rotulo).equals('Art. 3º');
      expect(secao1.filhos[2].rotulo).equals('Art. 4º');

      const secao2 = state.articulacao.filhos[1].filhos[1];
      expect(secao2.filhos.length).equals(1);
      expect(secao2.rotulo).equal('SEÇÃO II');
      expect(secao2.filhos[0].rotulo).equals('Art. 5º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar o novo capitulo, a secao e os artigos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(4);
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![2].rotulo).equal('Art. 3º');
        expect(eventos[0].elementos![3].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o capitulo incluído após o artigo 4', () => {
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO I');
      });
      it('Deveria apresentar os artigos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(3);
        expect(removidos.elementos![0].rotulo).equal('Art. 2º');
        expect(removidos.elementos![1].rotulo).equal('Art. 3º');
        expect(removidos.elementos![2].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar a seção renumerada', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('SEÇÃO II');
      });
    });
  });
});
