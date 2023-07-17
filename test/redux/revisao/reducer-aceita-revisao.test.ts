import { StateEvent } from './../../../src/redux/state';
import { isArticulacao } from './../../../src/model/dispositivo/tipo';
import { getDispositivoAndFilhosAsLista, isAdicionado, isSuprimido, buscaDispositivoById } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
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
import { SUPRIMIR_ELEMENTO } from '../../../src/model/lexml/acao/suprimirElemento';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { APLICAR_ALTERACOES_EMENDA } from '../../../src/model/lexml/acao/aplicarAlteracoesEmenda';
import { EMENDA_005 } from '../../doc/emendas/emenda-005';
import { REDO } from '../../../src/model/lexml/acao/redoAction';

let state: State;

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

    describe('Testando aceite de múltiplas revisões', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u')!) });
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par1')!) });
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par3')!) });
      });

      it('Deveria possuir 7 revisões, sendo 3 principais', () => {
        expect(state.revisoes?.length).to.be.equal(7);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(3);
      });

      describe('Aceitando todas as revisões', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: ACEITAR_REVISAO });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });

        it('Deveria possuir 1 item em State.past', () => {
          expect(state.past?.length).to.be.equal(4);
        });

        it('State.past deveria possuir 3 eventos RevisaoAceita', () => {
          const eventos = (state.past![3] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.RevisaoAceita);
          expect(eventos.length).to.be.equal(3);
        });

        it('State.past deveria possuir 1 evento ElementoValidado', () => {
          const eventos = (state.past![3] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.ElementoValidado);
          expect(eventos.length).to.be.equal(1);
          expect(eventos[0].elementos?.length).to.be.equal(7);
        });

        describe('Fazendo UNDO do aceite', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: UNDO });
          });

          it('Deveria possuir 7 revisões, sendo 3 principais', () => {
            expect(state.revisoes?.length).to.be.equal(7);
            expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(3);
          });
        });
      });
    });

    describe('Testando UNDO do aceite de múltiplas revisões', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!) });
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!) });
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc3')!) });
        state = elementoReducer(state, { type: ACEITAR_REVISAO });
        state = elementoReducer(state, { type: UNDO });
      });

      it('Deveria possuir 3 revisões', () => {
        expect(state.revisoes?.length).to.be.equal(3);
      });
    });

    describe('Suprimindo "art1_par1u_inc1"', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
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
          expect(isSuprimido(d)).to.be.true;
        });
      });

      describe('Aceitando e fazendo UNDO', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
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
          expect(isSuprimido(d)).to.be.true;
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (supressão)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(!isSuprimido(d)).to.be.true;
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (supressão), REDO (supressão)', () => {
        it('Deveria possuir 1 revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: UNDO });
          state = elementoReducer(state, { type: REDO });
          expect(state.revisoes?.length).to.be.equal(1);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
        });
      });

      describe('Aceitando, fazendo UNDO (aceitação), UNDO (supressão), REDO (supressão), REDO (aceitação)', () => {
        it('Deveria não possuir revisão', () => {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO }); // undo aceitação
          state = elementoReducer(state, { type: UNDO }); // undo supressão
          state = elementoReducer(state, { type: REDO }); // redo supressão
          state = elementoReducer(state, { type: REDO }); // redo aceitação
          expect(state.revisoes?.length).to.be.equal(0);

          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
          expect(isSuprimido(d)).to.be.true;
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

    describe('Suprimindo Art. 2º', () => {
      beforeEach(function () {
        const d = buscaDispositivoById(state.articulacao!, 'art2')!;
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(d) });
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
      state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_005.componentes[0].dispositivos });
      // TesteCmdEmdUtil.incluiInciso(state, 'art1_par1u_inc1', false, 'art1_par1u_inc1-1');
      // TesteCmdEmdUtil.incluiInciso(state, 'art1_par1u_inc1-1', false, 'art1_par1u_inc1-2');

      // TesteCmdEmdUtil.incluiAlinea(state, 'art1_par1u_inc1-1', false, 'art1_par1u_inc1-1_ali1');
      // TesteCmdEmdUtil.incluiAlinea(state, 'art1_par1u_inc1-1_ali1', false, 'art1_par1u_inc1-1_ali2');
      // TesteCmdEmdUtil.incluiAlinea(state, 'art1_par1u_inc1-1_ali2', false, 'art1_par1u_inc1-1_ali3');

      // TesteCmdEmdUtil.incluiItem(state, 'art1_par1u_inc1-1_ali1', false, 'art1_par1u_inc1-1_ali1_ite1');
      // TesteCmdEmdUtil.incluiItem(state, 'art1_par1u_inc1-1_ali1_ite1', false, 'art1_par1u_inc1-1_ali1_ite2');
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

        describe('Aceitando as revisões', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali3')! });
            state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali1')! });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
            const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
            expect(elementos.length).to.be.equal(3);
          });

          it('Deveria possuir 3 dispositivos adicionados', () => {
            const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
            expect(dispositivos.length).to.be.equal(3);
          });

          describe('Desfazendo aceite da revisão da alínea "a"', () => {
            // Vai trazer de volta as indicações de exclusão da alínea "a", mas os dispositivos não retornam para a articulação.
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 1 revisão "principal"', () => {
              expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
              expect(state.revisoes?.length).to.be.equal(3);
            });

            it('Deveria possuir 3 dispositivos adicionados', () => {
              const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
              expect(dispositivos.length).to.be.equal(3);
            });

            describe('Desfazendo aceite da revisão da alínea "c"', () => {
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

              describe('Aceitando novamente a revisão da alínea "a"', () => {
                beforeEach(function () {
                  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali3')! });
                  state = elementoReducer(state, { type: ACEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1-1_ali1')! });
                });

                it('Deveria não possuir revisão', () => {
                  expect(state.revisoes?.length).to.be.equal(0);
                  const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoAceita)[0].elementos!;
                  expect(elementos.length).to.be.equal(3);
                });

                it('Deveria possuir 3 dispositivos adicionados', () => {
                  const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
                  expect(dispositivos.length).to.be.equal(3);
                });
              });
            });
          });
        });
      });
    });
  });
});
