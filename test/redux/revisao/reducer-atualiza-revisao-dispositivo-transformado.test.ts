import { isRevisaoDeTransformacao, isRevisaoPrincipal } from './../../../src/redux/elemento/util/revisaoUtil';
import {
  transformarAlineaEmIncisoParagrafo,
  transformarIncisoParagrafoEmAlinea,
  transformarIncisoParagrafoEmParagrafo,
} from '../../../src/model/lexml/acao/transformarElementoAction';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista, isAdicionado, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { isArticulacao, isInciso, isParagrafo } from '../../../src/model/dispositivo/tipo';

let state: State;

describe('MPV 1234/2024 - Testando revisões de transformações de dispositivos', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1234_2024, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
  });

  describe('Adiciona parágrafo com inciso - preparando cenário para testes', () => {
    beforeEach(function () {
      let d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4')!;

      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d.filhos[1]), novo: { tipo: 'Paragrafo' } });
      d = d.filhos![2]; // Parágrafo adicionado
      let e = createElemento(d);
      state = elementoReducer(state, { type: RENUMERAR_ELEMENTO, atual: e, novo: { numero: '4-A' } });
      e.conteudo!.texto = 'Parágrafo A:';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

      state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      d = d.filhos![0]; // Inciso adicionado
      e = createElemento(d);
      e.conteudo!.texto = 'dispositivo novo.';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir parágrafo com inciso', () => {
      let d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4_par4-1')!;
      expect(d).not.to.be.undefined;
      expect(isAdicionado(d)).to.be.true;
      expect(isDispositivoAlteracao(d)).to.be.true;
      expect(isParagrafo(d)).to.be.true;
      expect(d.texto).to.be.equal('Parágrafo A:');
      expect(d.filhos).to.have.length(1);

      d = d.filhos![0];
      expect(d).not.to.be.undefined;
      expect(isAdicionado(d)).to.be.true;
      expect(isDispositivoAlteracao(d)).to.be.true;
      expect(d.tipo).to.be.equal('Inciso');
      expect(d.texto).to.be.equal('dispositivo novo.');
    });

    describe('Ativa revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Transformando inciso em parágrafo', () => {
        beforeEach(function () {
          let d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art4_par4-1')!;
          d = d.filhos![0];
          state = elementoReducer(state, transformarIncisoParagrafoEmParagrafo.execute(createElemento(d)));
        });

        it('Deveria possuir uma revisão de transformação', () => {
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.not.undefined;
          expect(isRevisaoDeTransformacao(state.revisoes![0])).to.be.true;
        });

        it('Deveria possuir 2 parágrafos adicionados na articulação', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => !isArticulacao(d) && isAdicionado(d));
          expect(dispositivos.length).to.be.equal(2);
          expect(dispositivos.every(d => isParagrafo(d))).to.be.true;
        });

        describe('Rejeitando a revisão', () => {
          beforeEach(function () {
            const revisao = state.revisoes![0];
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria possuir 1 parágrafo e 1 inciso adicionados na articulação', () => {
            const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => !isArticulacao(d) && isAdicionado(d));
            expect(dispositivos.length).to.be.equal(2);

            expect(isParagrafo(dispositivos[0])).to.be.true;
            expect(isInciso(dispositivos[1])).to.be.true;
          });
        });
      });
    });
  });
});

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
