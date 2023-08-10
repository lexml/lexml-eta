import { ATUALIZAR_TEXTO_ELEMENTO } from './../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { isOriginal, isModificado } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { REJEITAR_REVISAO } from './../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { isArticulacao } from '../../../src/model/dispositivo/tipo';
import { getDispositivoAndFilhosAsLista, isAdicionado, isSuprimido, buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { isRevisaoPrincipal, findRevisaoByElementoLexmlId, findRevisaoByElementoUuid2, findRevisaoById } from '../../../src/redux/elemento/util/revisaoUtil';
import { State, StateEvent, StateType } from '../../../src/redux/state';
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
import { elementoSelecionadoAction } from '../../../src/model/lexml/acao/elementoSelecionadoAction';
import { EMENDA_006 } from '../../doc/emendas/emenda-006';
import { MPV_1171_2023 } from '../../doc/mpv_1171_2023';
import { EMENDA_009 } from '../../doc/emendas/emenda-009';

let state: State;
let aux: any;
let uuid2_alineaA: string;
let uuid2_alineaB: string;

describe('Testando rejeição de múltiplas revisões da EMENDA_009', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1171_2023, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
    state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_009.componentes[0].dispositivos, revisoes: EMENDA_009.revisoes });
  });

  it('Deveria estar em revisão', () => {
    expect(state.emRevisao).to.be.true;
  });

  it('Deveria ter 7 revisões', () => {
    expect(state.revisoes?.length).to.be.equal(7);
  });

  it('Deveria possuir 2 dispositivos modificados e 5 adicionados', () => {
    const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).slice(1);
    expect(dispositivos.filter(isModificado).length).to.be.equal(2);
    expect(dispositivos.filter(isAdicionado).length).to.be.equal(5);
  });

  describe('Testando dados dos dispositivos modificados e adicionados', () => {
    it('Deveria possuir "art14_cpt_alt1_art4".filhos[0] como original', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[0];
      expect(isOriginal(dispositivo)).to.be.true;
      expect(dispositivo.tipo).to.be.equal('Omissis');
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[1] como modificado', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[1];
      expect(isModificado(dispositivo)).to.be.true;
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[2] como adicionado', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
      expect(isAdicionado(dispositivo)).to.be.true;
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[3] como adicionado', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
      expect(isAdicionado(dispositivo)).to.be.true;
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[4] como modificado', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[4];
      expect(isModificado(dispositivo)).to.be.true;
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[5] como adicionado', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
      expect(isAdicionado(dispositivo)).to.be.true;
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[2].texto como "Outro novo parágrafo."', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
      expect(dispositivo.texto).to.be.equal('Outro novo parágrafo.');
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[3].texto como "Mais um parágrafo."', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
      expect(dispositivo.texto).to.be.equal('Mais um parágrafo.');
    });

    it('Deveria possuir "art14_cpt_alt1_art4".filhos[5].texto como "E mais um parágrafo."', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
      expect(dispositivo.texto).to.be.equal('E mais um parágrafo.');
    });
  });

  describe('Rejeitando todas as revisões', () => {
    beforeEach(function () {
      state = elementoReducer(state, { type: REJEITAR_REVISAO });
    });

    it('Deveria possuir 0 revisões', () => {
      expect(state.revisoes?.length).to.be.equal(0);
    });

    it('Deveria possuir 0 dispositivos modificados e 0 adicionados', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).slice(1);
      expect(dispositivos.filter(isModificado).length).to.be.equal(0);
      expect(dispositivos.filter(isAdicionado).length).to.be.equal(0);
    });

    describe('Desfazendo a rejeição', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: UNDO });
      });

      it('Deveria possuir 7 revisões', () => {
        expect(state.revisoes?.length).to.be.equal(7);
      });

      it('Deveria possuir 2 dispositivos modificados e 5 adicionados', () => {
        const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).slice(1);
        expect(dispositivos.filter(isModificado).length).to.be.equal(2);
        expect(dispositivos.filter(isAdicionado).length).to.be.equal(5);
      });

      // describe('Testando dados dos dispositivos modificados e adicionados (deveriam ter voltado ao estado de antes da rejeição)', () => {
      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[0] como original', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[0];
      //     expect(isOriginal(dispositivo)).to.be.true;
      //     expect(dispositivo.tipo).to.be.equal('Omissis');
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[1] como modificado', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[1];
      //     expect(isModificado(dispositivo)).to.be.true;
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[2] como adicionado', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
      //     expect(isAdicionado(dispositivo)).to.be.true;
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[3] como adicionado', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
      //     expect(isAdicionado(dispositivo)).to.be.true;
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[4] como modificado', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[4];
      //     expect(isModificado(dispositivo)).to.be.true;
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[5] como adicionado', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
      //     expect(isAdicionado(dispositivo)).to.be.true;
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[2].texto como "Outro novo parágrafo."', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
      //     expect(dispositivo.texto).to.be.equal('Outro novo parágrafo.');
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[3].texto como "Mais um parágrafo."', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
      //     expect(dispositivo.texto).to.be.equal('Mais um parágrafo.');
      //   });

      //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[5].texto como "E mais um parágrafo."', () => {
      //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
      //     expect(dispositivo.texto).to.be.equal('E mais um parágrafo.');
      //   });
      // });
    });
  });
});

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

    describe('Testando rejeição de múltiplas revisões (*)', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: APLICAR_ALTERACOES_EMENDA, alteracoesEmenda: EMENDA_006.componentes[0].dispositivos });

        // gera 1 revisão
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par1')!) });

        // gera 1 revisão
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art2_par3')!) });

        // gera 2 revisões (Art. 3º possui parágrafo único)
        state = elementoReducer(state, { type: SUPRIMIR_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art3')!) });

        // gerar 3 revisões (o inciso movimentado possui 2 alíneas)
        state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!) });

        // gerar 3 revisões (o inciso removido possui 2 alíneas)
        state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-3')!) });
      });

      it('Deveria possuir 10 revisões, sendo 5 principais', () => {
        expect(state.revisoes?.length).to.be.equal(10);
        expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(5);
      });

      describe('Rejeitando todas as revisões', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: REJEITAR_REVISAO });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });

        it('Deveria possuir 6 itens em State.past', () => {
          expect(state.past?.length).to.be.equal(6);
        });

        it('State.past deveria possuir 5 eventos RevisaoRejeitada', () => {
          const eventos = (state.past![5] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.RevisaoRejeitada);
          expect(eventos.length).to.be.equal(5);
        });

        it('Deveria possuir 18 dispositivos adicionados', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => !isArticulacao(d) && isAdicionado(d));
          expect(dispositivos.length).to.be.equal(18);
        });

        it('Deveria não possuir dispositivo suprimido', () => {
          const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(isSuprimido);
          expect(dispositivos.length).to.be.equal(0);
        });

        // it('State.past deveria possuir 1 evento ElementoValidado', () => {
        //   const eventos = (state.past![5] as unknown as StateEvent[]).filter(ev => ev.stateType === StateType.ElementoValidado);
        //   expect(eventos.length).to.be.equal(1);
        //   expect(eventos[0].elementos?.length).to.be.equal(7); // Os dispositivos removidos não são validados
        // });

        describe('Fazendo UNDO da rejeição', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: UNDO });
          });

          it('Deveria possuir 10 revisões, sendo 5 principais', () => {
            expect(state.revisoes?.length).to.be.equal(10);
            expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(5);
          });

          it('Deveria possuir 15 dispositivos adicionados', () => {
            const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => !isArticulacao(d) && isAdicionado(d));
            expect(dispositivos.length).to.be.equal(15);
          });

          it('Deveria possuir 4 dispositivos suprimidos', () => {
            const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(isSuprimido);
            expect(dispositivos.length).to.be.equal(4);
          });

          describe('Fazendo REDO da rejeição', () => {
            beforeEach(function () {
              state = elementoReducer(state, { type: REDO });
            });

            it('Deveria não possuir revisão', () => {
              expect(state.revisoes?.length).to.be.equal(0);
            });

            it('Deveria possuir 18 dispositivos adicionados', () => {
              const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => !isArticulacao(d) && isAdicionado(d));
              expect(dispositivos.length).to.be.equal(18);
            });

            it('Deveria não possuir dispositivo suprimido', () => {
              const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(isSuprimido);
              expect(dispositivos.length).to.be.equal(0);
            });
          });
        });
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
        beforeEach(function () {
          const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc1')!;
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          state = elementoReducer(state, { type: UNDO });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        it('Dispositivo revisado deveria estar suprimido', () => {
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

        describe('Desfazendo rejeição da revisão (*)', () => {
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

        describe('Desfazendo rejeição da revisão (**)', () => {
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

    it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com texto "teste B:" (*)', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(dispositivo.filhos[0].texto).to.be.equal('teste B:');
    });

    it('Deveria possuir alínea "art1_par1u_inc1-1_ali2" com texto "teste E;" (*)', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(dispositivo.filhos[1].texto).to.be.equal('teste E;');
    });

    it('Deveria possuir alínea "art1_par1u_inc1-1_ali3" com texto "teste F;"', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
      expect(dispositivo.filhos[2].texto).to.be.equal('teste F;');
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      describe('Removendo alíneas "art1_par1u_inc1-1_ali2" (b) e "art1_par1u_inc1-1_ali1" (a), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!.uuid2!;
          uuid2_alineaB = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir 2 revisões principais e 2 não principais', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
          expect(state.revisoes?.filter(r => !isRevisaoPrincipal(r)).length).to.be.equal(2);
        });

        it('Deveria possuir revisões de exclusão para os elementos "art1_par1u_inc1-1_ali1" e "art1_par1u_inc1-1_ali2"', () => {
          const revisoes = state.revisoes!.filter(isRevisaoPrincipal).map(r => r as RevisaoElemento);
          expect(revisoes[0].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc1-1_ali2');
          expect(revisoes[1].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc1-1_ali1');

          expect(revisoes[0].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaB);
          expect(revisoes[1].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaA);
        });

        it('Deveria possuir inciso "I-1" com 1 alínea com texto "teste F;" (texto do dispositivo que era alínea "c", originalmente', () => {
          const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(dispositivo.filhos.length).to.be.equal(1);
          expect(dispositivo.filhos[0].texto).to.be.equal('teste F;');
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc1-1_ali1"', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria possuir 1 revisão', () => {
            expect(state.revisoes?.length).to.be.equal(1);
          });

          it('Deveria possuir inciso "I-1" com 2 filhos', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(dispositivo.filhos.length).to.be.equal(2);
          });

          it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com 2 itens', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
            expect(dispositivo.filhos.length).to.be.equal(2);
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc1-1_ali1" com texto "teste B:"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
            expect(dispositivo.texto).to.be.equal('teste B:');
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc1-1_ali2" com texto "teste F;"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!;
            expect(dispositivo.texto).to.be.equal('teste F;');
          });

          describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc1-1_ali2" (originalmente)', () => {
            beforeEach(function () {
              const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaB)!;
              state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
            });

            it('Deveria não possuir revisão', () => {
              expect(state.revisoes?.length).to.be.equal(0);
            });

            it('Deveria possuir inciso "I-1" com 3 filhos', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(dispositivo.filhos.length).to.be.equal(3);
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com texto "teste B:" (**)', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(dispositivo.filhos[0].texto).to.be.equal('teste B:');
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali2" com texto "teste E;" (**)', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(dispositivo.filhos[1].texto).to.be.equal('teste E;');
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali3" com texto "teste F;"', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(dispositivo.filhos[2].texto).to.be.equal('teste F;');
            });
          });
        });
        /////////////////////////
      });

      describe('Removendo alíneas "art1_par1u_inc1-1_ali1" (a) e "art1_par1u_inc1-1_ali2" (b), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!; // A alínea B (ali2) passou a ser a alínea A (ali1)
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          state.revisoes![3].id = 'revPrincipal2';
        });

        it('Deveria possuir 4 revisões sendo 2 principais', () => {
          expect(state.revisoes?.length).to.be.equal(4);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc1-1_ali1"', () => {
          beforeEach(function () {
            let revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

            revisao = findRevisaoById(state.revisoes!, 'revPrincipal2')! as RevisaoElemento;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            state = elementoReducer(state, elementoSelecionadoAction.execute(createElemento(d)));
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar alíneas com textos "teste B:", "teste E:" e "teste F:"', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(d.filhos.length).to.be.equal(3);
            expect(d.filhos[0].texto).to.be.equal('teste B:');
            expect(d.filhos[1].texto).to.be.equal('teste E;');
            expect(d.filhos[2].texto).to.be.equal('teste F;');
          });
        });
      });

      describe('Removendo alíneas "art1_par1u_inc1-1_ali1" (a) e "art1_par1u_inc1-1_ali2" (b), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!.uuid2!;
          uuid2_alineaB = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!; // A alínea B (ali2) passou a ser a alínea A (ali1)
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir 2 revisões principais e 2 não principais', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
          expect(state.revisoes?.filter(r => !isRevisaoPrincipal(r)).length).to.be.equal(2);
        });

        it('Deveria possuir revisões de exclusão para os elementos "art1_par1u_inc1-1_ali1" e "art1_par1u_inc1-1_ali2"', () => {
          const revisoes = state.revisoes!.filter(isRevisaoPrincipal).map(r => r as RevisaoElemento);
          expect(revisoes[0].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc1-1_ali1');
          expect(revisoes[1].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc1-1_ali1');

          expect(revisoes[0].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaA);
          expect(revisoes[1].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaB);
        });

        it('Deveria possuir inciso "I-1" com 1 alínea com texto "teste F;" (texto do dispositivo que era alínea "c", originalmente', () => {
          const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
          expect(dispositivo.filhos.length).to.be.equal(1);
          expect(dispositivo.filhos[0].texto).to.be.equal('teste F;');
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc1-1_ali1"', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria possuir 1 revisão', () => {
            expect(state.revisoes?.length).to.be.equal(1);
          });

          it('Deveria possuir inciso "I-1" com 2 filhos', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
            expect(dispositivo.filhos.length).to.be.equal(2);
          });

          it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com 2 itens', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
            expect(dispositivo.filhos.length).to.be.equal(2);
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc1-1_ali1" com texto "teste B:"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali1')!;
            expect(dispositivo.texto).to.be.equal('teste B:');
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc1-1_ali2" com texto "teste F;"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1_ali2')!;
            expect(dispositivo.texto).to.be.equal('teste F;');
          });

          it('A revisão que restou deveria possuir atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" apontando para "art1_par1u_inc1-1_ali1_ite2"', () => {
            const revisao = state.revisoes![0] as RevisaoElemento;
            expect(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.lexmlId).to.be.equal('art1_par1u_inc1-1_ali1_ite2');
            expect(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.conteudo?.texto).to.be.equal('teste D;');
          });

          describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc1-1_ali2" (originalmente)', () => {
            beforeEach(function () {
              const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaB)!;
              state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
            });

            it('Deveria não possuir revisão', () => {
              expect(state.revisoes?.length).to.be.equal(0);
            });

            it('Deveria possuir inciso "I-1" com 3 filhos', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(dispositivo.filhos.length).to.be.equal(3);
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali1" com texto "teste B:" (***)', () => {
              const inciso = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(inciso.filhos[0].texto).to.be.equal('teste B:');
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali2" com texto "teste E;" (***)', () => {
              const inciso = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(inciso.filhos[1].texto).to.be.equal('teste E;');
            });

            it('Deveria possuir alínea "art1_par1u_inc1-1_ali3" com texto "teste F;"', () => {
              const inciso = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1-1')!;
              expect(inciso.filhos[2].texto).to.be.equal('teste F;');
            });
          });
        });
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

          describe('Desfazendo rejeição da revisão (***)', () => {
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 3 revisões', () => {
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

        describe('Desfazendo rejeição da revisão (****)', () => {
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

        describe('Desfazendo rejeição da revisão (*****)', () => {
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
