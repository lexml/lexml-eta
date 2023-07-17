import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

let state: State;

describe('Testando operações sobre a MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
  });

  describe('Testando inclusão de agrupador em modo de revisão e fazendo UNDO', () => {
    it('Deveria não possuir revisão', () => {
      const atual = createElemento(state.articulacao!.filhos[0]); // Cap
      state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
      state = elementoReducer(state, { type: UNDO });
      expect(state.revisoes?.length).to.be.equal(0);
    });
  });

  describe('Testando inclusão de agrupador em modo de revisão e fazendo UNDO', () => {
    it('Deveria possuir 1 revisão', () => {
      const atual = createElemento(state.articulacao!.filhos[0]); // Cap
      state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: REDO });
      expect(state.revisoes?.length).to.be.equal(1);
    });
  });

  describe('Testando inclusão de agrupador em modo de revisão e rejeitando a inclusão', () => {
    it('Deveria não possuir revisão', () => {
      const atual = createElemento(state.articulacao!.filhos[0]); // Cap
      state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      expect(state.revisoes?.length).to.be.equal(0);
    });
  });

  describe('Testando inclusão de agrupador em modo de revisão, rejeitando a inclusão e fazendo UNDO', () => {
    beforeEach(function () {
      const atual = createElemento(state.articulacao!.filhos[0]); // Cap
      state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria possuir 1 revisão', () => {
      expect(state.revisoes?.length).to.be.equal(1);
    });

    it('Dispositivo capítulo 1 deveria não ter filhos', () => {
      expect(state.articulacao!.filhos[0].id).to.be.equal('cap1');
      expect(state.articulacao!.filhos[0].filhos.length).to.be.equal(0);
    });

    it('Dispositivo capítulo adicionado deveria possuir 18 filhos', () => {
      expect(state.articulacao!.filhos[1].id).to.be.equal('cap1-1');
      expect(state.articulacao!.filhos[1].filhos.length).to.be.equal(18);
    });
  });

  describe('Testando inclusão de agrupador em modo de revisão, rejeitando a inclusão, fazendo UNDO e fazendo REDO', () => {
    beforeEach(function () {
      const atual = createElemento(state.articulacao!.filhos[0]); // Cap
      state = elementoReducer(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: REDO });
    });

    it('Deveria possuir não revisão', () => {
      expect(state.revisoes?.length).to.be.equal(0);
    });

    it('Dispositivo capítulo 1 deveria possuir 18 filhos', () => {
      expect(state.articulacao!.filhos[0].id).to.be.equal('cap1');
      expect(state.articulacao!.filhos[0].filhos.length).to.be.equal(18);
    });

    it('Dispositivo capítulo adicionado não deveria existir', () => {
      const d = buscaDispositivoById(state.articulacao!, 'cap1-1');
      expect(d).to.be.undefined;
    });
  });
});
