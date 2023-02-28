import { buscaDispositivoById } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ADICIONAR_AGRUPADOR_ARTIGO } from '../../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { agrupaElemento } from '../../../../src/redux/elemento/reducer/agrupaElemento';
import { createElemento } from '../../../../src/model/elemento/elementoUtil';
import { MPV_885_2019 } from '../../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../../src/model/lexml/acao/openArticulacaoAction';

import { State } from '../../../../src/redux/state';
// import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
// import { REMOVER_ELEMENTO } from '../../../../src/model/lexml/acao/removerElementoAction';
// import { removeElemento } from '../../../../src/redux/elemento/reducer/removeElemento';
// import { undo } from '../../../../src/redux/elemento/reducer/undo';
// import { redo } from '../../../../src/redux/elemento/reducer/redo';

let state: State;

describe('Testando a inclusão e exclusão de agrupadores', () => {
  describe('Carregando texto da MPV 885/2019', () => {
    beforeEach(function () {
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
      state = openArticulacaoAction(projetoNorma.articulacao!);
      state.ui = {} as any;
    });

    it('Deveria possuir articulação com ementa e 5 artigos', () => {
      const nFilhos = state.articulacao!.filhos.length;
      const nArt = state.articulacao!.filhos.filter(f => f.tipo === 'Artigo').length;
      expect(nFilhos).to.equal(5);
      expect(nArt).to.equal(nFilhos);
      expect(state.articulacao!.artigos[0].id).to.equal('art1');
      expect(state.articulacao!.artigos[1].id).to.equal('art2');
      expect(state.articulacao!.artigos[2].id).to.equal('art3');
      expect(state.articulacao!.artigos[3].id).to.equal('art4');
      expect(state.articulacao!.artigos[4].id).to.equal('art5');

      expect(state.articulacao!.artigos[0].rotulo).to.equal('Art. 1º');
      expect(state.articulacao!.artigos[1].rotulo).to.equal('Art. 2º');
      expect(state.articulacao!.artigos[2].rotulo).to.equal('Art. 3º');
      expect(state.articulacao!.artigos[3].rotulo).to.equal('Art. 4º');
      expect(state.articulacao!.artigos[4].rotulo).to.equal('Art. 5º');
    });

    describe('Testando inclusão de parte antes do Art. 1', () => {
      beforeEach(function () {
        const art = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art, novo: { tipo: 'Parte', posicao: 'antes' } });
      });

      it('Deveria apresentar apenas 1 filho (PARTE ÚNICA) na articulação', () => {
        expect(state.articulacao!.filhos.length).to.equal(1);
        expect(state.articulacao!.filhos[0].tipo).to.equal('Parte');
        expect(state.articulacao!.filhos[0].rotulo).to.equal('PARTE ÚNICA');
        expect(state.articulacao!.filhos[0].id).to.equal('prt1');
        expect(state.articulacao!.filhos[0].filhos.length).to.equal(5);
      });

      it('Deveria apresentar Art. 1 filho da Parte', () => {
        expect(state.articulacao!.filhos[0].filhos[0].id).to.equal('art1');
        expect(state.articulacao!.filhos[0].filhos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao!.filhos[0].filhos[0].pai!.id).to.equal('prt1');
      });
    });

    describe('Testando inclusão de parte depois do Art. 1', () => {
      beforeEach(function () {
        const art = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
        state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art, novo: { tipo: 'Parte', posicao: 'depois' } });
      });

      it('Deveria apresentar 2 filhos (Art.1 e PARTE ÚNICA) na articulação', () => {
        expect(state.articulacao!.filhos.length).to.equal(2);

        expect(state.articulacao!.filhos[0].tipo).to.equal('Artigo');
        expect(state.articulacao!.filhos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao!.filhos[0].id).to.equal('art1');
        expect(state.articulacao!.filhos[0].filhos.length).to.equal(0);

        expect(state.articulacao!.filhos[1].tipo).to.equal('Parte');
        expect(state.articulacao!.filhos[1].rotulo).to.equal('PARTE ÚNICA');
        expect(state.articulacao!.filhos[1].id).to.equal('prt1');
        expect(state.articulacao!.filhos[1].filhos.length).to.equal(4);
      });

      it('Deveria apresentar Art. 1 filho da Articulação e Art. 2 filho da Parte', () => {
        expect(state.articulacao!.filhos[0].id).to.equal('art1');
        expect(state.articulacao!.filhos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao!.filhos[0].pai!.id).to.equal(undefined);

        expect(state.articulacao!.filhos[1].filhos[0].id).to.equal('art2');
        expect(state.articulacao!.filhos[1].filhos[0].rotulo).to.equal('Art. 2º');
        expect(state.articulacao!.filhos[1].filhos[0].pai!.id).to.equal('prt1');
      });
    });

    describe('Testando inclusão de parte antes de livro', () => {
      describe('Incluindo livro antes do art 1', () => {
        beforeEach(function () {
          const art = createElemento(buscaDispositivoById(state.articulacao!, 'art1')!);
          state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: art, novo: { tipo: 'Livro', posicao: 'antes' } });
        });

        it('Deveria apresentar apenas 1 filho (LIVRO ÚNICO) na articulação', () => {
          expect(state.articulacao!.filhos.length).to.equal(1);
          expect(state.articulacao!.filhos[0].tipo).to.equal('Livro');
          expect(state.articulacao!.filhos[0].rotulo).to.equal('LIVRO ÚNICO');
          expect(state.articulacao!.filhos[0].id).to.equal('liv1');
          expect(state.articulacao!.filhos[0].filhos.length).to.equal(5);
        });

        it('Deveria apresentar Art. 1 filho do Livro', () => {
          expect(state.articulacao!.filhos[0].filhos[0].id).to.equal('art1');
          expect(state.articulacao!.filhos[0].filhos[0].rotulo).to.equal('Art. 1º');
          expect(state.articulacao!.filhos[0].filhos[0].pai!.id).to.equal('liv1');
        });

        describe('Incluido Parte antes do Livro', () => {
          beforeEach(function () {
            const livro = createElemento(buscaDispositivoById(state.articulacao!, 'liv1')!);
            state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual: livro, novo: { tipo: 'Parte', posicao: 'antes' } });
          });

          it('Deveria apresentar apenas 1 filho (PARTE ÚNICA) na articulação', () => {
            expect(state.articulacao!.filhos.length).to.equal(1);
            expect(state.articulacao!.filhos[0].tipo).to.equal('Parte');
            expect(state.articulacao!.filhos[0].rotulo).to.equal('PARTE ÚNICA');
            expect(state.articulacao!.filhos[0].id).to.equal('prt1');
            expect(state.articulacao!.filhos[0].filhos.length).to.equal(1);
          });

          it('Deveria apresentar Livro como filho da Parte', () => {
            expect(state.articulacao!.filhos[0].filhos[0].tipo).to.equal('Livro');
            expect(state.articulacao!.filhos[0].filhos[0].rotulo).to.equal('LIVRO ÚNICO');
            expect(state.articulacao!.filhos[0].filhos[0].id).to.equal('prt1_liv1');
            expect(state.articulacao!.filhos[0].filhos[0].filhos.length).to.equal(5);
          });
        });
      });
    });
  });

  // describe('Testando agrupadores a partir do texto da MPV 905/2019', () => {

  // });
});

