import { expect } from '@open-wc/testing';
import { APLICAR_ALTERACOES_EMENDA } from '../../../src/model/lexml/acao/aplicarAlteracoesEmenda';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State, StateType } from '../../../src/redux/state';
import { EMENDA_006 } from '../../doc/emendas/emenda-006';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista, isAdicionado, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { isAlinea, isArticulacao, isInciso } from '../../../src/model/dispositivo/tipo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { findRevisaoByElementoUuid, isRevisaoDeExclusao, isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TEXTO_006 } from '../../doc/textos-colar/texto_006';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';

let state: State;

describe('Testando operações sobre a MPV 905/2019, EMENDA 006', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
    state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_006.componentes[0].dispositivos });
  });

  it('Deveria possuir 6 incisos adicionados (de I-1 a I-6), cada um com 2 alíneas', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(f => !isArticulacao(f) && isAdicionado(f));
    expect(dispositivos.length).to.equal(18);
    expect(dispositivos.filter(isInciso).length).to.equal(6);
    expect(dispositivos.filter(isAlinea).length).to.equal(12);
  });

  describe('Ativando revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Movendo inciso "art1_par1u_inc1-1" para baixo, rejeitando revisão', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
        state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: state.revisoes![0] });
      });

      it('Deveria não possuir revisão', () => {
        expect(state.revisoes!.length).to.equal(0);
      });

      describe('Testando articulação', () => {
        it('Deveria apresentar atual inciso "art1_par1u_inc1-1" com texto "teste A:"', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(d.texto).to.be.equal('teste A:');

          expect(d.filhos[0].texto).to.be.equal('teste B;');
          expect(d.filhos[1].texto).to.be.equal('teste C;');

          expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-1_ali1');
          expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-1_ali2');
        });

        it('Deveria apresentar atual inciso "art1_par1u_inc1-2" com texto "teste D:"', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
          expect(d.texto).to.be.equal('teste D:');

          expect(d.filhos[0].texto).to.be.equal('teste E;');
          expect(d.filhos[1].texto).to.be.equal('teste F;');

          expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-2_ali1');
          expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-2_ali2');
        });
      });

      describe('Testando eventos', () => {
        it('"State.ui.events" deveria possuir evento "ElementoRenumerado" contendo inciso "art1_par1u_inc1-2" com texto "teste D:"', () => {
          const eventoRenumeracao = state.ui?.events.find(ev => ev.stateType === 'ElementoRenumerado');
          const elemento = eventoRenumeracao?.elementos?.find(e => e.lexmlId === 'art1_par1u_inc1-2');
          expect(elemento?.rotulo.startsWith('I-2')).to.be.true;
          expect(elemento?.conteudo?.texto).to.equal('teste D:');
        });
      });

      describe('Fazendo UNDO da rejeição', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: UNDO });
        });

        it('Deveria possuir 3 revisões sendo 1 principal', () => {
          expect(state.revisoes!.length).to.equal(3);
          expect(state.revisoes!.filter(isRevisaoPrincipal).length).to.equal(1);
        });

        describe('Testando articulação', () => {
          it('Deveria apresentar atual inciso "art1_par1u_inc1-1" com texto "teste D:"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(d.texto).to.be.equal('teste D:');

            expect(d.filhos[0].texto).to.be.equal('teste E;');
            expect(d.filhos[1].texto).to.be.equal('teste F;');

            expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-1_ali1');
            expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-1_ali2');
          });

          it('Deveria apresentar atual inciso "art1_par1u_inc1-2" com texto "teste A:"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
            expect(d.texto).to.be.equal('teste A:');

            expect(d.filhos[0].texto).to.be.equal('teste B;');
            expect(d.filhos[1].texto).to.be.equal('teste C;');

            expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-2_ali1');
            expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-2_ali2');
          });
        });

        describe('Testando eventos', () => {
          it('"State.ui.events" deveria possuir evento "ElementoRenumerado" contendo inciso "art1_par1u_inc1-1" com texto "teste D:"', () => {
            const eventoRenumeracao = state.ui?.events.find(ev => ev.stateType === 'ElementoRenumerado');
            const elemento = eventoRenumeracao?.elementos?.find(e => e.lexmlId === 'art1_par1u_inc1-1');
            expect(elemento?.rotulo.startsWith('I-1')).to.be.true;
            expect(elemento?.conteudo?.texto).to.equal('teste D:');
          });
        });

        describe('Fazendo REDO da rejeição', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REDO });
          });

          it('Deveria não possuir revisões', () => {
            expect(state.revisoes?.length).to.equal(0);
          });

          describe('Testando articulação', () => {
            it('Deveria apresentar atual inciso "art1_par1u_inc1-1" com texto "teste A:"', () => {
              const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(d.texto).to.be.equal('teste A:');

              expect(d.filhos[0].texto).to.be.equal('teste B;');
              expect(d.filhos[1].texto).to.be.equal('teste C;');

              expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-1_ali1');
              expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-1_ali2');
            });

            it('Deveria apresentar atual inciso "art1_par1u_inc1-2" com texto "teste D:"', () => {
              const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
              expect(d.texto).to.be.equal('teste D:');

              expect(d.filhos[0].texto).to.be.equal('teste E;');
              expect(d.filhos[1].texto).to.be.equal('teste F;');

              expect(d.filhos[0].id).to.be.equal('art1_par1u_inc1-2_ali1');
              expect(d.filhos[1].id).to.be.equal('art1_par1u_inc1-2_ali2');
            });
          });

          describe('Testando eventos', () => {
            it('"State.ui.events" deveria possuir evento "ElementoRenumerado" contendo inciso "art1_par1u_inc1-2" com texto "teste D:"', () => {
              const eventoRenumeracao = state.ui?.events.find(ev => ev.stateType === 'ElementoRenumerado');
              const elemento = eventoRenumeracao?.elementos?.find(e => e.lexmlId === 'art1_par1u_inc1-2');
              expect(elemento?.rotulo.startsWith('I-2')).to.be.true;
              expect(elemento?.conteudo?.texto).to.equal('teste D:');
            });
          });
        });
      });
    });

    describe('Movendo inciso "art1_par1u_inc1-1" para baixo', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
      });

      it('Deveria apresentar inciso "art1_par1u_inc1-2" com texto "teste A:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(d.texto).to.be.equal('teste A:');
      });

      it('Deveria apresentar alínea "art1_par1u_inc1-2_ali2" com texto "teste C;"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2_ali2')!;
        expect(d.texto).to.be.equal('teste C;');
      });

      it('Deveria possuir 3 revisão, sendo 1 principal', () => {
        expect(state.revisoes?.length).to.be.equal(3);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });

      describe('Alterando texto da alínea "art1_par1u_inc1-2_ali2"', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2_ali2')!;
          const e = createElemento(d);
          e.conteudo!.texto = 'texto modificado;';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
        });

        it('Deveria apresentar alínea "art1_par1u_inc1-2_ali2" com texto "texto modificado;"', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2_ali2')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });

        it('Deveria possuir 3 revisões, sendo 1 principal', () => {
          expect(state.revisoes?.length).to.be.equal(3);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });
      });
    });

    describe('Movendo dispositivo "art1_par1u_inc1-1" para baixo, rejeitando revisão, fazendo UNDO da rejeição', () => {
      beforeEach(function () {
        let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });

        d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoUuid(state.revisoes!, d.uuid!)! });

        state = elementoReducer(state, { type: UNDO });
      });

      it('Deveria possuir 3 revisões, sendo 1 principal', () => {
        expect(state.revisoes?.length).to.be.equal(3);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });

      it('State.ui.events deveria possuir evento com StateType.SituacaoElementoModificada (para atualizar e numeração na tela) (*)', () => {
        expect(state.ui?.events.some(ev => ev.stateType === StateType.SituacaoElementoModificada)).to.be.true;
      });

      describe('Fazendo REDO da rejeição', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: REDO });
        });

        it('Deveria não possuir revisão (*)', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });
      });
    });

    describe('Alterando texto do dispositivo "art1_par1u_inc1-1_ali2"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'Texto modificado';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir 1 revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });

      describe('Movendo dispositivo "art1_par1u_inc1-1" para baixo', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
        });

        it('Deveria possuir 3 revisões, sendo 1 principal', () => {
          expect(state.revisoes?.length).to.be.equal(3);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });
      });
    });

    describe('Movendo dispositivo "art1_par1u_inc1-1" para baixo', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d) });
      });

      it('Deveria possuir 3 revisões, sendo 1 principal', () => {
        expect(state.revisoes?.length).to.be.equal(3);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
      });

      it('Atual dispositivo "art1_par1u_inc1-2" deveria possuir texto "teste A:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        expect(d.texto).to.be.equal('teste A:');
        expect(d.filhos[0].texto).to.be.equal('teste B;');
        expect(d.filhos[1].texto).to.be.equal('teste C;');
      });

      it('Atual dispositivo "art1_par1u_inc1-2" deveria possuir 1 revisão principal', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        const revisao = findRevisaoByElementoUuid(state.revisoes, d.uuid!);
        expect(revisao).to.be.exist;
        expect(isRevisaoPrincipal(revisao!)).to.be.true;
      });

      it('Atual dispositivo "art1_par1u_inc1-1" deveria possuir texto "teste D:"', () => {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
        expect(d.texto).to.be.equal('teste D:');
        expect(d.filhos[0].texto).to.be.equal('teste E;');
        expect(d.filhos[1].texto).to.be.equal('teste F;');
      });

      describe('Tentando remover INCISO "art1_par1u_inc1-2"', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria apresentar mensagem de erro', () => {
          expect(state.ui?.message?.descricao).not.to.be.empty;
        });

        it('Deveria possuir 3 revisões, sendo 1 principal', () => {
          expect(state.revisoes?.length).to.be.equal(3);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });
      });

      describe('Remover ALÍNEA "art1_par1u_inc1-2_ali2"', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d.filhos[1]) });
        });

        it('Deveria possuir 4 revisões, sendo 2 principais', () => {
          expect(state.revisoes?.length).to.be.equal(4);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
        });

        it('A função findRevisionByElementoUuid2 deveria retornar a revisão de exclusão da alínea', () => {
          const revisao = state.revisoes![3] as RevisaoElemento;
          expect(revisao).to.be.exist;
          expect(isRevisaoPrincipal(revisao!)).to.be.true;
          expect(isRevisaoDeExclusao(revisao!)).to.be.true;
        });

        describe('Rejeitando revisão de movimentação do dispositivo "art1_par1u_inc1-1"', () => {
          beforeEach(function () {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
            const r = findRevisaoByElementoUuid(state.revisoes, d.uuid);
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: r });
          });

          it('Deveria não possuir revisões (**)', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('O status.ui deveria possuir um evento com stateType igual a "StateType.RevisaoAdicionalRejeitada"', () => {
            expect(state.ui?.events.some(ev => ev.stateType === StateType.RevisaoAdicionalRejeitada)).to.be.true;
            expect(state.ui?.events.find(ev => ev.stateType === StateType.RevisaoAdicionalRejeitada)?.elementos?.length).to.be.equal(1);
          });

          it('Deveria possuir dispositivo "art1_par1u_inc1-1" com 2 filhos', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(d.filhos.length).to.be.equal(2);
            expect(d.texto).to.be.equal('teste A:');
            expect(d.filhos[0].texto).to.be.equal('teste B;');
            expect(d.filhos[1].texto).to.be.equal('teste C;');
          });

          describe('Fazendo UNDO da rejeição', () => {
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 4 revisões, sendo 2 principais', () => {
              expect(state.revisoes?.length).to.be.equal(4);
              expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
            });

            it('Deveria possuir dispositivo "art1_par1u_inc1-2" com 1 filho', () => {
              const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
              expect(d.filhos.length).to.be.equal(1);
              expect(d.texto).to.be.equal('teste A:');
              expect(d.filhos[0].texto).to.be.equal('teste B;');
            });

            describe('Fazendo REDO da rejeição', () => {
              beforeEach(function () {
                state = elementoReducer(state, { type: REDO });
              });

              it('Deveria não possuir revisões (***)', () => {
                expect(state.revisoes?.length).to.be.equal(0);
              });

              it('Deveria possuir dispositivo "art1_par1u_inc1-1" com 2 filhos', () => {
                const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
                expect(d.filhos.length).to.be.equal(2);
                expect(d.texto).to.be.equal('teste A:');
                expect(d.filhos[0].texto).to.be.equal('teste B;');
                expect(d.filhos[1].texto).to.be.equal('teste C;');
              });
            });
          });
        });
      });
    });

    describe('Remover I-3 (original), remover I-4 (original), adicionar novo inciso (com alíneas) após I-2 (original), aceitar exclusão de I-3 (original)', () => {
      beforeEach(function () {
        // Remove I-3 (original)
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!) });

        // Remove I-4 (original)
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!) });

        // Adiciona novo inciso (com alíneas) após I-2 (original)
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
        state = elementoReducer(state, {
          type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
          atual: createElemento(d),
          novo: {
            isDispositivoAlteracao: isDispositivoAlteracao(d),
            conteudo: {
              texto: TEXTO_006,
            },
          },
          isColarSubstituindo: false,
          posicao: 'depois',
        });

        // Aceita exclusão de I-3 (original)
        state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: state.revisoes![0] });
      });

      it('Deveria possuir 6 revisões, sendo 2 principais', () => {
        expect(state.revisoes?.length).to.equal(6);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(2);
      });

      it('O atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" da revisão de exclusão do inciso I-4 original, deveria apontar para a alínea B do novo inciso I-3 (que possui texto "texto nova alínea b;")', () => {
        const revisaoPrincipal = state.revisoes![0] as RevisaoElemento;
        expect(revisaoPrincipal).to.not.be.undefined;
        const elementoAnterior = revisaoPrincipal!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
        expect(elementoAnterior.conteudo?.texto).to.equal('texto nova alínea b;');

        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3_ali2')!;
        expect(elementoAnterior.uuid2).to.equal(d.uuid2);
      });

      describe('Fazendo UNDO da aceitação da exclusão', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: UNDO });
        });

        it('Deveria possuir 9 revisões, sendo 3 principais', () => {
          expect(state.revisoes?.length).to.equal(9);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(3);
        });

        it('O atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" da revisão de exclusão do inciso I-4 original, deveria apontar para a alínea B do inciso I-3 original (que possui texto "teste I;")', () => {
          const revisaoPrincipal = state.revisoes![0] as RevisaoElemento;
          expect(revisaoPrincipal).to.not.be.undefined;
          const elementoAnterior = revisaoPrincipal!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
          expect(elementoAnterior.conteudo?.texto).to.equal('teste I;');
        });

        describe('Aceitando exclusão de I-4 (original) e fazendo UNDO', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: state.revisoes![0] });
            state = elementoReducer(state, { type: UNDO });
          });

          it('Deveria possuir 9 revisões, sendo 3 principais', () => {
            expect(state.revisoes?.length).to.equal(9);
            expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(3);
          });
        });
      });
    });

    describe('Removendo inciso I-3', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
      });

      it('Deveria possuir state.ui.events com evento "ElementoRemovido" e primeiro elemento do array "elementos" apontando para dispositivo com texto "teste G:"', () => {
        const removidos = state.ui?.events?.find(ev => ev.stateType === StateType.ElementoRemovido)?.elementos;
        const primeiroRemovido = removidos?.[0];
        expect(primeiroRemovido).to.be.exist;
        expect(primeiroRemovido?.conteudo?.texto).to.equal('teste G:');
      });

      it('Deveria possuir 5 incisos adicionados, cada um com 2 alíneas', () => {
        const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(f => !isArticulacao(f) && isAdicionado(f));
        expect(dispositivos.length).to.equal(15);
        expect(dispositivos.filter(isInciso).length).to.equal(5);
        expect(dispositivos.filter(isAlinea).length).to.equal(10);
      });

      it('Deveria possuir 3 revisões, sendo 1 principal', () => {
        expect(state.revisoes?.length).to.equal(3);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(1);
        const revisaoPrincipal = state.revisoes![0];
        expect(revisaoPrincipal).to.not.be.undefined;
        expect(isRevisaoPrincipal(revisaoPrincipal!)).to.be.true;
      });

      describe('Removendo "antigo" inciso I-4 (atual I-3 porque o anterior foi removido)', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir state.ui.events com evento "ElementoRemovido" e primeiro elemento do array "elementos" apontando para dispositivo com texto "teste J:"', () => {
          const removidos = state.ui?.events?.find(ev => ev.stateType === StateType.ElementoRemovido)?.elementos;
          const primeiroRemovido = removidos?.[0];
          expect(primeiroRemovido).to.be.exist;
          expect(primeiroRemovido?.conteudo?.texto).to.equal('teste J:');
        });

        it('Deveria possuir 4 incisos adicionados, cada um com 2 alíneas', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(f => !isArticulacao(f) && isAdicionado(f));
          expect(dispositivos.length).to.equal(12);
          expect(dispositivos.filter(isInciso).length).to.equal(4);
          expect(dispositivos.filter(isAlinea).length).to.equal(8);
        });

        it('Deveria possuir 6 revisões, sendo 2 principais', () => {
          expect(state.revisoes?.length).to.equal(6);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(2);
          const revisaoPrincipal = state.revisoes![3];
          expect(revisaoPrincipal).to.not.be.undefined;
          expect(isRevisaoPrincipal(revisaoPrincipal!)).to.be.true;
        });

        it('A segunda revisão principal deveria possuir o atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" apontando para a alínea "b" do inciso I-3', () => {
          const revisaoPrincipal = state.revisoes![3] as RevisaoElemento;
          expect(revisaoPrincipal).to.not.be.undefined;
          const elementoAnterior = revisaoPrincipal!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
          expect(elementoAnterior.lexmlId).to.equal('art1_par1u_inc1-3_ali2');
        });
      });

      describe('Incluindo novo inciso após o inciso I-2', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
          state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' }, posicao: 'depois' });
        });

        it('Deveria possuir 4 revisões, sendo 2 principais', () => {
          expect(state.revisoes?.length).to.equal(4);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(2);
        });

        it('Deveria possuir novo inciso I-3', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(f => !isArticulacao(f) && isAdicionado(f));
          expect(dispositivos.length).to.equal(16);
          expect(dispositivos.filter(isInciso).length).to.equal(6);
          expect(dispositivos.filter(isAlinea).length).to.equal(10);

          const dispositivo = dispositivos.find(d => d.id === 'art1_par1u_inc1-3')!;
          expect(dispositivo.texto).to.be.empty;
        });

        it('O atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" da revisão de exclusão do inciso I-3 original, deveria apontar para o novo inciso I-3', () => {
          const revisaoPrincipal = state.revisoes![0] as RevisaoElemento;
          expect(revisaoPrincipal).to.not.be.undefined;
          const elementoAnterior = revisaoPrincipal!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
          expect(elementoAnterior.uuid).to.equal(d.uuid);
        });
      });

      describe('Incluindo novo inciso, com alíneas, após o inciso I-2', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-2')!;
          state = elementoReducer(state, {
            type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
            atual: createElemento(d),
            novo: {
              isDispositivoAlteracao: isDispositivoAlteracao(d),
              conteudo: {
                texto: TEXTO_006,
              },
            },
            isColarSubstituindo: false,
            posicao: 'depois',
          });
        });

        it('Deveria possuir novo inciso I-3', () => {
          const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
          expect(disp.texto).to.equal('texto novo inciso:');
        });

        it('Deveria possuir 6 revisões, sendo 2 principais', () => {
          expect(state.revisoes?.length).to.equal(6);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(2);
        });

        it('O atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" da revisão de exclusão do inciso I-3 original, deveria apontar para a alínea B do novo inciso I-3', () => {
          const revisaoPrincipal = state.revisoes![0] as RevisaoElemento;
          expect(revisaoPrincipal).to.not.be.undefined;
          const elementoAnterior = revisaoPrincipal!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;

          const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
          const alineaB = disp.filhos[1];
          expect(elementoAnterior.uuid).to.equal(alineaB.uuid);
        });

        describe('Rejeitando revisão do inclusão do novo inciso I-3', () => {
          beforeEach(function () {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!;
            const r = findRevisaoByElementoUuid(state.revisoes, d.uuid);
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: r });
          });

          it('Deveria possuir 3 revisões, sendo 1 principal', () => {
            expect(state.revisoes?.length).to.equal(3);
            expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.equal(1);
          });

          it('O atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" da revisão de exclusão do inciso I-3 original, deveria apontar para a alínea B do inciso I-2 (que possui texto "teste F;")', () => {
            const revisao = state.revisoes![0] as RevisaoElemento;
            expect(revisao).to.not.be.undefined;
            const elementoAnterior = revisao!.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura!;
            expect(elementoAnterior.conteudo?.texto).to.equal('teste F;');
          });
        });
      });
    });
  });
});
