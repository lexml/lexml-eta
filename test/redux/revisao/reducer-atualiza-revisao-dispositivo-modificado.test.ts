import { State } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { buscaDispositivoById, isAdicionado, isModificado, isOriginal, isSuprimido } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { RESTAURAR_ELEMENTO } from '../../../src/model/lexml/acao/restaurarElemento';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { DescricaoSituacao } from '../../../src/model/dispositivo/situacao';
import { SUPRIMIR_ELEMENTO } from '../../../src/model/lexml/acao/suprimirElemento';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
  });

  describe('Alterando texto fora do modo de revisão, ativando revisão, restaurando texto', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: e });
    });

    it('Deveria possuir 1 revisão', () => {
      expect(state.revisoes?.length).to.be.equal(1);
    });

    it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "menor aprendiz;"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('menor aprendiz;');
    });

    describe('Rejeitando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      });

      it('Deveria não possuir revisão', () => {
        expect(state.revisoes?.length).to.be.equal(0);
      });

      it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        expect(d.texto).to.be.equal('texto modificado;');
      });

      describe('Fazendo UNDO da rejeição', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: UNDO });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "menor aprendiz;"', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('menor aprendiz;');
          expect(isOriginal(d)).to.be.true;
        });

        describe('Fazendo REDO da rejeição', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REDO });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('texto modificado;');
          });
        });
      });
    });
  });

  describe('Testando rejeição de modificação de dispositivo com texto alterado antes da revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'texto modificado;'; // antes era "menor aprendiz;"
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado"', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(d.texto).to.be.equal('texto modificado;');
    });

    describe('Ativando modo de revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Modificando texto do inciso "art1_par1u_inc1"', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto modificado 2;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        describe('Rejeitando revisão de modificação do inciso "art1_par1u_inc1"', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
          });

          it('Deveria não possuir revisões', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar inciso "art1_par1u_inc1" com o texto "texto modificado;"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('texto modificado;');
          });

          it('"State.ui.events" deveria possuir evento "ElementoModificado" com texto "texto modificado;"', () => {
            expect(state.ui?.events[1].elementos![0].conteudo?.texto).to.be.equal('texto modificado;');
          });
        });
      });
    });
  });

  describe('Ativando modo de revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Modificando texto do dispositivo', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).not.to.be.equal(e.conteudo!.texto);
      });
    });

    describe('Modificando texto do dispositivo e "redigitando" texto original', () => {
      it('Deveria não possuir revisões', () => {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const textoOriginal = d.texto;
        let e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        e = createElemento(d);
        e.conteudo!.texto = textoOriginal;
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Modificando e restaurando dispositivo', () => {
      it('Deveria não possuir revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: e });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });

    describe('Modificando, restaurando e desfazendo restauração', () => {
      it('Deveria possuir uma revisão', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: UNDO });
        expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(1);
      });
    });

    describe('Modificando, restaurando, desfazendo restauração e refazendo restauração', () => {
      it('Deveria não possuir revisões', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: UNDO });
        state = elementoReducer(state, { type: REDO });
        expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
        expect(state.revisoes?.length).to.be.equal(0);
      });
    });
  });

  describe('Modificando dispositivo fora de revisão', () => {
    beforeEach(function () {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const e = createElemento(d);
      e.conteudo!.texto = 'Texto modificado';
      state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
    });

    it('Deveria possuir inciso I, do Parágrafo único, do Art. 1º modificado', () => {
      const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      expect(isModificado(d)).to.be.true;
      expect(d.texto).to.be.equal('Texto modificado');
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Testando UNDO da modificação', () => {
        it('Deveria não possuir revisões', () => {
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });

      describe('Restaurando e suprimindo dispositivo "modificado"', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const eModificado = createElemento(d);
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: eModificado });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(DescricaoSituacao.DISPOSITIVO_MODIFICADO);

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: e });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
          expect(d.texto).to.be.equal(e.conteudo?.texto);

          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.descricaoSituacao).to.be.equal(DescricaoSituacao.DISPOSITIVO_MODIFICADO);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal(eModificado.conteudo?.texto);
        });
      });

      describe('Nova alteração no texto do dispositivo', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado novamente';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
        });
      });

      describe('Nova alteração no texto do dispositivo e Restauração para texto original', () => {
        it('Deveria possuir uma revisão', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado novamente';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: e });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
        });
      });

      describe('Restaurando dispositivo modificado', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          expect(isOriginal(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).not.to.be.equal('Texto modificado');
        });
      });

      describe('Restaurando e modificando (mesmo texto) o dispositivo', () => {
        it('Deveria não possuir revisões', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(0);
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('Texto modificado');
        });
      });

      describe('Restaurando e modificando (texto diferente) o dispositivo', () => {
        it('Deveria possuir uma revisão', () => {
          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          const e = createElemento(d);
          e.conteudo!.texto = 'Texto modificado diferente';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
          expect(state.revisoes?.length).to.be.equal(1);
          expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto).to.be.equal('Texto modificado');
          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('Texto modificado diferente');
        });
      });

      describe('Restaurando e fazendo UNDO da restauração', () => {
        it('Deveria não possuir revisões', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: RESTAURAR_ELEMENTO, atual: createElemento(d) });
          state = elementoReducer(state, { type: UNDO });
          expect(isModificado(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!)).to.be.true;
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

    describe('Modificando texto de dispositivo adicionado fora de revisão', () => {
      describe('Adicionando dispositivo', () => {
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
    });
  });
});