// describe('Testando a inclusão e exclusão de agrupadores', () => {
//   beforeEach(function () {
//     const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
//     state = openArticulacaoAction(projetoNorma.articulacao!);
//     state.ui = {} as any;
//   });
//   it('Deveria possuir articulação com 5 artigos', () => {
//     const nFilhos = state.articulacao?.filhos.length;
//     const nArt = state.articulacao?.filhos.filter(f => f.tipo === 'Artigo').length;
//     expect(nFilhos).to.equal(5);
//     expect(nArt).to.equal(nFilhos);
//     expect(state.articulacao!.artigos[0].id).to.equal('art1');
//     expect(state.articulacao!.artigos[1].id).to.equal('art2');
//     expect(state.articulacao!.artigos[2].id).to.equal('art3');
//     expect(state.articulacao!.artigos[3].id).to.equal('art4');
//     expect(state.articulacao!.artigos[4].id).to.equal('art5');
//   });

//   describe('Testando a articulação após criação de estrutura de agrupadores', () => {
//     beforeEach(function () {
//       /*
//           Capitulo I
//             Seção Única
//               Subseção Única
//           Capítulo II
//                   Art. 1º
//                   ...
//                   Art. 5º
//         */

//       // Cap
//       let atual = createElemento(buscaDispositivoById(state.articulacao!, 'ementa')!);
//       state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });

