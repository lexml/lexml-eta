import { expect } from '@open-wc/testing';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { State, StateType } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: State;

describe('adicionaRemissaoInterna', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    state.emRevisao = false;
    state.revisoes = [];
    state.remissoes = {};
  });

  describe('Quando action.atual é undefined', () => {
    it('deve lançar erro ao tentar processar', () => {
      expect(() => adicionaRemissaoInterna(state, { atual: undefined })).to.throw();
    });
  });

  describe('Quando dispositivo não é encontrado', () => {
    it('deve retornar state com events vazio quando uuid não existe', () => {
      const result = adicionaRemissaoInterna(state, { atual: { uuid: 999999 } });
      expect(result.ui!.events).to.have.length(0);
    });
  });

  describe('Quando dispositivo não tem texto', () => {
    it('deve retornar state com events vazio', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const articulacao = dispositivos.find(d => d.tipo === 'Articulacao');
      expect(articulacao).to.not.be.undefined;
      const elemento = createElemento(articulacao!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });
      expect(result.ui!.events).to.have.length(0);
    });
  });

  describe('Quando texto não contém referências', () => {
    it('deve retornar state com events vazio', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo = dispositivos.find(d => d.tipo === 'Artigo');
      expect(artigo).to.not.be.undefined;

      // Modificar texto para não conter referências
      artigo!.texto = 'Texto sem referências';

      const elemento = createElemento(artigo!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });
      expect(result.ui!.events).to.have.length(0);
    });
  });

  describe('Quando texto contém referência válida', () => {
    it('deve emitir evento AtualizaRemissaoInterna', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
      const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');

      expect(artigo1).to.not.be.undefined;
      expect(artigo2).to.not.be.undefined;

      // Adicionar referência ao art. 2 no texto do art. 1
      artigo1!.texto = 'Este dispositivo refere-se ao art. 2º.';

      const elemento = createElemento(artigo1!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });

      expect(result.ui!.events).to.have.length(1);
      expect(result.ui!.events[0].stateType).to.equal(StateType.AtualizaRemissaoInterna);
    });

    it('deve adicionar remissão ao registry', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
      const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');

      expect(artigo1).to.not.be.undefined;
      expect(artigo2).to.not.be.undefined;

      // Adicionar referência ao art. 2 no texto do art. 1
      artigo1!.texto = 'Este dispositivo refere-se ao art. 2º.';

      const elemento = createElemento(artigo1!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });

      const remissoesArtigo1 = (result.remissoes as any)[artigo1!.uuid!];
      expect(remissoesArtigo1).to.not.be.undefined;
      expect(remissoesArtigo1).to.have.length(1);
      expect(remissoesArtigo1[0].targetLexmlId).to.equal(artigo2!.id);
      expect(remissoesArtigo1[0].sourceUuid).to.equal(artigo1!.uuid);
      expect(remissoesArtigo1[0].textoRef).to.include('art. 2');
    });
  });

  describe('Quando texto contém múltiplas referências válidas', () => {
    it('deve adicionar todas as remissões ao registry', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
      dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '3');
      dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');

      expect(artigo1).to.not.be.undefined;

      // Adicionar referências múltiplas
      artigo1!.texto = 'Refere-se ao art. 2º e também ao art. 3º.';

      const elemento = createElemento(artigo1!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });

      const remissoesArtigo1 = (result.remissoes as any)[artigo1!.uuid!];
      expect(remissoesArtigo1).to.not.be.undefined;
      expect(remissoesArtigo1).to.have.length(2);
    });
  });

  describe('Quando texto contém referência a artigo e parágrafo', () => {
    it('deve encontrar o parágrafo correspondente', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo2 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '2');
      dispositivos.find(d => d.tipo === 'Paragrafo' && d.pai?.uuid === artigo2?.uuid);

      expect(artigo2).to.not.be.undefined;

      // Referência ao § 1º do art. 2 - busca pelo artigo primeiro
      artigo2!.texto = 'Refere-se ao art. 2º § 1º.';

      const elemento = createElemento(artigo2!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });

      // Verifica se o evento foi emitido
      expect(result.ui!.events).to.have.length(1);
    });
  });

  describe('Quando referência não existe no documento', () => {
    it('não deve criar remissão para referência inexistente', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');

      expect(artigo1).to.not.be.undefined;

      // Referência a artigo inexistente
      artigo1!.texto = 'Refere-se ao art. 999.';

      const elemento = createElemento(artigo1!, true);
      const result = adicionaRemissaoInterna(state, { atual: elemento });

      expect(result.ui!.events).to.have.length(0);
      expect((result.remissoes as any)[artigo1!.uuid!]).to.be.undefined;
    });
  });

  describe('Preservação do state', () => {
    it('deve preservar articulação no state retornado', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
      expect(artigo1).to.not.be.undefined;

      artigo1!.texto = 'Refere-se ao art. 2º.';

      const elemento = createElemento(artigo1!, true);
      const articulacaoOriginal = state.articulacao;
      const result = adicionaRemissaoInterna(state, { atual: elemento });
      expect(result.articulacao).to.equal(articulacaoOriginal);
    });

    it('deve preservar modo, emRevisao e revisoes', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!);
      const artigo1 = dispositivos.find(d => d.tipo === 'Artigo' && d.numero === '1');
      expect(artigo1).to.not.be.undefined;

      artigo1!.texto = 'Refere-se ao art. 2º.';

      const elemento = createElemento(artigo1!, true);
      state.modo = 'emenda';
      state.emRevisao = true;
      state.revisoes = [{ id: 'rev1' } as any];
      const result = adicionaRemissaoInterna(state, { atual: elemento });
      expect(result.modo).to.equal('emenda');
      expect(result.emRevisao).to.be.true;
      expect(result.revisoes).to.have.length(1);
    });
  });
});
