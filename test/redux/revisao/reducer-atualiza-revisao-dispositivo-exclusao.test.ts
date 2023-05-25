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
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
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
  });
});
