import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { AGRUPAR_ELEMENTO, REMOVER_ELEMENTO } from '../../../src/redux/elemento/action/elementoAction';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { agrupaElemento } from '../../../src/redux/elemento/reducer/agrupaElemento';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
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
      const artigo = state.articulacao.artigos[1];
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: state.articulacao.filhos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
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
      it('Deveria apresentar o capitulo incluído após o Artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o capítulo, os 4 artigos e seus filhos como removidos', () => {
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
  describe('Testando a exclusão de agrupador sem agrupador anterior mas com agrupador posterior que não possui agrupadores filho', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[1];
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
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
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: state.articulacao.filhos[1].uuid },
        novo: {
          tipo: TipoDispositivo.capitulo.tipo,
        },
      });
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
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar os 4 artigos e seus filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(3);
        expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 3º');
        expect(eventos[0].elementos![2].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o capitulo incluído após o Artigo 1', () => {
        expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
        expect(eventos[0].referencia!.rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o capítulo e seus 3 artigos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(4);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO I');
        expect(removidos.elementos![1].rotulo).equal('Art. 2º');
        expect(removidos.elementos![2].rotulo).equal('Art. 3º');
        expect(removidos.elementos![3].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar o antigo capítulo II como renumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('CAPÍTULO I');
      });
    });
  });
  describe('Testando a exclusão de agrupador que possui agrupadores filho e com agrupador anterior sem agrupador filho', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[1];
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
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
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
        novo: {
          tipo: TipoDispositivo.secao.tipo,
        },
      });
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: state.articulacao.filhos[2].uuid },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 e o CAPÍTULO I como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar os artigos 2-4 e a seção do antigo capitulo II como filhos do Capítulo I', () => {
      expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('Art. 2º');
      expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('Art. 3º');
      expect(state.articulacao.filhos[1].filhos[2].rotulo).equal('Art. 4º');
      expect(state.articulacao.filhos[1].filhos[3].rotulo).equal('SEÇÃO I');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar a seção e seus filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(3);
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![2].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar a seção incluída ao final do Capítulo I', () => {
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO I');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO I');
      });
      it('Deveria apresentar o capítulo II e seus 3 artigos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(4);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
        expect(removidos.elementos![1].rotulo).equal('SEÇÃO I');
        expect(removidos.elementos![2].rotulo).equal('Art. 5º');
        expect(removidos.elementos![3].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar o antigo capítulo II como renumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('SEÇÃO I');
      });
    });
  });
  describe('Testando a exclusão de agrupador que possui agrupadores filho e com agrupador anterior com agrupador filho', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[1];
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
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
      state = agrupaElemento(state, {
        type: AGRUPAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: state.articulacao.artigos[4].uuid },
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
      state = removeElemento(state, {
        type: REMOVER_ELEMENTO,
        atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: state.articulacao.filhos[2].uuid },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    it('Deveria apresentar os artigos 1 e o CAPÍTULO I como filhos da articulação', () => {
      expect(state.articulacao.filhos.length).equals(2);
    });
    it('Deveria apresentar as seções como filhos do Capítulo I', () => {
      expect(state.articulacao.filhos[1].filhos[0].rotulo).equal('SEÇÃO I');
      expect(state.articulacao.filhos[1].filhos[1].rotulo).equal('SEÇÃO II');
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar a seção II e seus filhos como incluídos', () => {
        expect(eventos[0].elementos!.length).equal(3);
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO II');
        expect(eventos[0].elementos![1].rotulo).equal('Art. 5º');
        expect(eventos[0].elementos![2].rotulo).equal('Parágrafo único.');
      });
      it('Deveria apresentar a seção incluída ao final do Capítulo I', () => {
        expect(eventos[0].elementos![0].rotulo).equal('SEÇÃO II');
        expect(eventos[0].referencia!.rotulo).equal('CAPÍTULO I');
      });
      it('Deveria apresentar o capítulo II e seus 3 artigos como removidos', () => {
        const removidos = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removidos.elementos!.length).equal(4);
        expect(removidos.elementos![0].rotulo).equal('CAPÍTULO II');
        expect(removidos.elementos![1].rotulo).equal('SEÇÃO I');
        expect(removidos.elementos![2].rotulo).equal('Art. 5º');
        expect(removidos.elementos![3].rotulo).equal('Parágrafo único.');
      });
    });
  });
});
