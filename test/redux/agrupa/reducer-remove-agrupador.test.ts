import { expect } from '@open-wc/testing';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { AGRUPAR_ELEMENTO } from '../../../src/model/lexml/acao/agruparElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES } from '../../doc/exemplo-agrupadores-artigos-sem-agrupadores';

let state: any;
let eventos: StateEvent[];

describe('Testando a exclusão de agrupador de agrupadores', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_AGRUPADORES_ARTIGOS_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a exclusão de agrupador único', () => {
    beforeEach(function () {
      // const artigo = state.articulacao.artigos[1];
      // state = agrupaElemento(state, {
      //   type: AGRUPAR_ELEMENTO,
      //   atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
      //   novo: {
      //     tipo: TipoDispositivo.capitulo.tipo,
      //   },
      // });
      // state = removeElemento(state, {
      //   type: REMOVER_ELEMENTO,
      //   atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: state.articulacao.filhos[1].uuid },
      //   novo: {
      //     tipo: TipoDispositivo.capitulo.tipo,
      //   },
      // });

      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const cap = createElemento(state.articulacao.filhos[1]);
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: cap, novo: { tipo: TipoDispositivo.capitulo.tipo } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos sem agrupadores, i. e., como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(5);
    });
    it('Deveria apresentar os artigos restaurados', () => {
      expect(state.articulacao.filhos[0].rotulo).equal('Art. 1º');
      expect(state.articulacao.filhos[1].rotulo).equal('Art. 2º');
      expect(state.articulacao.filhos[2].rotulo).equal('Art. 3º');
      expect(state.articulacao.filhos[3].rotulo).equal('Art. 4º');
      expect(state.articulacao.filhos[4].rotulo).equal('Art. 5º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      });
    });
  });
  describe('Testando a exclusão de agrupador sem agrupador anterior mas com agrupador posterior que não possui agrupadores filho', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const cap = createElemento(state.articulacao.filhos[1]);
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: cap, novo: { tipo: TipoDispositivo.capitulo.tipo } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 a 4 e o capítulo com o CAPÍTULO I (antigo capitulo II) como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(5);
    });
    it('Deveria apresentar os artigos restaurados', () => {
      expect(state.articulacao.filhos[0].rotulo).equal('Art. 1º');
      expect(state.articulacao.filhos[1].rotulo).equal('Art. 2º');
      expect(state.articulacao.filhos[2].rotulo).equal('Art. 3º');
      expect(state.articulacao.filhos[3].rotulo).equal('Art. 4º');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capítulo como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
      });
      // it('Deveria apresentar o antigo capítulo II como renumerado', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(1);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      // });
    });
  });
  describe('Testando a exclusão de agrupador que possui agrupadores filho e com agrupador anterior sem agrupador filho', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5b = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const cap = createElemento(state.articulacao.filhos[2]);
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: cap, novo: { tipo: TipoDispositivo.capitulo.tipo } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 e o CAPÍTULO I como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os artigos 2-4 e a seção do antigo capitulo II como filhos do Capítulo I', () => {
      expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
      expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Art. 3º');
      expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Art. 4º');
      expect(state.articulacao.filhos[1].filhos[3].rotulo).equal('Seção Única');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capítulo II como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
      });
      // it('Deveria apresentar o antigo capítulo II como renumerado', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(2);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      //   expect(renumerados.elementos![1].rotulo).equal('Seção Única');
      // });
    });
  });
  describe('Testando a exclusão de agrupador que possui agrupadores filho e com agrupador anterior com agrupador filho', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art2b = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5b = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const cap = createElemento(state.articulacao.filhos[2]);
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: cap, novo: { tipo: TipoDispositivo.capitulo.tipo } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 e o CAPÍTULO como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
      expect(state.articulacao.filhos[0].rotulo).equal('Art. 1º');
      expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO ÚNICO');
    });
    it('Deveria apresentar as seções como filhos do Capítulo I', () => {
      expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Seção I');
      expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Seção II');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capítulo II como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
      });
      // it('Deveria apresentar como renumerados', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(1);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      // });
    });
  });
  describe('Testando outra exclusão de agrupador que possui agrupadores filho e com agrupador anterior com agrupador filho', () => {
    beforeEach(function () {
      const art2 = createElemento(state.articulacao.artigos[1]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art2, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art3 = createElemento(state.articulacao.artigos[2]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art3, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const art5 = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5, novo: { tipo: TipoDispositivo.capitulo.tipo, posicao: 'antes' } });

      const art5b = createElemento(state.articulacao.artigos[4]);
      state = agrupaElemento(state, { type: AGRUPAR_ELEMENTO, atual: art5b, novo: { tipo: TipoDispositivo.secao.tipo, posicao: 'antes' } });

      const cap2 = createElemento(state.articulacao.filhos[2]);
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: cap2, novo: { tipo: TipoDispositivo.capitulo.tipo } });

      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 e o CAPÍTULO I como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar um capítulo e as seções como filhos do Capítulo I', () => {
      expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO ÚNICO');
      expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
      expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Seção I');
      expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Seção II');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o capítulo II como removido', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(1);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
      });
      // it('Deveria apresentar a seção em renumerados', () => {
      //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
      //   expect(renumerados.elementos!.length).equal(2);
      //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
      //   expect(renumerados.elementos![1].rotulo).equal('Seção II');
      // });
    });
    describe('Testando undo da outra exclusão de agrupador', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar os artigos 1 e os CAPÍTULOS como filhos da articulação', () => {
        expect(state.articulacao.filhos.length).equals(3);
      });
      it('Deveria apresentar dois capítulos', () => {
        expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO I');
        expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
        expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Seção Única'); // TODO
        expect(state.articulacao.filhos[2].rotulo).equal('CAPÍTULO II');
        expect(state.articulacao.filhos[2].filhos[0].rotulo).equal('Seção Única'); // TODO
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(eventos.length).to.equal(5);
        });
        it('Deveria apresentar o capítulo II  como incluído', () => {
          expect(eventos[0].elementos!.length).equal(1);
          expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
        });
        it('Deveria apresentar o capítulo incluído ao final do Art. 4', () => {
          expect(eventos[0].elementos![0].rotulo).equal('CAPÍTULO II');
          expect(eventos[0].referencia!.rotulo).equal('Art. 4º'); // TODO
        });
        // it('Deveria apresentar renumerados', () => {
        //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        //   expect(renumerados.elementos!.length).equal(1);
        //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO I');
        // });
      });
      describe('Testando redo', () => {
        beforeEach(function () {
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar os artigos 1 e o CAPÍTULO I como filhos da articulação', () => {
          expect(state.articulacao.filhos.length).equals(2);
        });
        it('Deveria apresentar um capítulo e as seções como filhos do Capítulo I', () => {
          expect(state.articulacao.filhos[1].rotulo).equal('CAPÍTULO ÚNICO');
          expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
          expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Seção I');
          expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Seção II');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 5 eventos', () => {
            expect(eventos.length).to.equal(5);
          });
          it('Deveria apresentar o capítulo II como removido', () => {
            const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removidos.elementos!.length).equal(1);
            expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
          });
          // it('Deveria apresentar a seção em renumerados', () => {
          //   const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          //   expect(renumerados.elementos!.length).equal(2);
          //   expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO ÚNICO');
          //   expect(renumerados.elementos![1].rotulo).equal('Seção II');
          // });
        });
      });
    });
  });
});
