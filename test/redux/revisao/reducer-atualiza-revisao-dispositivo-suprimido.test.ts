import { findRevisaoByElementoLexmlId } from './../../../src/redux/elemento/util/revisaoUtil';
import { getDispositivoAndFilhosAsLista } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, isModificado, isOriginal, isSuprimido } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { SUPRIMIR_ELEMENTO } from '../../../src/model/lexml/acao/suprimirElemento';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { RESTAURAR_ELEMENTO } from '../../../src/model/lexml/acao/restaurarElemento';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { DescricaoSituacao } from '../../../src/model/dispositivo/situacao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Ativando modo de revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Suprimindo dispositivo com filhos', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art23')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
      });

      it('Deveria possuir Art. 23 e filhos suprimidos', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art23')!;
        expect(isSuprimido(d)).to.be.true;
        expect(getDispositivoAndFilhosAsLista(d).every(isSuprimido)).to.be.true;
      });

      it('Deveria possuir 7 revisões', () => {
        expect(state.revisoes?.length).to.be.equal(7);
      });

      it('Deveria possuir uma revisão sem idRevisaoElementoPai', () => {
        expect(state.revisoes?.filter(r => !(r as RevisaoElemento).idRevisaoElementoPai).length).to.be.equal(1);
      });

      it('Deveria possuir 6 revisões apontando para a revisão sem idRevisaoElementoPai', () => {
        const revisaoPrincipal = state.revisoes?.find(r => !(r as RevisaoElemento).idRevisaoElementoPai);
        expect(state.revisoes?.filter(r => (r as RevisaoElemento).idRevisaoElementoPrincipal === revisaoPrincipal?.id).length).to.be.equal(6);
      });

      it('Deveria possuir revisão do elemento "art23_cpt_inc2_ali1" com atributo idRevisaoElementoPai apontando para a revisão do elemento "art23_cpt_inc2"', () => {
        const revisaoArtigo = findRevisaoByElementoLexmlId(state.revisoes!, 'art23')!;
        const revisaoInciso = findRevisaoByElementoLexmlId(state.revisoes!, 'art23_cpt_inc2')!;
        const revisaoAlinea = findRevisaoByElementoLexmlId(state.revisoes!, 'art23_cpt_inc2_ali1')!;
        expect(revisaoInciso.idRevisaoElementoPai).to.be.equal(revisaoArtigo.id);
        expect(revisaoAlinea.idRevisaoElementoPai).to.be.equal(revisaoInciso.id);
        expect(revisaoAlinea.idRevisaoElementoPrincipal).to.be.equal(revisaoArtigo.id);
      });
    });

    describe('Suprimindo dispositivo', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(1);
      });
    });

    describe('Suprimindo e restaurando dispositivo', () => {
      it('Deveria não possuir revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Suprimindo, restaurando e desfazendo restauração', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
        state = elementoReducer(state, { type: UNDO });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(1);
      });
    });

    describe('Suprimindo, restaurando, desfazendo restauração e refazendo restauração', () => {
      it('Deveria não possuir revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: REDO });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Suprimindo dispositivo com filhos', () => {
      it('Deveria possuir 5 revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(5);
      });
    });

    describe('Suprimindo dispositivo com filhos e fazendo UNDO', () => {
      it('Deveria não possuir revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(5);

        state = elementoReducer(state, { type: UNDO });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Suprimindo dispositivo com filhos, fazendo UNDO e fazendo REDO', () => {
      it('Deveria possuir 5 revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(5);

        state = elementoReducer(state, { type: UNDO });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);

        state = elementoReducer(state, { type: REDO });
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!)).to.be.true;
        expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc4')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(5);
      });
    });
  });

  describe('Suprimindo dispositivo fora de revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
    });

    it('Deveria possuir inciso I, do Parágrafo único, do Art. 1º suprimido', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(isSuprimido(d)).to.be.true;
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Testando UNDO da supressão', () => {
        it('Deveria não possuir revisões', () => {
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Restaurando dispositivo suprimido', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
        });
      });

      describe('Restaurando e modificando dispositivo "suprimido"', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const eSuprimido = createElemento(d);
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: eSuprimido });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isModificado(d)).to.be.true;
          expect(d.texto).to.be.equal('Texto modificado');

          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(DescricaoSituacao.DISPOSITIVO_SUPRIMIDO);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(eSuprimido.conteudo?.texto);
        });
      });

      describe('Restaurando e suprimindo (novamente) o dispositivo', () => {
        it('Deveria não possuir revisões', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
          expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Restaurando e fazendo UNDO da restauração', () => {
        it('Deveria não possuir revisões', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          state = elementoReducer(state, { type: UNDO });
          expect(isSuprimido(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Restaurando, fazendo UNDO e REDO da restauração', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
        });
      });
    });
  });
});
