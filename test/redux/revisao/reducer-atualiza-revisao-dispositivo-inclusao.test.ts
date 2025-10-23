import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, isAdicionado } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Adicionando dispositivo fora de revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
      e.conteudo!.texto = 'texto inciso 1-1;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir novo inciso', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(d).not.to.be.undefined;
      expect(d.texto).to.be.equal('texto inciso 1-1;');
    });

    describe('Ativa revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Modificando texto do dispositivo adicionado', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto inciso 1-1 modificado;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(isAdicionado(d)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso 1-1;');
        });
      });
    });
  });

  describe('Adicionando dispositivo em revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Adicionando, em modo de revisão, parágrafo em dispositivo de alteração de norma', () => {
      beforeEach(function () {
        let d = buscaDispositivoById(state.articulacao!, 'art50_cpt_alt1_art15')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Paragrafo' } });

        d = buscaDispositivoById(state.articulacao!, 'art50_cpt_alt1_art15')!;
        const e = createElemento(d.filhos[3]);
        e.conteudo!.texto = 'Texto novo parágrafo.';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir novo parágrafo', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art50_cpt_alt1_art15')!;
        expect(d.filhos.length).to.be.equal(4);
        expect(d.filhos[3].tipo).to.be.equal('Paragrafo');
        expect(d.filhos[3].id).to.be.equal(`art50_cpt_alt1_art15_par[sn:${d.filhos[3].uuid}]`);
        expect(d.filhos[3].texto).to.be.equal('Texto novo parágrafo.');
      });

      it('Deveria possuir 1 revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
      });
    });

    describe('Adicionando dispositivo', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        e.conteudo!.texto = 'texto inciso 1-1;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });
    });

    describe('Adicionando 2 dispositivos (pai e filho)', () => {
      beforeEach(function () {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        let e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        e.conteudo!.texto = 'texto inciso novo A:';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Alinea' } });
        e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!);
        e.conteudo!.texto = 'texto alínea A;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir 2 revisões, sendo 1 principal', () => {
        expect(state.revisoes?.length).to.be.equal(2);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });
    });

    describe('Adicionando 2 dispositivos', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        e.conteudo!.texto = 'texto inciso novo A;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        // Adiciona novo inciso antes do inciso anterior, o que provoca a renumeração do inciso anterior e alteração do respectivo lexmlId
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e2 = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        e2.conteudo!.texto = 'texto inciso novo B;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e2 });
      });

      it('Deveria possuir duas revisões', () => {
        expect(state.revisoes?.length).to.be.equal(2);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
        expect((state.revisoes![1] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });

      it('Deveria possuir o lexmlId do elementoAposRevisao da revisão 1 igual ao id do dispositivo "art1_par1u_inc1-2"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect((state.revisoes![0] as RevisaoElemento).elementoAposRevisao?.uuid).to.be.equal(d.uuid);
        // expect((state.revisoes![0] as RevisaoElemento).elementoAposRevisao?.lexmlId).to.be.equal(d.id);
      });

      it('Deveria possuir o lexmlId do elementoAposRevisao da revisão 2 igual ao id do dispositivo "art1_par1u_inc1-1"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        expect((state.revisoes![1] as RevisaoElemento).elementoAposRevisao?.uuid).to.be.equal(d.uuid);
        expect((state.revisoes![1] as RevisaoElemento).elementoAposRevisao?.lexmlId).to.be.equal(d.id);
      });
    });

    describe('Adicionando e removendo dispositivo', () => {
      it('Deveria não possuir revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;

        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Adicionando e fazendo UNDO da inclusão', () => {
      it('Deveria não possuir revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;

        state = elementoReducer(state, { type: UNDO });
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Adicionando, removendo e fazendo UNDO da exclusão', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;

        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
        expect(state.revisoes?.length).to.be.equal(0);

        state = elementoReducer(state, { type: UNDO });
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });
    });
  });
});
