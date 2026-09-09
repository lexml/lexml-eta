import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
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
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Adicionando dispositivo fora de revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
      e.conteudo!.texto = 'texto inciso novo;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir novo inciso', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      expect(d).not.to.be.undefined;
      expect(d.texto).to.be.equal('texto inciso novo;');
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
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto inciso novo modificado;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('texto inciso novo;');
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
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        e.conteudo!.texto = 'texto inciso novo;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });
    });

    describe('Adicionando 2 dispositivos (pai e filho)', () => {
      beforeEach(function () {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        let e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        e.conteudo!.texto = 'texto inciso novo A:';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Alinea' } });
        e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!);
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
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        e.conteudo!.texto = 'texto inciso novo A;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

        // Adiciona novo inciso logo após o inciso 1, o que renumera o inciso anterior e altera o respectivo lexmlId
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e2 = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        e2.conteudo!.texto = 'texto inciso novo B;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e2 });
      });

      it('Deveria possuir duas revisões', () => {
        expect(state.revisoes?.length).to.be.equal(2);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
        expect((state.revisoes![1] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });

      it('Deveria possuir o elementoAposRevisao da revisão 1 apontando para o inciso de texto "A"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!;
        expect(d.texto).to.be.equal('texto inciso novo A;');
        expect((state.revisoes![0] as RevisaoElemento).elementoAposRevisao?.uuid).to.be.equal(d.uuid);
      });

      it('Deveria possuir o elementoAposRevisao da revisão 2 apontando para o inciso de texto "B"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
        expect(d.texto).to.be.equal('texto inciso novo B;');
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

        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
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

        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!);
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
        expect(state.revisoes?.length).to.be.equal(0);

        state = elementoReducer(state, { type: UNDO });
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });
    });
  });
});
