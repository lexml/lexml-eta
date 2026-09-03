import { ATUALIZAR_TEXTO_ELEMENTO } from './../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { REJEITAR_REVISAO } from './../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { isAdicionado, buscaDispositivoById, isDispositivoAlteracao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

import { isRevisaoPrincipal, findRevisaoByElementoLexmlId, findRevisaoByElementoUuid2 } from '../../../src/redux/elemento/util/revisaoUtil';
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
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { elementoSelecionadoAction } from '../../../src/model/lexml/acao/elementoSelecionadoAction';
import { MPV_1171_2023 } from '../../doc/mpv_1171_2023';
import { ADICIONAR_ELEMENTOS_FROM_CLIPBOARD } from '../../../src/model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TEXTO_015 } from '../../doc/textos-colar/texto_015';
import { TEXTO_013 } from '../../doc/textos-colar/texto_013';

let state: State;
let aux: any;
let uuid2_alineaA: string;
let uuid2_alineaB: string;

describe('Testando rejeição de múltiplas revisões da TEXTO_016', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1171_2023);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
    state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });

    const disp = buscaDispositivoById(state.articulacao!, 'art1')!;
    const atual = createElemento(disp);
    const isColarSubstituindo = true;
    state = elementoReducer(state, {
      type: ADICIONAR_ELEMENTOS_FROM_CLIPBOARD,
      atual,
      novo: {
        isDispositivoAlteracao: isDispositivoAlteracao(disp),
        conteudo: {
          texto: TEXTO_015,
        },
      },
      isColarSubstituindo,
      posicao: 'depois',
    });
  });

  it('Deveria estar em revisão ***', () => {
    expect(state.emRevisao).to.be.true;
  });

  // TODO: REFAZER TESTES

  // it('Deveria ter 5 revisões', () => {
  //   expect(state.revisoes?.length).to.be.equal(5);
  // });

  // it('art13_cpt_alt1_art1 deveria possuir parágrafo único', () => {
  //   const dispositivo = buscaDispositivoById(state.articulacao!, 'art13_cpt_alt1_art1')!.filhos[0];
  //   expect(isParagrafo(dispositivo)).to.be.true;
  //   expect(dispositivo.id).to.be.equal('art13_cpt_alt1_art1_par1u');
  // });

  // it('Deveria existir revisão de inclusão do dispositivo "art13_cpt_alt1_art1_par1u"', () => {
  //   const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art13_cpt_alt1_art1_par1u');
  //   expect(revisao).to.not.be.undefined;
  // });

  // describe('Testando dados dos dispositivos modificados e adicionados', () => {
  //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[1] com palavra "teste" no texto', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[1];
  //     expect(dispositivo.texto).includes('teste');
  //   });

  //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[2] com texto "Outro novo parágrafo."', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
  //     expect(dispositivo.texto).includes('Outro novo parágrafo.');
  //   });

  //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[3] com texto "Mais um parágrafo."', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
  //     expect(dispositivo.texto).includes('Mais um parágrafo.');
  //   });

  //   it('Deveria possuir "art14_cpt_alt1_art4".filhos[5] com texto "E mais um parágrafo"', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
  //     expect(dispositivo.texto).includes('E mais um parágrafo');
  //   });
  // });

  // describe('Rejeitando todas as revisões', () => {
  //   beforeEach(function () {
  //     state = elementoReducer(state, { type: REJEITAR_REVISAO });
  //   });

  //   it('Deveria possuir 0 revisões', () => {
  //     expect(state.revisoes?.length).to.be.equal(0);
  //   });

  //   it('art13_cpt_alt1_art1 não deveria possuir parágrafo único', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art13_cpt_alt1_art1')!.filhos[0];
  //     expect(isParagrafo(dispositivo)).to.be.true;
  //     expect(dispositivo.id).not.to.be.equal('art13_cpt_alt1_art1_par1u');
  //   });

  //   it('"art14_cpt_alt1_art4".filhos[1] não deveria possuir palavra "teste" no texto', () => {
  //     const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[1];
  //     expect(dispositivo.texto).not.includes('teste');
  //   });

  //   it('art14_cpt_alt1_art4 deveria possuir 3 filhos', () => {
  //     const dispositivos = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos;
  //     expect(dispositivos.length).to.be.equal(3);
  //   });

  //   describe('Desfazendo a rejeição', () => {
  //     beforeEach(function () {
  //       state = elementoReducer(state, { type: UNDO });
  //     });

  //     it('Deveria possuir 5 revisões', () => {
  //       expect(state.revisoes?.length).to.be.equal(5);
  //     });

  //     it('art13_cpt_alt1_art1 deveria possuir parágrafo único', () => {
  //       const dispositivo = buscaDispositivoById(state.articulacao!, 'art13_cpt_alt1_art1')!.filhos[0];
  //       expect(isParagrafo(dispositivo)).to.be.true;
  //       expect(dispositivo.id).to.be.equal('art13_cpt_alt1_art1_par1u');
  //     });

  //     it('Deveria existir revisão de inclusão do dispositivo "art13_cpt_alt1_art1_par1u"', () => {
  //       const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art13_cpt_alt1_art1_par1u');
  //       expect(revisao).to.not.be.undefined;
  //     });

  //     it('art14_cpt_alt1_art4 deveria possuir 6 filhos', () => {
  //       const dispositivos = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos;
  //       expect(dispositivos.length).to.be.equal(6);
  //     });

  //     describe('Testando dados dos dispositivos modificados e adicionados', () => {
  //       it('Deveria possuir "art14_cpt_alt1_art4".filhos[1] com palavra "teste" no texto', () => {
  //         const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[1];
  //         expect(dispositivo.texto).includes('teste');
  //       });

  //       it('Deveria possuir "art14_cpt_alt1_art4".filhos[2] com texto "Outro novo parágrafo."', () => {
  //         const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[2];
  //         expect(dispositivo.texto).includes('Outro novo parágrafo.');
  //       });

  //       it('Deveria possuir "art14_cpt_alt1_art4".filhos[3] com texto "Mais um parágrafo."', () => {
  //         const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[3];
  //         expect(dispositivo.texto).includes('Mais um parágrafo.');
  //       });

  //       it('Deveria possuir "art14_cpt_alt1_art4".filhos[5] com texto "E mais um parágrafo"', () => {
  //         const dispositivo = buscaDispositivoById(state.articulacao!, 'art14_cpt_alt1_art4')!.filhos[5];
  //         expect(dispositivo.texto).includes('E mais um parágrafo');
  //       });
  //     });
  //   });
  // });
});

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
  });

  describe('Adicionando dispositivos fora de revisão', () => {
    beforeEach(function () {
      const disp = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      const atual = createElemento(disp);
      const isColarSubstituindo = true;
      state = elementoReducer(state, {
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

    it('Deveria possuir parágrafo "art1_par1u" com 6 filhos', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u')!;
      expect(dispositivo.filhos.length).to.be.equal(6);
    });

    it('Deveria possuir alínea "art1_par1u_inc2_ali1" com texto "teste E;" (*)', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      expect(dispositivo.filhos[0].texto).to.be.equal('teste E;');
    });

    it('Deveria possuir alínea "art1_par1u_inc2_ali2" com texto "teste F." (*)', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
      expect(dispositivo.filhos[1].texto).to.be.equal('teste F.');
    });

    describe('Ativando revisão', () => {
      beforeEach(function () {
        state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('Deveria estar em revisão', () => {
        expect(state.emRevisao).to.be.true;
      });

      it('Deveria não possuir revisões', () => {
        expect(state.revisoes).to.be.empty;
      });

      describe('Removendo alíneas "art1_par1u_inc2_ali2" (b) e "art1_par1u_inc2_ali1" (a), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!.uuid2!;
          uuid2_alineaB = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali2')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali2')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir 2 revisões principais', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
        });

        it('Deveria possuir revisões de exclusão para os elementos "art1_par1u_inc2_ali1" e "art1_par1u_inc2_ali2"', () => {
          const revisoes = state.revisoes!.filter(isRevisaoPrincipal).map(r => r as RevisaoElemento);
          expect(revisoes[0].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc2_ali2');
          expect(revisoes[1].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc2_ali1');

          expect(revisoes[0].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaB);
          expect(revisoes[1].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaA);
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc2_ali1"', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria possuir 1 revisão', () => {
            expect(state.revisoes?.length).to.be.equal(1);
          });

          it('Deveria possuir inciso "II" com 1 filho2', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
            expect(dispositivo.filhos.length).to.be.equal(1);
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc2_ali1" com texto "teste E;"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
            expect(dispositivo.texto).to.be.equal('teste E;');
          });

          describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc2_ali2" (originalmente)', () => {
            beforeEach(function () {
              const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaB)!;
              state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
            });

            it('Deveria não possuir revisão', () => {
              expect(state.revisoes?.length).to.be.equal(0);
            });

            it('Deveria possuir inciso "II" com 2 filhos', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(dispositivo.filhos.length).to.be.equal(2);
            });

            it('Deveria possuir alínea "art1_par1u_inc2_ali1" com texto "teste E;" (**)', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(dispositivo.filhos[0].texto).to.be.equal('teste E;');
            });

            it('Deveria possuir alínea "art1_par1u_inc2_ali2" com texto "teste F." (**)', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(dispositivo.filhos[1].texto).to.be.equal('teste F.');
            });
          });
        });
        /////////////////////////
      });

      describe('Removendo alíneas "art1_par1u_inc2_ali1" (a) e "art1_par1u_inc2_ali2" (b), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!; // A alínea B (ali2) passou a ser a alínea A (ali1)
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir 2 revisões', () => {
          expect(state.revisoes?.length).to.be.equal(2);
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc2_ali1"', () => {
          beforeEach(function () {
            let revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

            revisao = state.revisoes![0]! as RevisaoElemento;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });

            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
            state = elementoReducer(state, elementoSelecionadoAction.execute(createElemento(d)));
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          it('Deveria apresentar alíneas com textos "teste E:" e "teste F."', () => {
            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
            expect(d.filhos.length).to.be.equal(2);
            expect(d.filhos[0].texto).to.be.equal('teste E;');
            expect(d.filhos[1].texto).to.be.equal('teste F.');
          });
        });
      });

      describe('Removendo alíneas "art1_par1u_inc2_ali1" (a) e "art1_par1u_inc2_ali2" (b), nessa ordem', () => {
        beforeEach(function () {
          uuid2_alineaA = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!.uuid2!;
          uuid2_alineaB = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali2')!.uuid2!;

          let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });

          d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!; // A alínea B (ali2) passou a ser a alínea A (ali1)
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(d) });
        });

        it('Deveria possuir 2 revisões principais', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
        });

        it('Deveria possuir revisões de exclusão para os elementos "art1_par1u_inc2_ali1" e "art1_par1u_inc2_ali2"', () => {
          const revisoes = state.revisoes!.filter(isRevisaoPrincipal).map(r => r as RevisaoElemento);
          expect(revisoes[0].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc2_ali1');
          expect(revisoes[1].elementoAposRevisao.lexmlId).to.be.equal('art1_par1u_inc2_ali1');

          expect(revisoes[0].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaA);
          expect(revisoes[1].elementoAposRevisao.uuid2).to.be.equal(uuid2_alineaB);
        });

        it('Deveria possuir inciso "II" sem filhos', () => {
          const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          expect(dispositivo.filhos.length).to.be.equal(0);
        });

        describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc2_ali1"', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaA)!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria possuir 1 revisão', () => {
            expect(state.revisoes?.length).to.be.equal(1);
          });

          it('Deveria possuir inciso "II" com 1 filho', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
            expect(dispositivo.filhos.length).to.be.equal(1);
          });

          it('Deveria possuir a atual alínea "art1_par1u_inc2_ali1" com texto "teste E;"', () => {
            const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
            expect(dispositivo.texto).to.be.equal('teste E;');
          });

          it('A revisão que restou deveria possuir atributo "elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura" apontando para "art1_par1u_inc2_ali1"', () => {
            const revisao = state.revisoes![0] as RevisaoElemento;
            expect(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.lexmlId).to.be.equal('art1_par1u_inc2_ali1');
            expect(revisao.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura?.conteudo?.texto).to.be.equal('teste E;');
          });

          describe('Rejeitando a revisão de exclusão da alínea "art1_par1u_inc2_ali2" (originalmente)', () => {
            beforeEach(function () {
              const revisao = findRevisaoByElementoUuid2(state.revisoes!, uuid2_alineaB)!;
              state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
            });

            it('Deveria não possuir revisão', () => {
              expect(state.revisoes?.length).to.be.equal(0);
            });

            it('Deveria possuir inciso "II" com 2 filhos', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(dispositivo.filhos.length).to.be.equal(2);
            });

            it('Deveria possuir alínea "art1_par1u_inc2_ali1" com texto "teste E;" (***)', () => {
              const inciso = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(inciso.filhos[0].texto).to.be.equal('teste E;');
            });

            it('Deveria possuir alínea "art1_par1u_inc2_ali2" com texto "teste F." (***)', () => {
              const inciso = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(inciso.filhos[1].texto).to.be.equal('teste F.');
            });
          });
        });
      });

      describe('Movendo alínea "art1_par1u_inc2_ali1" para baixo', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          state = elementoReducer(state, { type: MOVER_ELEMENTO_ABAIXO, atual: createElemento(d), destino: buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali2')! });
        });

        it('Deveria possuir 1 revisão', () => {
          expect(state.revisoes?.length).to.be.equal(1);
        });

        it('Deveria possuir 1 revisão principal', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
        });

        describe('Rejeitando a revisão', () => {
          beforeEach(function () {
            const revisao = findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali2')!;
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
          });

          describe('Desfazendo rejeição da revisão (***)', () => {
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 1 revisão', () => {
              expect(state.revisoes?.length).to.be.equal(1);
            });
          });
        });
      });

      describe('Alterando e rejeitando alteração do texto de dispositivo adicionado', () => {
        beforeEach(function () {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          aux = d.texto;
          const e = createElemento(d);
          e.conteudo!.texto = 'novo texto';
          state = elementoReducer(state, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: e });
          state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali1')! });
        });

        it('Deveria não possuir revisão', () => {
          expect(state.revisoes?.length).to.be.equal(0);
        });

        it('Deveria possuir texto inicial', () => {
          const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
          expect(d.texto).to.be.equal(aux);
          expect(isAdicionado(d)).to.be.true;
        });

        describe('Desfazendo rejeição da revisão (****)', () => {
          it('Deveria possuir uma revisão', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);

            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
            expect(d.texto).to.be.equal('novo texto');
            expect(isAdicionado(d)).to.be.true;
          });
        });

        describe('Desfazendo e refazendo rejeição da revisão', () => {
          it('Deveria não possuir revisão', () => {
            let d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
            state = elementoReducer(state, { type: UNDO });
            state = elementoReducer(state, { type: REDO });
            expect(state.revisoes?.length).to.be.equal(0);

            d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!;
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
          // expect(isOriginal(d)).to.be.true;
        });

        describe('Desfazendo rejeição da revisão (*****)', () => {
          it('Deveria possuir uma revisão', () => {
            state = elementoReducer(state, { type: UNDO });
            expect(state.revisoes?.length).to.be.equal(1);

            const d = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc1')!;
            expect(d.texto).to.be.equal('novo texto');
            // expect(isModificado(d)).to.be.true;
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
            // expect(isOriginal(d)).to.be.true;
          });
        });
      });

      describe('Removendo alíneas "art1_par1u_inc2_ali2" e "art1_par1u_inc2_ali1" nessa ordem', () => {
        beforeEach(function () {
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali2')!) });
          state = elementoReducer(state, { type: REMOVER_ELEMENTO, atual: createElemento(buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2_ali1')!) });
        });

        it('Deveria possuir 2 revisões "principais"', () => {
          expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
          expect(state.revisoes?.length).to.be.equal(2);
        });

        it('art1_par1u_inc2 não deveria possuir filhos', () => {
          const art1_par1u_inc2 = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
          expect(art1_par1u_inc2.filhos.length).to.be.equal(0);
        });

        describe('Rejeitando as revisões', () => {
          beforeEach(function () {
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali2')! });
            state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali1')! });
          });

          it('Deveria não possuir revisão', () => {
            expect(state.revisoes?.length).to.be.equal(0);
            // TODO: REVISAR se a quantidade de elementos rejeitados está correta
            // const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
            // expect(elementos.length).to.be.equal(3);
          });

          it('art1_par1u_inc2 deveria possuir 2 filhos', () => {
            const art1_par1u_inc2 = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
            expect(art1_par1u_inc2.filhos.length).to.be.equal(2);
          });

          describe('Desfazendo rejeição da revisão da alínea "b"', () => {
            // Vai trazer de volta as indicações de exclusão da alínea "b", mas os dispositivos não retornam para a articulação.
            beforeEach(function () {
              state = elementoReducer(state, { type: UNDO });
            });

            it('Deveria possuir 1 revisão "principal"', () => {
              expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(1);
              expect(state.revisoes?.length).to.be.equal(1);
            });

            it('art1_par1u_inc2 deveria ter 1 filho', () => {
              const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
              expect(dispositivo.filhos.length).to.be.equal(1);
              expect(dispositivo.filhos[0].texto).to.be.equal('teste F.');
            });

            describe('Desfazendo rejeição da revisão da alínea "a"', () => {
              // Vai trazer de volta as indicações de exclusão da alínea "a", mas o dispositivo não retorna para a articulação.
              beforeEach(function () {
                state = elementoReducer(state, { type: UNDO });
              });

              it('Deveria possuir 2 revisões "principais"', () => {
                expect(state.revisoes?.filter(isRevisaoPrincipal).length).to.be.equal(2);
                expect(state.revisoes?.length).to.be.equal(2);
              });

              it('art1_par1u_inc2 não deveria ter filhos', () => {
                const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
                expect(dispositivo.filhos.length).to.be.equal(0);
              });

              describe('Rejeitando novamente a revisão da alínea "a"', () => {
                beforeEach(function () {
                  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali3')! });
                  state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: findRevisaoByElementoLexmlId(state.revisoes!, 'art1_par1u_inc2_ali1')! });
                });

                it('Deveria não possuir revisão', () => {
                  expect(state.revisoes?.length).to.be.equal(0);
                  // TODO: REVISAR POIS DEVERIA EXISTIR revisões rejeitadas para cada alínea
                  // const elementos = state.ui!.events.filter(se => se.stateType === StateType.RevisaoRejeitada)[0].elementos!;
                  // expect(elementos.length).to.be.equal(3);
                });

                it('art1_par1u_inc2 deveria possuir 2 alíneas (**)', () => {
                  const dispositivo = buscaDispositivoById(state.articulacao!, 'art1_par1u_inc2')!;
                  expect(dispositivo.filhos.length).to.be.equal(2);
                });
              });
            });
          });
        });
      });
    });
  });
});
