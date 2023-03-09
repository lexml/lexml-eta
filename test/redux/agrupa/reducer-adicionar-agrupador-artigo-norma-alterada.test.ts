import { removeElemento } from './../../../src/redux/elemento/reducer/removeElemento';
import { getEventosQuePossuemElementos } from './../../../src/redux/elemento/evento/eventosUtil';
import { isAgrupador } from './../../../src/model/dispositivo/tipo';
import { isDispositivoCabecaAlteracao } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from './../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from './../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from './../../../src/model/elemento/elementoUtil';
import { MPV_1089_2021 } from './../../doc/mpv_1089_2021';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State, StateEvent } from '../../../src/redux/state';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { redo } from '../../../src/redux/elemento/reducer/redo';

let state: State;
let eventos: StateEvent[];

describe('Testando a inclusão de agrupador de dispositivo de norma alterada', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1089_2021, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });
  it('Deveria possuir articulação com 6 artigos', () => {
    expect(state.articulacao?.filhos.length).to.equal(6);
    expect(state.articulacao?.artigos.length).to.equal(6);
  });

  describe('Testando inclusão de agrupador como nova alteração', () => {
    beforeEach(function () {
      const art1 = state.articulacao!.artigos[0];
      const art1alt2 = createElemento(art1.alteracoes!.filhos[1]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art1alt2, novo: { tipo: 'Capitulo', posicao: 'antes', manterNoMesmoGrupoDeAspas: false } });
    });
    it('Deveria possuir 4 alterações no Art. 1º da MPV', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(art1.alteracoes?.filhos.length).to.equal(4);
    });
    it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(isAgrupador(art1.alteracoes!.filhos[1])).to.equal(true);
      expect(isDispositivoCabecaAlteracao(art1.alteracoes!.filhos[1])).to.equal(true);
    });
    it('Deveria manter, como cabeça de alteração, o "Art. 6º" dentro do Art. 1º da MPV', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(art1.alteracoes!.filhos[2].rotulo).to.equal('Art. 6º');
      expect(isDispositivoCabecaAlteracao(art1.alteracoes!.filhos[2])).to.equal(true);
    });
  });

  // describe('Testando inclusão de agrupador como nova alteração após artigo filho de agrupador', () => {
  //   beforeEach(function () {
  //     const art2 = state.articulacao!.artigos[1];
  //     const art192 = createElemento(art2.alteracoes!.filhos[24].filhos[0].filhos[0]);
  //     state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art192, novo: { tipo: 'Titulo', posicao: 'depois', manterNoMesmoGrupoDeAspas: false } });
  //   });
  //   it('Deveria possuir 27 alterações no Art. 2º da MPV', () => {
  //     const art2 = state.articulacao!.artigos[1];
  //     expect(art2.alteracoes?.filhos.length).to.equal(27);
  //   });
  //   it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
  //     const art2 = state.articulacao!.artigos[1];
  //     expect(isAgrupador(art2.alteracoes!.filhos[25])).to.equal(true);
  //     expect(isDispositivoCabecaAlteracao(art2.alteracoes!.filhos[25])).to.equal(true);
  //     expect(art2.alteracoes!.filhos[25].rotulo).to.equal('TÍTULO');
  //   });
  //   it('Deveria manter, como cabeça de alteração, o "CAPÍTULO III" dentro do Art. 2º da MPV', () => {
  //     const art2 = state.articulacao!.artigos[1];
  //     expect(art2.alteracoes!.filhos[24].rotulo).to.equal('CAPÍTULO III');
  //     expect(isDispositivoCabecaAlteracao(art2.alteracoes!.filhos[24])).to.equal(true);
  //   });
  // });

  describe('Testando inclusão de agrupador dentro do mesmo grupo de aspas', () => {
    beforeEach(function () {
      const art1 = state.articulacao!.artigos[0];
      const art1alt2 = createElemento(art1.alteracoes!.filhos[1]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art1alt2, novo: { tipo: 'Capitulo', posicao: 'antes', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria possuir 3 alterações no Art. 1º da MPV', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(art1.alteracoes?.filhos.length).to.equal(3);
    });
    it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
      const art1 = state.articulacao!.artigos[0];
      expect(isAgrupador(art1.alteracoes!.filhos[1])).to.equal(true);
      expect(isDispositivoCabecaAlteracao(art1.alteracoes!.filhos[1])).to.equal(true);
    });
    it('Deveria apresentar 1 filho no novo agrupador', () => {
      const art1 = state.articulacao!.artigos[0];
      const agrupador = art1.alteracoes!.filhos[1];
      expect(agrupador.filhos.length).to.equal(1);
      expect(agrupador.filhos[0].rotulo).to.equal('Art. 6º');
      expect(isDispositivoCabecaAlteracao(agrupador.filhos[0])).to.equal(false);
    });
  });

  describe('Testando inclusão de agrupador de agrupador, com mesmo nível, dentro do mesmo grupo de aspas', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art2alt24 = createElemento(art2.alteracoes!.filhos[24]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art2alt24, novo: { tipo: 'Capitulo', posicao: 'antes', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria apresentar mensagem de erro ao tentar adicionar outro dispositivo de mesmo nível na alteração', () => {
      expect(state.ui?.message?.descricao).to.equal('Não é permitido adicionar agrupador "Capítulo", no mesmo grupo de aspas, antes do dispositivo selecionado [CAPÍTULO III]');
    });
    it('Deveria possuir 26 alterações no Art. 2º da MPV', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(art2.alteracoes?.filhos.length).to.equal(26);
    });
  });

  describe('Testando inclusão de agrupador (cabeça de alteração) de agrupador dentro do mesmo grupo de aspas', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art2alt24 = createElemento(art2.alteracoes!.filhos[24]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art2alt24, novo: { tipo: 'Titulo', posicao: 'antes', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria possuir 26 alterações no Art. 2º da MPV', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(art2.alteracoes?.filhos.length).to.equal(26);
    });
    it('Deveria apresentar novo agrupador como cabeça de alteração', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(isAgrupador(art2.alteracoes!.filhos[24])).to.equal(true);
      expect(isDispositivoCabecaAlteracao(art2.alteracoes!.filhos[24])).to.equal(true);
    });
    it('Deveria apresentar 1 filho no novo agrupador', () => {
      const art2 = state.articulacao!.artigos[1];
      const agrupador = art2.alteracoes!.filhos[24];
      expect(agrupador.filhos.length).to.equal(1);
      expect(agrupador.filhos[0].rotulo).to.equal('CAPÍTULO III');
      expect(isDispositivoCabecaAlteracao(agrupador.filhos[0])).to.equal(false);
    });
  });

  describe('Testando inclusão de seção filho de agrupador cabeça de alteração', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art2alt24 = createElemento(art2.alteracoes!.filhos[24]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art2alt24, novo: { tipo: 'Secao', posicao: 'depois', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria possuir 26 alterações no Art. 2º da MPV', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(art2.alteracoes?.filhos.length).to.equal(26);
    });
    it('Deveria possuir cabeça de alteração com 2 filhos', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(isDispositivoCabecaAlteracao(cap3)).to.equal(true);
      expect(cap3.filhos.length).to.equal(2);
      expect(cap3.filhos.every(f => f.tipo === 'Secao')).to.equal(true);
    });
    it('Deveria apresentar novo agrupador como filho da cabeça de alteração', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(cap3.filhos[0].rotulo).to.equal('Seção');
      expect(cap3.filhos[0].pai === cap3).to.equal(true);
    });
  });

  describe('Testando inclusão de seção antes do art 192 e após seção existente', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art192 = createElemento(art2.alteracoes!.filhos[24].filhos[0].filhos[0]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art192, novo: { tipo: 'Secao', posicao: 'antes', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria possuir 26 alterações no Art. 2º da MPV', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(art2.alteracoes?.filhos.length).to.equal(26);
    });
    it('Deveria possuir Capítulo III com 2 filhos', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(isDispositivoCabecaAlteracao(cap3)).to.equal(true);
      expect(cap3.filhos.length).to.equal(2);
      expect(cap3.filhos.every(f => f.tipo === 'Secao')).to.equal(true);
    });
    it('Deveria apresentar Seção IV (preexistente) sem filhos', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(cap3.filhos[0].rotulo).to.equal('Seção IV');
      expect(cap3.filhos[0].filhos.length).to.equal(0);
    });
    it('Deveria apresentar nova seção com 1 filho', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(cap3.filhos[1].rotulo).to.equal('Seção');
      expect(cap3.filhos[1].filhos.length).to.equal(1);
      expect(cap3.filhos[1].pai === cap3).to.equal(true);
    });
  });

  describe('Testando inclusão de seção após seção existente', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art2alt24 = createElemento(art2.alteracoes!.filhos[24].filhos[0]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art2alt24, novo: { tipo: 'Secao', posicao: 'depois', manterNoMesmoGrupoDeAspas: true } });
    });

    describe('Testando EXCLUSÃO de seção após seção existente', () => {
      beforeEach(function () {
        const art2 = state.articulacao!.artigos[1];
        const art2alt24sec2 = createElemento(art2.alteracoes!.filhos[24].filhos[1]);
        state = removeElemento(state, { atual: art2alt24sec2 });
        eventos = getEventosQuePossuemElementos(state.ui!.events);
      });
      it('Deveria apresentar capítulo 3 com 1 filho', () => {
        const art2 = state.articulacao!.artigos[1];
        const cap3 = art2.alteracoes!.filhos[24];
        expect(cap3.filhos.length).to.equal(1);
        expect(cap3.filhos[0].rotulo).to.equal('Seção IV');
      });
      it('Deveria apresentar seção existente com 1 filho', () => {
        const art2 = state.articulacao!.artigos[1];
        const cap3 = art2.alteracoes!.filhos[24];
        expect(cap3.filhos[0].filhos[0].rotulo).to.equal('Art. 192.');
        expect(cap3.filhos[0].filhos.length).to.equal(1);
      });
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
    });

    describe('Testando UNDO de inclusão de seção após seção existente', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui!.events);
      });
      it('Deveria apresentar capítulo 3 com 1 filho', () => {
        const art2 = state.articulacao!.artigos[1];
        const cap3 = art2.alteracoes!.filhos[24];
        expect(cap3.filhos.length).to.equal(1);
        expect(cap3.filhos[0].rotulo).to.equal('Seção IV');
      });
      it('Deveria apresentar seção existente com 1 filho', () => {
        const art2 = state.articulacao!.artigos[1];
        const cap3 = art2.alteracoes!.filhos[24];
        expect(cap3.filhos[0].filhos[0].rotulo).to.equal('Art. 192.');
        expect(cap3.filhos[0].filhos.length).to.equal(1);
      });
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      describe('Testando REDO de inclusão de seção após seção existente', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria possuir cabeça de alteração com 2 filhos', () => {
          const art2 = state.articulacao!.artigos[1];
          const cap3 = art2.alteracoes!.filhos[24];
          expect(isDispositivoCabecaAlteracao(cap3)).to.equal(true);
          expect(cap3.filhos.length).to.equal(2);
          expect(cap3.filhos.every(f => f.tipo === 'Secao')).to.equal(true);
        });
        it('Deveria apresentar seção existente sem filhos', () => {
          const art2 = state.articulacao!.artigos[1];
          const cap3 = art2.alteracoes!.filhos[24];
          expect(cap3.filhos[0].rotulo).to.equal('Seção IV');
          expect(cap3.filhos[0].filhos.length).to.equal(0);
        });
        it('Deveria apresentar nova seção reincluída com 1 filho', () => {
          const art2 = state.articulacao!.artigos[1];
          const cap3 = art2.alteracoes!.filhos[24];
          expect(cap3.filhos[1].rotulo).to.equal('Seção');
          expect(cap3.filhos[1].filhos.length).to.equal(1);
          expect(cap3.filhos[1].pai === cap3).to.equal(true);
        });
      });
    });

    it('Deveria possuir 26 alterações no Art. 2º da MPV', () => {
      const art2 = state.articulacao!.artigos[1];
      expect(art2.alteracoes?.filhos.length).to.equal(26);
    });
    it('Deveria possuir cabeça de alteração com 2 filhos', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(isDispositivoCabecaAlteracao(cap3)).to.equal(true);
      expect(cap3.filhos.length).to.equal(2);
      expect(cap3.filhos.every(f => f.tipo === 'Secao')).to.equal(true);
    });
    it('Deveria apresentar seção existente sem filhos', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(cap3.filhos[0].rotulo).to.equal('Seção IV');
      expect(cap3.filhos[0].filhos.length).to.equal(0);
    });
    it('Deveria apresentar nova seção com 1 filho', () => {
      const art2 = state.articulacao!.artigos[1];
      const cap3 = art2.alteracoes!.filhos[24];
      expect(cap3.filhos[1].rotulo).to.equal('Seção');
      expect(cap3.filhos[1].filhos.length).to.equal(1);
      expect(cap3.filhos[1].pai === cap3).to.equal(true);
    });
  });

  describe('Testando inclusão de capítulo após seção existente', () => {
    beforeEach(function () {
      const art2 = state.articulacao!.artigos[1];
      const art2alt24 = createElemento(art2.alteracoes!.filhos[24].filhos[0]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art2alt24, novo: { tipo: 'Capitulo', posicao: 'depois', manterNoMesmoGrupoDeAspas: true } });
    });
    it('Deveria apresentar mensagem de erro ao tentar adicionar agrupador que não pode ser filho da seção ou da cabeça de alteração', () => {
      expect(state.ui?.message?.descricao).to.equal('Não é permitido adicionar agrupador "Capítulo", no mesmo grupo de aspas, após o dispositivo selecionado [Seção IV]');
    });
  });
});
