import { State, StateType } from '../../../src/redux/state';
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
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { APLICAR_ALTERACOES_EMENDA } from '../../../src/model/lexml/acao/aplicarAlteracoesEmenda';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { EMENDA_006 } from '../../doc/emendas/emenda-006';
import { EMENDA_007 } from '../../doc/emendas/emenda-007';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Abrindo emenda com revisão de exclusão do inciso "I-2 - Teste D:", aceitando a revisão e fazendo UNDO do aceite', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_007.componentes[0].dispositivos, revisoes: EMENDA_007.revisoes });
      state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: state.revisoes![0] });
      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    it('Deveria possuir 3 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(3);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });

    describe('Testando articulação', () => {
      it('Deveria possuir atual inciso "art1_par1u_inc1-2" com texto "teste G:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(d.texto).to.be.equal('teste G:');
      });
    });

    describe('Testando eventos', () => {
      it('"State.ui.events" deveria possuir evento ElementoIncluido com 3 elementos', () => {
        expect(state.ui?.events[1].stateType).to.be.equal(StateType.ElementoIncluido);
        expect(state.ui?.events[1].elementos?.length).to.be.equal(3);
        expect(state.ui?.events[1].elementos![0].conteudo?.texto).to.be.equal('teste D:');
        expect(state.ui?.events[1].elementos![1].conteudo?.texto).to.be.equal('teste E;');
        expect(state.ui?.events[1].elementos![2].conteudo?.texto).to.be.equal('teste F;');
      });

      it('Atributo "state.ui.events[1].elementos[0].elementoAnteriorNaSequenciaDeLeitura" deveria apontar para alíne com texto "teste C;" (*)', () => {
        expect(state.ui?.events[1].elementos![0].elementoAnteriorNaSequenciaDeLeitura?.conteudo?.texto).to.be.equal('teste C;');
      });
    });

    describe('Removendo atual inciso "art1_par1u_inc1-2"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
      });

      it('"State.ui.mensagem" deveria ser "undefined"', () => {
        expect(state.ui?.message).to.be.undefined;
      });

      it('Deveria possuir 6 revisões sendo 2 principais', () => {
        expect(state.revisoes?.length).to.be.equal(6);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
      });
    });
  });

  describe('Removendo dispositivo em modo de revisão, aceitando a revisão e fazendo UNDO do aceite', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_006.componentes[0].dispositivos });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
      state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

      state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: state.revisoes![0] });

      state = elementoReducer(state, { type: UNDO });
    });

    it('Deveria possuir 3 revisões sendo 1 principal', () => {
      expect(state.revisoes?.length).to.be.equal(3);
      expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
    });

    describe('Testando articulação', () => {
      it('Deveria possuir atual inciso "art1_par1u_inc1-2" com texto "teste G:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(d.texto).to.be.equal('teste G:');
      });
    });

    describe('Testando eventos', () => {
      it('"State.ui.events" deveria possuir evento ElementoIncluido com 3 elementos', () => {
        expect(state.ui?.events[1].stateType).to.be.equal(StateType.ElementoIncluido);
        expect(state.ui?.events[1].elementos?.length).to.be.equal(3);
        expect(state.ui?.events[1].elementos![0].conteudo?.texto).to.be.equal('teste D:');
        expect(state.ui?.events[1].elementos![1].conteudo?.texto).to.be.equal('teste E;');
        expect(state.ui?.events[1].elementos![2].conteudo?.texto).to.be.equal('teste F;');
      });

      it('Atributo "state.ui.events[1].elementos[0].elementoAnteriorNaSequenciaDeLeitura" deveria apontar para alíne com texto "teste C;" (**)', () => {
        expect(state.ui?.events[1].elementos![0].elementoAnteriorNaSequenciaDeLeitura?.conteudo?.texto).to.be.equal('teste C;');
      });
    });

    describe('Removendo atual inciso "art1_par1u_inc1-2"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
      });

      it('"State.ui.mensagem" deveria ser "undefined"', () => {
        expect(state.ui?.message).to.be.undefined;
      });

      it('Deveria possuir 6 revisões sendo 2 principais', () => {
        expect(state.revisoes?.length).to.be.equal(6);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
      });
    });
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

      describe('Removendo dispositivo', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          const e = createElemento(d);
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).to.be.undefined;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(e.descricaoSituacao);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(e.conteudo?.texto);
        });
      });

      describe('Removendo dispositivo e fazendo UNDO da exclusão', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          const e = createElemento(d);
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).to.be.undefined;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(e.descricaoSituacao);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(e.conteudo?.texto);

          state = elementoReducer(state, { type: UNDO });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).not.to.be.undefined;
          expect(isAdicionado(d)).to.be.true;
          expect(d.texto).to.be.equal('texto inciso 1-1;');
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Removendo dispositivo, fazendo UNDO e REDO da exclusão', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          const e = createElemento(d);
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).to.be.undefined;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(e.descricaoSituacao);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(e.conteudo?.texto);

          state = elementoReducer(state, { type: UNDO });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).not.to.be.undefined;
          expect(isAdicionado(d)).to.be.true;
          expect(d.texto).to.be.equal('texto inciso 1-1;');
          expect(state.revisoes?.length).to.be.equal(0);

          state = elementoReducer(state, { type: REDO });
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d).to.be.undefined;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(e.descricaoSituacao);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(e.conteudo?.texto);
        });
      });
    });

    describe('Adicionando outro inciso fora de revisão', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!);
        e.conteudo!.texto = 'texto inciso 1-2;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir outro novo inciso', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(d).not.to.be.undefined;
        expect(d.texto).to.be.equal('texto inciso 1-2;');
      });

      describe('Ativa revisão', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
        });

        it('Deveria estar em revisão', () => {
          expect(state.emRevisao).to.be.true;
        });

        describe('Removendo dispositivo', () => {
          it('Deveria possuir uma revisão', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            const e = createElemento(d);
            state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
            expect(state.revisoes?.length).to.be.equal(1);
            expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(e.descricaoSituacao);
            expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(e.conteudo?.texto);
          });
        });
      });
    });
  });
});
