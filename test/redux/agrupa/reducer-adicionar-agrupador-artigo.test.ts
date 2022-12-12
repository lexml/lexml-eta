import { selecionaElemento } from './../../../src/redux/elemento/reducer/selecionaElemento';
import { ADICIONAR_AGRUPADOR_ARTIGO } from './../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from './../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from './../../../src/model/elemento/elementoUtil';
import { MPV_905_2019 } from './../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

import { State, StateType } from '../../../src/redux/state';
import { Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';

let state: State;
let agrupadorCriado: Dispositivo;
// let eventos: StateEvent[];

describe('Testando a inclusão de agrupador de dispositivo da MPV', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });
  it('Deveria possuir articulação com 7 capítulos filhos', () => {
    const nFilhos = state.articulacao?.filhos.length;
    const nCap = state.articulacao?.filhos.filter(f => f.tipo === 'Capitulo').length;
    expect(nFilhos).to.equal(7);
    expect(nCap).to.equal(nFilhos);
  });

  describe('Testando inclusão de 1 Seção', () => {
    beforeEach(function () {
      const art6 = createElemento(state.articulacao!.artigos[5]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art6, novo: { tipo: 'Secao', posicao: 'antes' } });
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });
    it('Deveria possuir Seção 1 como pai dos artigos 6 a 18', () => {
      const sec = state.articulacao!.artigos[5].pai!;
      expect(sec.id).to.equal('cap1_sec1');
      expect(sec.filhos.length).to.equal(13);
      expect(sec.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(13);
    });
    it('Deveria encontrar artigo que mudou de pai na articulação', () => {
      const evReferenciado = getEvento(state.ui!.events, StateType.ElementoReferenciado);
      const art6 = evReferenciado.elementos![0];
      const tempState = selecionaElemento(state, { atual: art6 });
      expect(tempState.ui!.events.length).to.equal(1);
    });
  });

  describe('Testando inclusão e exclusão de agrupador', () => {
    beforeEach(function () {
      const art6 = createElemento(state.articulacao!.artigos[5]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art6, novo: { tipo: 'Capitulo', posicao: 'antes' } });
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });
    it('Deveria possuir Capítulo I-1 como pai dos artigos 6 a 18', () => {
      const cap1_1 = state.articulacao!.artigos[5].pai!;
      expect(cap1_1.id).to.equal('cap1-1');
      expect(cap1_1.rotulo).to.equal('CAPÍTULO I-1');
      expect(cap1_1.filhos.length).to.equal(13);
      expect(cap1_1.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(13);
    });
    it('Deveria encontrar artigo que mudou de pai na articulação', () => {
      const evReferenciado = getEvento(state.ui!.events, StateType.ElementoReferenciado);
      const art6 = evReferenciado.elementos![0];
      const tempState = selecionaElemento(state, { atual: art6 });
      expect(tempState.ui!.events.length).to.equal(1);
    });
  });

  describe('Testando inclusão de 2 Seções', () => {
    beforeEach(function () {
      const art6 = createElemento(state.articulacao!.artigos[5]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art6, novo: { tipo: 'Secao', posicao: 'antes' } });
      const art3 = createElemento(state.articulacao!.artigos[2]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art3, novo: { tipo: 'Secao', posicao: 'antes' } });
    });
    it('Deveria possuir Seção 1 como pai dos artigos 3, 4 e 5', () => {
      const sec = state.articulacao!.artigos[2].pai!;
      expect(sec.id).to.equal('cap1_sec1');
      expect(sec.filhos.length).to.equal(3);
      expect(sec.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(3);
    });
    it('Deveria possuir Seção 2 como pai dos artigos 6 a 18', () => {
      const sec = state.articulacao!.artigos[5].pai!;
      expect(sec.id).to.equal('cap1_sec2');
      expect(sec.filhos.length).to.equal(13);
      expect(sec.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(13);
    });
  });

  describe('Testando a inclusão de agrupador "Parte" ANTES do "Capítulo I"', () => {
    beforeEach(function () {
      const cap1 = createElemento(state.articulacao!.filhos[0]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: cap1, novo: { tipo: 'Parte', posicao: 'antes' } });
      agrupadorCriado = state.articulacao!.filhos[0]!;
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });
    it('Deveria possuir 1 filho na articulação', () => {
      expect(state.articulacao?.filhos.length).to.equal(1);
      expect(agrupadorCriado.tipo).to.equal('Parte');
      expect(agrupadorCriado.pai?.tipo).to.equal('Articulacao');
    });
    it('Deveria possuir 7 filhos do tipo "Capitulo" no agrupador "Parte"', () => {
      expect(agrupadorCriado.filhos.length).to.equal(7);
      expect(agrupadorCriado.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(7);
      expect(agrupadorCriado.filhos.filter(f => f.tipo === 'Capitulo' && f.pai === agrupadorCriado).length).to.equal(7);
    });
  });

  describe('Testando a inclusão de agrupador "Parte" DEPOIS do "Capítulo I"', () => {
    beforeEach(function () {
      const cap1 = createElemento(state.articulacao!.filhos[0]);
      state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: cap1, novo: { tipo: 'Parte', posicao: 'depois' } });
      agrupadorCriado = state.articulacao!.filhos[1]!;
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });
    it('Deveria possuir 2 filhos na articulação', () => {
      expect(state.articulacao?.filhos.length).to.equal(2);
      expect(agrupadorCriado.tipo).to.equal('Parte');
      expect(agrupadorCriado.pai?.tipo).to.equal('Articulacao');

      expect(state.articulacao?.filhos[0].tipo).to.equal('Capitulo');
      expect(state.articulacao?.filhos[1]).to.equal(agrupadorCriado);
    });
    it('Deveria apresentar o agrupador criado no index 1 da articulação', () => {
      expect(state.articulacao?.filhos.indexOf(agrupadorCriado)).to.equal(1);
    });
    it('Deveria possuir 24 filhos no agrupador "Parte"', () => {
      expect(agrupadorCriado.filhos.length).to.equal(24);
      expect(agrupadorCriado.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(18);
      expect(agrupadorCriado.filhos.filter(f => f.tipo === 'Capitulo').length).to.equal(6);
      expect(agrupadorCriado.filhos.filter(f => f.tipo === 'Capitulo' && f.pai === agrupadorCriado).length).to.equal(6);
    });
  });

  describe('Testando a inclusão de uma estrutura de agrupadores', () => {
    describe('Testando a articulação após criação de estrutura de agrupadores', () => {
      beforeEach(function () {
        /*
          Parte
            Livro
              Titulo
                Capitulo I
                  Art. 1º
                  ...
                  Art. 5º
                  Secao
                    Art. 6º
                    ...
                    Art. 18º
                Capitulo II
                ...
        */
        let atual = createElemento(state.articulacao!.filhos[0]); // Cap
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Parte', posicao: 'antes' } });

        atual = createElemento(state.articulacao!.filhos[0]); // Parte
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Livro', posicao: 'depois' } });

        atual = createElemento(state.articulacao!.filhos[0].filhos[0]); // Livro
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Titulo', posicao: 'depois' } });

        atual = createElemento(state.articulacao!.artigos[5]); // Cria seção antes do Art. 6º
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'antes' } });
      });

      it('Testando agrupador criado PARTE', () => {
        const dispositivo = state.articulacao!.filhos[0]!; // Parte
        expect(dispositivo.pai!.tipo).to.equal('Articulacao');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Parte');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador criado LIVRO', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0]; // Livro
        expect(dispositivo.pai!.tipo).to.equal('Parte');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Livro');
        expect(dispositivo.filhos.length).to.equal(1);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador criado TITULO', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0]; // Título
        expect(dispositivo.pai!.tipo).to.equal('Livro');
        expect(dispositivo.pai!.filhos.length).to.equal(1);
        expect(dispositivo.tipo).to.equal('Titulo');
        expect(dispositivo.filhos.length).to.equal(7);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
      });
      it('Testando agrupador modificado CAPITULO I', () => {
        const dispositivo = state.articulacao!.filhos[0]!.filhos[0].filhos[0].filhos[0]; // Capítulo I
        expect(dispositivo.pai!.tipo).to.equal('Titulo');
        expect(dispositivo.pai!.filhos.length).to.equal(7);
        expect(dispositivo.tipo).to.equal('Capitulo');
        expect(dispositivo.filhos.length).to.equal(6);
        expect(dispositivo.filhos.every(f => f.pai === dispositivo)).to.equal(true);
        expect(dispositivo.filhos[4].id).to.equal('art5');
        expect(dispositivo.filhos[5].id).to.equal('prt1_liv1_tit1_cap1_sec1');
      });
      it('Testando agrupador criado SECAO', () => {
        const dispositivo = state.articulacao!.artigos[5].pai!; // Seção
        expect(dispositivo.pai!.tipo).to.equal('Capitulo');
        expect(dispositivo.pai!.filhos.length).to.equal(6);
        expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Artigo').length).to.equal(5);
        expect(dispositivo.pai!.filhos.filter(f => f.tipo === 'Secao').length).to.equal(1);
        expect(dispositivo.pai!.filhos.every(f => f.pai === dispositivo.pai)).to.equal(true);
        expect(dispositivo.pai!.filhos[4].id).to.equal('art5');
        expect(dispositivo.pai!.filhos[5]).to.equal(dispositivo);
        expect(dispositivo.tipo).to.equal('Secao');
        expect(dispositivo.filhos.length).to.equal(13);
        expect(dispositivo.filhos.every(f => f.tipo === 'Artigo')).to.equal(true);
        expect(dispositivo.filhos[0].id).to.equal('art6');
        expect(dispositivo.id).to.equal('prt1_liv1_tit1_cap1_sec1');
      });
    });
  });
});
