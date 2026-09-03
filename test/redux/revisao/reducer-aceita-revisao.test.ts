import { buscaDispositivoById, isDispositivoAlteracao } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { isRevisaoPrincipal, findRevisaoByElementoLexmlId } from './../../../src/redux/elemento/util/revisaoUtil';
import { State, StateType } from '../../../src/redux/state';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { RevisaoElemento } from '../../../src/model/revisao/revisao';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ACEITAR_REVISAO } from '../../../src/model/lexml/acao/aceitarRevisaoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { adicionaElementosNaProposicaoFromClipboard } from '../../../src/redux/elemento/reducer/adicionaElementosNaProposicaoFromClipboard';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TEXTO_013 } from '../../doc/textos-colar/texto_013';

let state: State;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  describe('Ativando revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    // TESTE "DESATIVADO" ATÉ QUE SEJA CORRIGIDO O ACEITE DE MÚLTIPLAS REVISÕES
    // describe('Testando aceite de múltiplas revisões (*)', () => {
    //   beforeEach(function () {
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u')!) });
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par1')!) });
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par3')!) });
    //   });

    //   it('Deveria possuir 7 revisões, sendo 3 principais', () => {
    //     expect(state.revisoes?.length).to.be.equal(7);
    //     expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(3);
    //   });

    //   describe('Aceitando todas as revisões', () => {
    //     beforeEach(function () {
    //       state = elementoReducer(state, { type: ACEITAR_REVISAO });
    //     });

    //     it('Deveria não possuir revisão', () => {
    //       expect(state.revisoes?.length).to.be.equal(0);
    //     });

    //     it('Deveria possuir 4 itens em State.past', () => {
    //       expect(state.past?.length).to.be.equal(4);
    //     });

    //     it('State.past deveria possuir 3 eventos RevisaoAceita', () => {
    //       const eventos = (state.past![3] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.RevisaoAceita);
    //       expect(eventos.length).to.be.equal(3);
    //     });

    //     it('State.past deveria possuir 1 evento ElementoValidado', () => {
    //       const eventos = (state.past![3] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.ElementoValidado);
    //       expect(eventos.length).to.be.equal(1);
    //       expect(eventos[0].elementos?.length).to.be.equal(7);
    //     });

    //     describe('Fazendo UNDO do aceite', () => {
    //       beforeEach(function () {
    //         state = elementoReducer(state, { type: UNDO });
    //       });

    //       it('Deveria possuir 7 revisões, sendo 3 principais', () => {
    //         expect(state.revisoes?.length).to.be.equal(7);
    //         expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(3);
    //       });
    //     });
    //   });
    // });

    // TESTE "DESATIVADO" ATÉ QUE SEJA CORRIGIDO O ACEITE DE MÚLTIPLAS REVISÕES
    // describe('Testando aceite de múltiplas revisões (**)', () => {
    //   beforeEach(function () {
    //     state = elementoReducer(state, { type: APLICAR_REVISOES, alteracoesEmenda: EMENDA_006.componentes[0].dispositivos });

    //     // gera 1 revisão
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par1')!) });

    //     // gera 1 revisão
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par3')!) });

    //     // gera 2 revisões (Art. 3º possui parágrafo único)
    //     state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art3')!) });

    //     // gerar 3 revisões (o inciso movimentado possui 2 alíneas)
    //     state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!) });

    //     // gerar 3 revisões (o inciso removido possui 2 alíneas)
    //     state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!) });
    //   });

    //   it('Deveria possuir 10 revisões, sendo 5 principais', () => {
    //     expect(state.revisoes?.length).to.be.equal(10);
    //     expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(5);
    //   });

    //   describe('Aceitando todas as revisões', () => {
    //     beforeEach(function () {
    //       state = elementoReducer(state, { type: ACEITAR_REVISAO });
    //     });

    //     it('Deveria não possuir revisão', () => {
    //       expect(state.revisoes?.length).to.be.equal(0);
    //     });

    //     it('Deveria possuir 6 itens em State.past', () => {
    //       expect(state.past?.length).to.be.equal(6);
    //     });

    //     it('State.past deveria possuir 5 eventos RevisaoAceita', () => {
    //       const eventos = (state.past![5] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.RevisaoAceita);
    //       expect(eventos.length).to.be.equal(5);
    //     });

    //     it('State.past deveria possuir 1 evento ElementoValidado', () => {
    //       const eventos = (state.past![5] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.ElementoValidado);
    //       expect(eventos.length).to.be.equal(1);
    //       expect(eventos[0].elementos?.length).to.be.equal(7); // Os dispositivos removidos não são validados
    //     });

    //     describe('Fazendo UNDO do aceite', () => {
    //       beforeEach(function () {
    //         state = elementoReducer(state, { type: UNDO });
    //       });

    //       it('Deveria possuir 10 revisões, sendo 5 principais', () => {
    //         expect(state.revisoes?.length).to.be.equal(10);
    //         expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(5);
    //       });

    //       describe('Fazendo REDO do aceite', () => {
    //         beforeEach(function () {
    //           state = elementoReducer(state, { type: REDO });
    //         });

    //         it('Deveria não possuir revisão', () => {
    //           expect(state.revisoes?.length).to.be.equal(0);
    //         });
    //       });
    //     });
    //   });
    // });

    describe('Testando UNDO do aceite de múltiplas revisões', () => {
      beforeEach(function () {
        // elementoReducer(state, { type: REMOVER_ELEMENTO, atual: e });
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!) });
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!) });
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!) });
        state = elementoReducer(state, { type: ACEITAR_REVISAO });
        state = elementoReducer(state, { type: UNDO });
      });

      it('Deveria possuir 3 revisões', () => {
        expect(state.revisoes?.length).to.be.equal(3);
      });
    });

    describe('Removendo "art1_par1u_inc1"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        const e = createElemento(d);
        e.conteudo!.texto = 'texto modificado;';
        state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
      });

      it('Deveria possuir uma revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
      });

      describe('Aceitando a revisão', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });
      });

      describe('Aceitando e fazendo UNDO', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });
      });

      describe('Aceitando, fazendo UNDO e REDO da aceitação', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (modificação)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          // expect(!isSuprimido(d)).to.be.true;
          expect(d.texto).not.to.be.equal('texto modificado;');
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (modificação), REDO (modificação)', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (modificação), REDO (modificação), REDO (aceitação)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO }); // undo aceitação
          state = elementoReducer(state, { type: UNDO }); // undo modificação
          state = elementoReducer(state, { type: REDO }); // redo modificação
          state = elementoReducer(state, { type: REDO }); // redo aceitação
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal('texto modificado;');
        });
      });
    });

    describe('Adicionando dispositivo', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: ADICIONAR_ELEMENTO, atual: createElemento(d), novo: { tipo: 'Inciso' } });
      });

      it('Deveria possuir uma revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
        expect((state.revisoes![0] as RevisaoElemento).elementoAntesRevisao).to.be.undefined;
      });

      describe('Aceitando a revisão', () => {
        beforeEach(function () {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
          const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
          expect(elementos.length).to.be.equal(1);
        });

        describe('Desfazendo aceite da revisão', () => {
          it('Deveria possuir uma revisão', () => {
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);
          });
        });
      });
    });

    describe('Removendo Art. 2º', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art2')!;
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
      });

      it('Deveria possuir 6 revisões (1 principal e 5 associadas)', () => {
        expect(state.revisoes?.filter(r => !(r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(1);
        expect(state.revisoes?.filter(r => (r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(5);
      });

      describe('Aceitando a revisão', () => {
        beforeEach(function () {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art2')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
          const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
          expect(elementos.length).to.be.equal(6);
        });

        describe('Desfazendo aceite da revisão', () => {
          it('Deveria possuir 6 revisões (1 principal e 5 associadas)', () => {
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.filter(r => !(r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(1);
            expect(state.revisoes?.filter(r => (r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(5);
          });
        });
      });
    });
  });

  describe('Adicionando dispositivos fora de revisão', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = false;
      state = adicionaElementosNaProposicaoFromClipboard(state, {
        type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
        atual,
        novo: {
          isDispositivoAlteracao: isDispositivoAlteracao(disp),
          conteudo: {
            texto: TEXTO_013,
          },
        },
        isColarSubstituindo,
        posicao: 'depois',
      });
    });

    it('Deveria possuir inciso "art1_par1u_inc2" com 2 alíneas', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      expect(dispositivo.filhos.length).to.be.equal(2);
    });

    it('Parágrafo único do Art. 1 deveria possuir 10 incisos', () => {
      const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
      expect(dispositivos.length).to.be.equal(10);
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Removendo incisos "art1_par1u_inc2" e "art1_par1u_inc3" nessa ordem', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!) });
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!) });
        });

        it('Deveria possuir 2 revisões "principais"', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
          expect(state.revisoes?.length).to.be.equal(6);
        });

        it('Parágrafo único do Art. 1 deveria possuir 8 incisos', () => {
          const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
          expect(dispositivos.length).to.be.equal(8);
        });

        describe('Aceitando as revisões', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc3')! });
            state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2')! });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
            const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
            expect(elementos.length).to.be.equal(3);
          });

          it('Parágrafo único do Art. 1 deveria possuir 8 incisos', () => {
            const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
            expect(dispositivos.length).to.be.equal(8);
          });

          describe('Desfazendo aceite da revisão do inc2', () => {
            // Vai trazer de volta as indicações de exclusão do inc2, mas os dispositivos não retornam para a articulação.
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 1 revisão "principal"', () => {
              expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
              expect(state.revisoes?.length).to.be.equal(3);
            });

            it('Parágrafo único do Art. 1 deveria possuir 8 incisos', () => {
              const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
              expect(dispositivos.length).to.be.equal(8);
            });

            describe('Desfazendo aceite da revisão do inc3', () => {
              // Vai trazer de volta as indicações de exclusão do inc3, mas o dispositivo não retorna para a articulação.
              beforeEach(function () {
                state = elementoReducer(state, { type: UNDO });
              });

              it('Deveria possuir 2 revisões "principais"', () => {
                expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
                expect(state.revisoes?.length).to.be.equal(6);
              });

              it('Parágrafo único do Art. 1 deveria possuir 8 incisos', () => {
                const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
                expect(dispositivos.length).to.be.equal(8);
              });

              describe('Aceitando novamente a revisão dos incisos 2 e 3', () => {
                beforeEach(function () {
                  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc3')! });
                  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2')! });
                });

                it('Deveria não possuir revisão', () => {
                  expect(state.revisoes?.length).to.be.equal(0);
                  const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
                  expect(elementos.length).to.be.equal(3);
                });

                it('Parágrafo único do Art. 1 deveria possuir 8 incisos', () => {
                  const dispositivos = buscaDispositivoById(state.articulacao!, 'art1_par1u')!.filhos;
                  expect(dispositivos.length).to.be.equal(8);
                });
              });
            });
          });
        });
      });
    });
  });
});