//       // Seção
//       atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1')!);
//       state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Secao', posicao: 'depois' } });

//       // Subseção
//       atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1_sec1')!);
//       state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Subsecao', posicao: 'depois' } });

//       // Cap 2
//       atual = createElemento(buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1')!);
//       state = agrupaElemento(state, { type: ADICIONAR_AGRUPADOR_ARTIGO, atual, novo: { tipo: 'Capitulo', posicao: 'depois' } });
//     });

//     it('Deveria possuir novos agrupadores cap1, cap1_sec1, cap1_sec1_sub1, cap2', () => {
//       const cap1 = !!buscaDispositivoById(state.articulacao!, 'cap1');
//       const secao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
//       const subsecao = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1');
//       const cap2 = !!buscaDispositivoById(state.articulacao!, 'cap2');

//       expect(cap1).to.be.true;
//       expect(secao).to.be.true;
//       expect(subsecao).to.be.true;
//       expect(cap2).to.be.true;

//       expect(state.articulacao!.artigos[0].id).to.equal('art1');
//       expect(state.articulacao!.artigos[1].id).to.equal('art2');
//       expect(state.articulacao!.artigos[2].id).to.equal('art3');
//       expect(state.articulacao!.artigos[3].id).to.equal('art4');
//       expect(state.articulacao!.artigos[4].id).to.equal('art5');

//       expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap2');
//       expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap2');
//       expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap2');
//       expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap2');
//       expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap2');

//       expect(state.articulacao!.artigos.length).to.equal(5);
//     });

//     it('Deveria possuir 2 filhos (cap1 e cap2) na articulação', () => {
//       expect(state.articulacao!.filhos.length).to.equal(2);
//       expect(state.articulacao!.filhos[0].id).to.equal('cap1');
//       expect(state.articulacao!.filhos[1].id).to.equal('cap2');
//     });

//     describe('Testando exclusão da Seção Única', () => {
//       beforeEach(function () {
//         const sec = buscaDispositivoById(state.articulacao!, 'cap1_sec1')!;
//         state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.secao.tipo, uuid: sec.uuid! } });
//       });

//       it('Deveria retorna articulação sem alterações e mensagem de erro', () => {
//         const sec = !!buscaDispositivoById(state.articulacao!, 'cap1_sec1');
//         expect(sec).to.be.true;
//         expect(state.ui!.message!.descricao).to.equal('Operação não permitida');
//         expect(state.ui!.message!.tipo).to.equal(TipoMensagem.ERROR);
//       });
//     });

//     describe('Excluindo Capítulo II e testando estado da articulação', () => {
//       beforeEach(function () {
//         const cap2 = buscaDispositivoById(state.articulacao!, 'cap2')!;
//         state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.capitulo.tipo, uuid: cap2.uuid! } });
//       });

//       it('Deveria possuir agrupadores cap1, cap1_sec1 e cap1_sec1_sub1 na articulação', () => {
//         const sub = buscaDispositivoById(state.articulacao!, 'cap1_sec1_sub1')!;
//         expect(!!sub).to.be.true;
//         expect(sub.pai!.id).to.equal('cap1_sec1');
//         expect(sub.pai!.pai!.id).to.equal('cap1');
//         expect(sub.pai!.pai!.pai!.id).to.be.undefined;
//       });

