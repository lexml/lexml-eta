import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { ADD_ELEMENTO, transformaArtigoEmParagrafo } from '../../../src/redux/elemento-actions';
import { adicionaElemento, modificaTipoElemento, redo, undo } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTIGO_UNICO } from '../../doc/exemplo-artigo-unico';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;

describe('Testando a transformação de artigo em parágrafo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  it('Deveria apresentar 5 artigos inicialmente', () => {
    expect(state.articulacao.artigos.length).to.equal(5);
  });
  describe('Testando a mudança do artigo 4, com filhos, em parágrafo do artigo anterior que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      const action = transformaArtigoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! });

      state = modificaTipoElemento(state, action);
    });
    it('Deveria apresentar 4 artigos depois da transformação', () => {
      expect(state.articulacao.artigos.length).to.equal(4);
    });
    it('Deveria apresentar mais um parágrafo no artigo 3, depois da transformação', () => {
      expect(state.articulacao.artigos[2].filhos.length).to.equal(2);
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(state.ui.events.length).to.equal(4);
      });
      it('Deveria apresentar o antigo artigo como parágrafo do artigo anterior', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(11);
        expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
        expect(incluido.elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 4:');
      });
      it('Deveria apresentar o antigo artigo e seus filhos no evento de ElementoRemoved', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(11);
      });
      it('Deveria apresentar o parágrafo do artigo para onde foi copiado o artigo como parágrafo e os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(2);
        expect(renumerados.elementos![0].rotulo).equal('§ 1º');
        expect(renumerados.elementos![1].rotulo).equal('Art. 4º');
      });
      it('Deveria apresentar os elementos transformados no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(7);
        expect(validados.elementos![0].rotulo).equal('a)');
        expect(validados.elementos![1].rotulo).equal('b)');
        expect(validados.elementos![2].rotulo).equal('c)');
        expect(validados.elementos![3].rotulo).equal('1.');
        expect(validados.elementos![4].rotulo).equal('2.');
        expect(validados.elementos![5].rotulo).equal('IV –');
        expect(validados.elementos![6].rotulo).equal('V –');
      });
    });
    describe('Testando Undo/Redo', () => {
      beforeEach(function () {
        state = undo(state);
      });
      it('Deveria apresentar 5 artigos', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(3);
        });
        it('Deveria apresentar o antigo artigo e seus filhos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(11);
          expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
          expect(incluido.elementos![1].rotulo).to.equal('I –');
          expect(incluido.elementos![2].rotulo).to.equal('a)');
          expect(incluido.elementos![3].rotulo).to.equal('b)');
          expect(incluido.elementos![4].rotulo).to.equal('c)');
          expect(incluido.elementos![5].rotulo).to.equal('1.');
          expect(incluido.elementos![6].rotulo).to.equal('2.');
          expect(incluido.elementos![7].rotulo).to.equal('II –');
          expect(incluido.elementos![8].rotulo).to.equal('III –');
          expect(incluido.elementos![9].rotulo).to.equal('IV –');
          expect(incluido.elementos![10].rotulo).to.equal('Parágrafo único.');
        });
        it('Deveria apresentar o item, criado a partir da alinea, e seus filhos no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(11);
          expect(removido.elementos![0].rotulo).equal('§ 2º');
          expect(removido.elementos![1].rotulo).equal('I –');
          expect(removido.elementos![2].rotulo).to.equal('a)');
          expect(removido.elementos![3].rotulo).to.equal('b)');
          expect(removido.elementos![4].rotulo).to.equal('c)');
          expect(removido.elementos![5].rotulo).to.equal('1.');
          expect(removido.elementos![6].rotulo).to.equal('2.');
          expect(removido.elementos![7].rotulo).to.equal('II –');
          expect(removido.elementos![8].rotulo).to.equal('III –');
          expect(removido.elementos![9].rotulo).to.equal('IV –');
        });
        it('Deveria apresentar o parágrafo do artigo para onde foi copiado o artigo como parágrafo e o artigo seguinte no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(2);
          expect(renumerados.elementos![0].rotulo).equal('Parágrafo único.');
          expect(renumerados.elementos![1].rotulo).equal('Art. 5º');
        });
      });
      describe('Testando Redo', () => {
        beforeEach(function () {
          state = redo(state);
        });
        it('Deveria apresentar 4 artigos depois da transformação', () => {
          expect(state.articulacao.artigos.length).to.equal(4);
        });
        it('Deveria apresentar mais um parágrafo no artigo 3, depois da transformação', () => {
          expect(state.articulacao.artigos[2].filhos.length).to.equal(2);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 4 eventos', () => {
            expect(state.ui.events.length).to.equal(4);
          });
          it('Deveria apresentar o antigo artigo como parágrafo do artigo anterior', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(11);
            expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
            expect(incluido.elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 4:');
          });
          it('Deveria apresentar o antigo artigo e seus filhos no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(11);
          });
          it('Deveria apresentar o parágrafo do artigo para onde foi copiado o artigo como parágrafo e os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(2);
            expect(renumerados.elementos![0].rotulo).equal('§ 1º');
            expect(renumerados.elementos![1].rotulo).equal('Art. 4º');
          });
          it('Deveria apresentar os elementos transformados no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(7);
          });
        });
      });
    });
  });

  describe('Testando a transformação de artigo em parágrafo, em que resta apenas um artigo único', () => {
    beforeEach(function () {
      const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGO_UNICO);
      articulacao.renumeraArtigos();
      state = {
        articulacao,
      };
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADD_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
    });
    it('Deveria apresentar 2 artigos', () => {
      expect(state.articulacao.artigos.length).to.equal(2);
    });
    describe('Testando a mudança do artigo 2 em parágrafo do artigo anterior', () => {
      beforeEach(function () {
        const artigo = state.articulacao.artigos[1];
        const action = transformaArtigoEmParagrafo.execute({ tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! });

        state = modificaTipoElemento(state, action);
      });
      it('Deveria apresentar 1 artigo depois da transformação', () => {
        expect(state.articulacao.artigos.length).to.equal(1);
        expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
      });
      it('Deveria apresentar um parágrafo no artigo único, depois da transformação', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(state.ui.events.length).to.equal(4);
        });
        it('Deveria apresentar o antigo artigo como parágrafo únicodo artigo anterior', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
        });
        it('Deveria apresentar o antigo artigo no evento de ElementoRemoved', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
        });
        it('Deveria apresentar o parágrafo único do artigo para onde foi copiado o artigo como parágrafo e os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
        });
        it('Deveria apresentar o elemento transformado no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
        });
      });
      describe('Testando Undo/Redo', () => {
        beforeEach(function () {
          state = undo(state);
        });
        it('Deveria apresentar 2 artigos', () => {
          expect(state.articulacao.artigos.length).to.equal(2);
          expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
          expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        });
        it('Deveria apresentar um artigo sem parágrafo', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(0);
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(state.ui.events.length).to.equal(3);
          });
          it('Deveria voltar apresentar o antigo artigo 2', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
          });
          it('Deveria apresentar o parágrafo no evento de ElementoRemoved', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).to.equal('Parágrafo único.');
          });
          it('Deveria apresentar o parágrafo único do artigo para onde foi copiado o artigo como parágrafo e os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
          });
        });
        describe('Testando Redo', () => {
          beforeEach(function () {
            state = redo(state);
          });
          it('Deveria apresentar 1 artigo depois da transformação', () => {
            expect(state.articulacao.artigos.length).to.equal(1);
            expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          });
          it('Deveria apresentar um parágrafo no artigo único, depois da transformação', () => {
            expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
          });
          describe('Testando eventos', () => {
            it('Deveria apresentar 4 eventos', () => {
              expect(state.ui.events.length).to.equal(4);
            });
            it('Deveria apresentar o antigo artigo como parágrafo únicodo artigo anterior', () => {
              const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
              expect(incluido.elementos!.length).equal(1);
              expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
            });
            it('Deveria apresentar o antigo artigo no evento de ElementoRemoved', () => {
              const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
              expect(removido.elementos!.length).equal(1);
            });
            it('Deveria apresentar o parágrafo único do artigo para onde foi copiado o artigo como parágrafo e os artigos seguintes no array de elementos no evento de ElementoRenumerado', () => {
              const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
              expect(renumerados.elementos!.length).equal(1);
              expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
            });
            it('Deveria apresentar o elemento transformado no array de elementos no evento de ElementoValidado', () => {
              const validados = getEvento(state.ui.events, StateType.ElementoValidado);
              expect(validados.elementos!.length).equal(1);
            });
          });
        });
      });
    });
  });
});
