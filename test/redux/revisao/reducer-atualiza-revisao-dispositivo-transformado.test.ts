import { isRevisaoPrincipal } from './../../../src/redux/elemento/util/revisaoUtil';
import { transformarAlineaEmIncisoParagrafo, transformarIncisoParagrafoEmAlinea } from '../../../src/model/lexml/acao/transformarElementoAction';
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
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
  });

  describe('Transformando inciso adicionado fora de revisão em alínea', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
      e.conteudo!.texto = 'texto teste;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir novo inciso', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(d).not.to.be.undefined;
      expect(d.texto).to.be.equal('texto teste;');
    });

    describe('Ativa revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Transformando inciso adicionado em alínea', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.not.undefined;
        });
      });

      describe('Transformando inciso adicionado em alínea e transformando de volta para inciso', () => {
        it('Deveria não possuir revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1_ali1')!;
          state = elementoReducer(state, transformarAlineaEmIncisoParagrafo.execute(createElemento(d)));
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Transformando inciso adicionado em alínea e fazendo UNDO', () => {
        it('Deveria não possuir revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Transformando inciso adicionado em alínea, fazendo UNDO e fazendo REDO', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(1);
        });
      });
    });
  });

  describe('Transformando dispositivo adicionado em modo de revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Adicionando inciso', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
        const e = createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!);
        e.conteudo!.texto = 'texto teste;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir uma revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });

      describe('Transformando inciso adicionado em alínea', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
        });
      });

      describe('Transformando inciso adicionado em alínea e removendo dispositivo', () => {
        it('Deveria não possuir revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Transformando inciso adicionado em alínea e rejeitando a revisão', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, transformarIncisoParagrafoEmAlinea.execute(createElemento(d)));
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });

        it('Revisão deveria não possuir "elementoAntesRevisao"', () => {
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
        });

        describe('Rejeitando a revisão', () => {
          beforeEach(function () {
            const revisao = state.revisoes![0];
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria não encontrar o inciso adicionado na articulação', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(d).to.be.undefined;
            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1_ali1')!;
            expect(d).to.be.undefined;
          });
        });
      });
    });
  });
});