//       it('Deveria possuir 1 filho (cap1) na articulação', () => {
//         expect(state.articulacao!.filhos.length).to.equal(1);
//         expect(state.articulacao!.filhos[0].id).to.equal('cap1');
//       });

//       it('Articulação deveria permanecer com 5 artigos', () => {
//         expect(state.articulacao!.artigos.length).to.equal(5);
//       });

//       it('O pai dos 5 artigos deveria ser "cap1_sec1_sub1"', () => {
//         expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap1_sec1_sub1');
//         expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap1_sec1_sub1');
//         expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap1_sec1_sub1');
//         expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap1_sec1_sub1');
//         expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap1_sec1_sub1');
//       });

//       it('Testando ordem dos 5 artigos da articulação', () => {
//         expect(state.articulacao!.artigos[0].id).to.equal('art1');
//         expect(state.articulacao!.artigos[1].id).to.equal('art2');
//         expect(state.articulacao!.artigos[2].id).to.equal('art3');
//         expect(state.articulacao!.artigos[3].id).to.equal('art4');
//         expect(state.articulacao!.artigos[4].id).to.equal('art5');
//       });

//       describe('Testando undo da exclusão do Cap 2', () => {
//         beforeEach(function () {
//           state = undo(state);
//         });

//         it('Deveria possuir 2 filhos (cap1 e cap2) na articulação', () => {
//           expect(state.articulacao!.filhos.length).to.equal(2);
//           expect(state.articulacao!.filhos[0].id).to.equal('cap1');
//           expect(state.articulacao!.filhos[1].id).to.equal('cap2');
//         });

//         it('Articulação deveria permanecer com 5 artigos', () => {
//           expect(state.articulacao!.artigos.length).to.equal(5);
//         });

//         it('O pai dos 5 artigos deveria ser "cap2"', () => {
//           expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap2');
//           expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap2');
//           expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap2');
//           expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap2');
//           expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap2');
//         });

//         it('Testando ordem dos 5 artigos da articulação', () => {
//           expect(state.articulacao!.artigos[0].id).to.equal('art1');
//           expect(state.articulacao!.artigos[1].id).to.equal('art2');
//           expect(state.articulacao!.artigos[2].id).to.equal('art3');
//           expect(state.articulacao!.artigos[3].id).to.equal('art4');
//           expect(state.articulacao!.artigos[4].id).to.equal('art5');
//         });

//         describe('Testando redo da exclusão do cap2', () => {
//           beforeEach(function () {
//             state = redo(state);
//           });

//           it('Deveria possuir 1 filho (cap1) na articulação', () => {
//             expect(state.articulacao!.filhos.length).to.equal(1);
//             expect(state.articulacao!.filhos[0].id).to.equal('cap1');
//           });

//           it('Articulação deveria permanecer com 5 artigos', () => {
//             expect(state.articulacao!.artigos.length).to.equal(5);
//           });

//           it('O pai dos 5 artigos deveria ser "cap1_sec1_sub1"', () => {
//             expect(state.articulacao!.artigos[0].pai!.id).to.equal('cap1_sec1_sub1');
//             expect(state.articulacao!.artigos[1].pai!.id).to.equal('cap1_sec1_sub1');
//             expect(state.articulacao!.artigos[2].pai!.id).to.equal('cap1_sec1_sub1');
//             expect(state.articulacao!.artigos[3].pai!.id).to.equal('cap1_sec1_sub1');
//             expect(state.articulacao!.artigos[4].pai!.id).to.equal('cap1_sec1_sub1');
//           });

//           it('Testando ordem dos 5 artigos da articulação', () => {
//             expect(state.articulacao!.artigos[0].id).to.equal('art1');
//             expect(state.articulacao!.artigos[1].id).to.equal('art2');
//             expect(state.articulacao!.artigos[2].id).to.equal('art3');
//             expect(state.articulacao!.artigos[3].id).to.equal('art4');
//             expect(state.articulacao!.artigos[4].id).to.equal('art5');
//           });
//         });
//       });
//     });
//   });
// });
