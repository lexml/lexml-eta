import { ATUALIZAR_TEXTO_ELEMENTO } from './../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { isOriginal, isModificado } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { REJEITAR_REVISAO } from './../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { isArticulacao } from '../../../src/model/dispositivo/tipo';
import { getDispositivoAndFilhosAsLista, isAdicionado, isSuprimido, buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { isRevisaoPrincipal, findRevisaoByElementoLexmlId } from '../../../src/redux/elemento/util/revisaoUtil';
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
import { SUPRIMIR_ELEMENTO } from '../../../src/model/lexml/acao/suprimirElemento';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { APLICAR_ALTERACOES_EMENDA } from '../../../src/model/lexml/acao/aplicarAlteracoesEmenda';
import { EMENDA_005 } from '../../doc/emendas/emenda-005';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';

let state: State;
let aux: any;

describe('Carregando texto da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
  });

  describe('Ativando revisão', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('Deveria estar em revisão', () => {
      expect(state.emRevisao).to.be.true;
    });

    describe('Suprimindo "art1_par1u_inc1"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
      });

      it('Deveria possuir uma revisão', () => {
        expect(state.revisoes?.length).to.be.equal(1);
      });

      describe('Rejeitando a revisão', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isOriginal(d)).to.be.true;
        });
      });

      describe('Rejeitando e fazendo UNDO', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
        });
      });

      describe('Rejeitando, fazendo UNDO e REDO da rejeição', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isOriginal(d)).to.be.true;
        });
      });

      describe('Rejeitando, fazendo UNDO (rejeição), UNDO (supressão)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isOriginal(d)).to.be.true;
        });
      });

      describe('Rejeitando, fazendo UNDO (rejeição), UNDO (supressão), REDO (supressão)', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
        });
      });

      describe('Rejeitando, fazendo UNDO (rejeição), UNDO (supressão), REDO (supressão), REDO (rejeição)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO }); // undo rejeição
          state = elementoReducer(state, { type: UNDO }); // undo supressão
          state = elementoReducer(state, { type: REDO }); // redo supressão
          state = elementoReducer(state, { type: REDO }); // redo rejeição
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isOriginal(d)).to.be.true;
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

      describe('Rejeitando a revisão', () => {
        beforeEach(function () {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
          const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
          expect(elementos.length).to.be.equal(1);
        });

        describe('Desfazendo rejeição da revisão', () => {
          it('Deveria possuir uma revisão', () => {
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);
          });
        });
      });
    });

    describe('Suprimindo Art. 2º', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art2')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
      });

      it('Deveria possuir 6 revisões (1 principal e 5 associadas)', () => {
        expect(state.revisoes?.filter(r => !(r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(1);
        expect(state.revisoes?.filter(r => (r as RevisaoElemento).idRevisaoElementoPrincipal).length).to.be.equal(5);
      });

      describe('Rejeitando a revisão', () => {
        beforeEach(function () {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art2')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
          const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
          expect(elementos.length).to.be.equal(6);
        });

        describe('Desfazendo rejeição da revisão', () => {
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
      state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_005.componentes[0].dispositivos });
    });

    it('Deveria possuir inciso "art1_par1u_inc1-1" com 3 alíneas', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(dispositivo.filhos.length).to.be.equal(3);
    });

    it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com 2 itens', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
      expect(dispositivo.filhos.length).to.be.equal(2);
    });

    it('Deveria possuir 7 dispositivos adicionados', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
      expect(dispositivos.length).to.be.equal(7);
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Movendo alínea "art1_par1u_inc1-1_ali1" para baixo', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d), destino: buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')! });
        });

        it('Deveria possuir 3 revisões', () => {
          expect(state.revisoes?.length).to.be.equal(3);
        });

        it('Deveria possuir 1 revisão principal', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });

        describe('Rejeitando a revisão', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali2')!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          describe('Desfazendo rejeição da revisão', () => {
            it('Deveria possuir 3 revisões', () => {
              state = elementoReducer(state, { type: UNDO });
              expect(state.revisoes?.length).to.be.equal(3);
            });
          });
        });
      });

      describe('Alterando e rejeitando alteração do texto de dispositivo adicionado', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
          aux = d.texto;
          const e = createElemento(d);
          e.conteudo!.texto = 'novo texto';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali1_ite1')! });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });

        it('Deveria possuir texto inicial', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
          expect(d.texto).to.be.equal(aux);
          expect(isAdicionado(d)).to.be.true;
        });

        describe('Desfazendo rejeição da revisão', () => {
          it('Deveria possuir uma revisão', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);

            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
            expect(d.texto).to.be.equal('novo texto');
            expect(isAdicionado(d)).to.be.true;
          });
        });

        describe('Desfazendo e refazendo rejeição da revisão', () => {
          it('Deveria não possuir revisão', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
            state = elementoReducer(state, { type: UNDO });
            state = elementoReducer(state, { type: REDO });
            expect(state.revisoes?.length).to.be.equal(0);

            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1_ite1')!;
            expect(d.texto).to.be.equal(aux);
            expect(isAdicionado(d)).to.be.true;
          });
        });
      });

      describe('Alterando e rejeitando alteração do texto de dispositivo original', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          aux = d.texto;
          const e = createElemento(d);
          e.conteudo!.texto = 'novo texto';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')! });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });

        it('Deveria possuir texto original', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(d.texto).to.be.equal(aux);
          expect(isOriginal(d)).to.be.true;
        });

        describe('Desfazendo rejeição da revisão', () => {
          it('Deveria possuir uma revisão', () => {
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);

            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('novo texto');
            expect(isModificado(d)).to.be.true;
          });
        });

        describe('Desfazendo e refazendo rejeição da revisão', () => {
          it('Deveria não possuir revisão', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            state = elementoReducer(state, { type: UNDO });
            state = elementoReducer(state, { type: REDO });
            expect(state.revisoes?.length).to.be.equal(0);

            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal(aux);
            expect(isOriginal(d)).to.be.true;
          });
        });
      });

      describe('Removendo alíneas "art1_par1u_inc1-1_ali3" e "art1_par1u_inc1-1_ali1" nessa ordem', () => {
        // TODO: testar removendo na ordem inversa
        beforeEach(function () {
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali3')!) });
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!) });
        });

        it('Deveria possuir 2 revisões "principais"', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
          expect(state.revisoes?.length).to.be.equal(4);
        });

        it('Deveria possuir 3 dispositivos adicionados', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
          expect(dispositivos.length).to.be.equal(3);
        });

        describe('Rejeitando as revisões', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali3')! });
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali1')! });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
            const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
            expect(elementos.length).to.be.equal(3);
          });

          it('Deveria possuir 7 dispositivos adicionados', () => {
            const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
            expect(dispositivos.length).to.be.equal(7);
          });

          describe('Desfazendo rejeição da revisão da alínea "a"', () => {
            // Vai trazer de volta as indicações de exclusão da alínea "a", mas os dispositivos não retornam para a articulação.
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 1 revisão "principal"', () => {
              expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
              expect(state.revisoes?.length).to.be.equal(3);
            });

            it('Deveria possuir 4 dispositivos adicionados', () => {
              const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
              expect(dispositivos.length).to.be.equal(4);
            });

            describe('Desfazendo rejeição da revisão da alínea "c"', () => {
              // Vai trazer de volta as indicações de exclusão da alínea "c", mas o dispositivo não retorna para a articulação.
              beforeEach(function () {
                state = elementoReducer(state, { type: UNDO });
              });

              it('Deveria possuir 2 revisões "principais"', () => {
                expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
                expect(state.revisoes?.length).to.be.equal(4);
              });

              it('Deveria possuir 3 dispositivos adicionados', () => {
                const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
                expect(dispositivos.length).to.be.equal(3);
              });

              describe('Rejeitando novamente a revisão da alínea "a"', () => {
                beforeEach(function () {
                  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali3')! });
                  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali1')! });
                });

                it('Deveria não possuir revisão', () => {
                  expect(state.revisoes?.length).to.be.equal(0);
                  const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
                  expect(elementos.length).to.be.equal(3);
                });

                it('Deveria possuir 7 dispositivos adicionados', () => {
                  const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
                  expect(dispositivos.length).to.be.equal(7);
                });
              });
            });
          });
        });
      });
    });
  });
});

// TODO: testar rejeitando revisão de dispositivo movido
