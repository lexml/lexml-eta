import { expect } from '@open-wc/testing';
import { redirecionaRemissao } from '../../../src/redux/elemento/reducer/redirecionaRemissao';
import { State, StateType } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';

import { RemissaoInternaValue } from '../../../src/model/remissao';

let state: State;

describe('redirecionaRemissao', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    state.emRevisao = false;
    state.revisoes = [];
  });

  describe('Quando action.uuid é undefined', () => {
    it('deve retorn state com events vazio', () => {
      const result = redirecionaRemissao(state, { uuid: undefined });
      expect(result.ui!.events).to.have.length(0);
    });

    it('deve retorn state com events vazio when action não tem uuid', () => {
      const result = redirecionaRemissao(state, {});
      expect(result.ui!.events).to.have.length(0);
    });
  });

  describe('Quando dispositivo não é encontrado', () => {
    it('deve retorn state com events vazio quando uuid não existe', () => {
      const result = redirecionaRemissao(state, { uuid: 999999 });
      expect(result.ui!.events).to.have.length(0);
    });
  });

  describe('Quando dispositivo é encontrado', () => {
    it('deve emitir eventos RemissaoRedirecionar e ElementoSelecionado', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');

      expect(artigo).to.not.be.undefined;
      const uuid = artigo!.uuid;
      const result = redirecionaRemissao(state, { uuid });

      expect(result.ui!.events).to.have.length(2);
      expect(result.ui!.events[0].stateType).to.equal(StateType.ElementoSelecionado);
      expect(result.ui!.events[1].stateType).to.equal(StateType.RemissaoRedirecionar);
    });

    it('deve redirecionar para o artigo pai quando uuid é de um caput', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo') as Artigo;

      expect(artigo).to.not.be.undefined;
      const caput = artigo.caput!;
      expect(caput).to.not.be.undefined;

      const result = redirecionaRemissao(state, { uuid: caput.uuid });

      // Deve emitir eventos (não retornar vazio)
      expect(result.ui!.events).to.have.length(2);
      // O elemento navegado deve ser o artigo pai (não o caput)
      expect(result.ui!.events[0].elementos![0].uuid).to.equal(artigo.uuid);
    });

    it('deve incluir elemento correto nos eventos', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');
      expect(artigo).to.not.be.undefined;
      const uuid = artigo!.uuid;
      const lexmlId = artigo!.id;
      const result = redirecionaRemissao(state, { uuid });

      expect(result.ui!.events[0].elementos).to.have.length(1);
      expect(result.ui!.events[0].elementos![0].uuid).to.equal(uuid);
      expect(result.ui!.events[0].elementos![0].lexmlId).to.equal(lexmlId);
    });
  });

  describe('Preservação do state', () => {
    it('deve preservar articulação no state retornado', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');
      expect(artigo).to.not.be.undefined;
      const uuid = artigo!.uuid;
      const articulacaoOriginal = state.articulacao;
      const result = redirecionaRemissao(state, { uuid });
      expect(result.articulacao).to.equal(articulacaoOriginal);
    });

    it('deve preservar modo, emRevisao e revisoes', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');
      expect(artigo).to.not.be.undefined;
      const uuid = artigo!.uuid;
      state.modo = 'emenda';
      state.emRevisao = true;
      state.revisoes = [{ id: 'rev1' } as any];
      const result = redirecionaRemissao(state, { uuid });
      expect(result.modo).to.equal('emenda');
      expect(result.emRevisao).to.be.true;
      expect(result.revisoes).to.have.length(1);
    });

    it('deve preservar remissoes in state retornado', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');
      expect(artigo).to.not.be.undefined;
      const uuid = artigo!.uuid;
      const remissoesOriginais: Record<number, RemissaoInternaValue[]> = {};
      state.remissoes = remissoesOriginais;
      const result = redirecionaRemissao(state, { uuid });
      expect(result.remissoes).to.equal(remissoesOriginais);
    });
  });
});
