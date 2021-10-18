import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acoes/acoes';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de dispositivos de artigo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a inclusão de incisos e um caso especial de parágrafo', () => {
    describe('Testando a inclusão de inciso resultante de um Enter no fim do texto de um artigo com filho, terminado com dois pontos, ', () => {
      beforeEach(function () {
        const artigo = state.articulacao.artigos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
          novo: {
            tipo: TipoDispositivo.inciso.tipo,
          },
        });
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria apresentar dois incisos', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(2);
      });
      it('Deveria apresentar o inciso incluído no início da lista, já renumerado', () => {
        expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
        expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('');
      });
      it('Deveria apresentar o inciso anterior renumerado para II', () => {
        expect(state.articulacao.artigos[0].caput.filhos[1].rotulo).to.equal('II –');
        expect(state.articulacao.artigos[0].caput.filhos[1].texto).to.equal('texto do inciso do caput do Artigo 1.');
      });
      describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].conteudo?.texto).equal('');
        });
        it('Deveria apresentar o antigo inciso I no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso do caput do Artigo 1.');
        });
      });
      describe('Testando UNDO', () => {
        beforeEach(function () {
          state = undo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar um inciso', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
        });
        it('Deveria apresentar o inciso original renumerado para I', () => {
          expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
          expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar 1 elemento excluído', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('I –');
            expect(removido.elementos![0].conteudo?.texto).equal('');
          });
          it('Deveria apresentar o antigo inciso I no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso do caput do Artigo 1.');
          });
        });
      });
      describe('Testando REDO', () => {
        beforeEach(function () {
          state = undo(state);
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar dois incisos', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(2);
        });
        it('Deveria apresentar o inciso incluído no início da lista, já renumerado', () => {
          expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
          expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('');
        });
        it('Deveria apresentar o inciso anterior renumerado para II', () => {
          expect(state.articulacao.artigos[0].caput.filhos[1].rotulo).to.equal('II –');
          expect(state.articulacao.artigos[0].caput.filhos[1].texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar 1 elemento incluído', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].conteudo?.texto).equal('');
          });
          it('Deveria apresentar o antigo inciso I no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso do caput do Artigo 1.');
          });
        });
      });
    });
    describe('Testando a inclusão de inciso resultante de um Enter no fim do texto de um inciso, terminado com ponto e virgula', () => {
      beforeEach(function () {
        const inciso1 = state.articulacao.artigos[3].caput.filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso1.uuid },
          novo: {
            tipo: TipoDispositivo.inciso.tipo,
          },
        });
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria manter inalterado o inciso I', () => {
        expect(state.articulacao.artigos[3].filhos[0].numero).to.equal('1');
        expect(state.articulacao.artigos[3].filhos[0].texto).to.equal('texto do inciso I do caput do Artigo 4;');
      });
      it('Deveria posicionar o inciso recém criado após o primeiro inciso', () => {
        expect(state.articulacao.artigos[3].filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[3].filhos[1].texto).to.equal('');
      });
      describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);

          expect(incluido.elementos![0].rotulo).to.equal('II –');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
        it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('III –');
        });
      });
      describe('Testando UNDO', () => {
        beforeEach(function () {
          state = undo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar um inciso', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
        });
        it('Deveria apresentar o inciso original renumerado para I', () => {
          expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
          expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(eventos.length).to.equal(2);
          });
          it('Deveria apresentar 1 elemento excluído', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('II –');
            expect(removido.elementos![0].conteudo?.texto).equal('');
          });
          it('Deveria apresentar o antigo inciso I no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso II do caput do Artigo 4.');
          });
        });
      });
      describe('Testando REDO', () => {
        beforeEach(function () {
          state = undo(state);
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria manter inalterado o inciso I', () => {
          expect(state.articulacao.artigos[3].filhos[0].numero).to.equal('1');
          expect(state.articulacao.artigos[3].filhos[0].texto).to.equal('texto do inciso I do caput do Artigo 4;');
        });
        it('Deveria posicionar o inciso recém criado após o primeiro inciso', () => {
          expect(state.articulacao.artigos[3].filhos[1].numero).to.equal('2');
          expect(state.articulacao.artigos[3].filhos[1].texto).to.equal('');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(state.ui.events.length).to.equal(2);
          });
          it('Deveria apresentar 1 elemento incluído', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);

            expect(incluido.elementos![0].rotulo).to.equal('II –');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('');
          });
          it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].rotulo).equal('III –');
          });
        });
      });
    });
    describe('Testando a inclusão de inciso resultante de um Enter no fim do texto de um inciso, terminado sem pontuação', () => {
      beforeEach(function () {
        const inciso1 = state.articulacao.artigos[3].caput.filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso1.uuid, conteudo: { texto: 'Teste sem pontuação ' } },
          novo: {
            tipo: TipoDispositivo.inciso.tipo,
          },
        });
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria manter inalterado o inciso I', () => {
        expect(state.articulacao.artigos[3].filhos[0].numero).to.equal('1');
        expect(state.articulacao.artigos[3].filhos[0].texto).to.equal('Teste sem pontuação ');
      });
      it('Deveria posicionar o inciso recém criado após o primeiro inciso', () => {
        expect(state.articulacao.artigos[3].filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[3].filhos[1].texto).to.equal('');
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(state.ui.events.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);

          expect(incluido.elementos![0].rotulo).to.equal('II –');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
        it('Deveria apresentar o inciso no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('III –');
        });
        it('Deveria apresentar o inciso no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('I –');
          expect(validados.elementos![0].mensagens![0].descricao).equal(
            'Inciso deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio'
          );
          expect(validados.elementos![0].mensagens![1].descricao).equal('Inciso deveria terminar com ponto e vírgula. ');
        });
      });
      describe('Testando UNDO', () => {
        beforeEach(function () {
          state = undo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar um inciso', () => {
          expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
        });
        it('Deveria apresentar o inciso original renumerado para I', () => {
          expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
          expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 3 eventos', () => {
            expect(eventos.length).to.equal(3);
          });
          it('Deveria apresentar 1 elemento excluído', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('II –');
            expect(removido.elementos![0].conteudo?.texto).equal('');
          });
          it('Deveria apresentar 1 elemento modificado', () => {
            const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
            expect(modificado.elementos!.length).equal(1);
            expect(modificado.elementos![0].rotulo).equal('I –');
            expect(modificado.elementos![0].conteudo?.texto).equal('texto do inciso I do caput do Artigo 4;');
          });
          it('Deveria apresentar o antigo inciso I renumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso II do caput do Artigo 4.');
          });
        });
      });
      describe('Testando REDO', () => {
        beforeEach(function () {
          state = undo(state);
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria manter inalterado o inciso I', () => {
          expect(state.articulacao.artigos[3].filhos[0].numero).to.equal('1');
          expect(state.articulacao.artigos[3].filhos[0].texto).to.equal('Teste sem pontuação ');
        });
        it('Deveria posicionar o inciso recém criado após o primeiro inciso', () => {
          expect(state.articulacao.artigos[3].filhos[1].numero).to.equal('2');
          expect(state.articulacao.artigos[3].filhos[1].texto).to.equal('');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar43 eventos', () => {
            expect(state.ui.events.length).to.equal(4);
          });
          it('Deveria apresentar 1 elemento incluído', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('II –');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('');
          });
          it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
            const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
            expect(renumerados.elementos!.length).equal(1);
            expect(renumerados.elementos![0].rotulo).equal('III –');
          });
          it('Deveria apresentar duas vezes o inciso que também teve o texto modificado no array de elementos no evento de ElementoModificado', () => {
            const modificados = getEvento(state.ui.events, StateType.ElementoModificado);
            expect(modificados.elementos!.length).equal(2);
            expect(modificados.elementos![0].rotulo).equal('I –');
            expect(modificados.elementos![0].conteudo?.texto).equal('texto do inciso I do caput do Artigo 4;');
            expect(modificados.elementos![1].rotulo).equal('I –');
            expect(modificados.elementos![1].conteudo?.texto).equal('Teste sem pontuação ');
          });
          it('Deveria apresentar o artigo modificado no array de elementos no evento de ElementoValidado', () => {
            const validados = getEvento(state.ui.events, StateType.ElementoValidado);
            expect(validados.elementos!.length).equal(1);
            expect(validados.elementos![0].rotulo).equal('I –');
            expect(validados.elementos![0].mensagens![0].descricao).equal(
              'Inciso deveria iniciar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio'
            );
            expect(validados.elementos![0].mensagens![1].descricao).equal('Inciso deveria terminar com ponto e vírgula. ');
          });
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter no fim do texto de um inciso, terminado com ponto', () => {
      beforeEach(function () {
        const inciso = state.articulacao.artigos[1].caput.filhos[1];

        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid },
          novo: {
            tipo: TipoDispositivo.inciso.tipo,
          },
        });
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 incisos após incluir o inciso', () => {
        expect(state.articulacao.artigos[1].caput.filhos.length).to.equal(2);
      });
      it('Deveria manter inalterado o inciso II', () => {
        expect(state.articulacao.artigos[1].caput.filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[1].caput.filhos[1].texto).to.equal('texto do inciso II do caput do Artigo 2.');
      });
      it('Deveria criar um parágrafo após o inciso', () => {
        expect(state.articulacao.artigos[1].filhos[2].tipo).to.equal('Paragrafo');
        expect(state.articulacao.artigos[1].filhos[2].rotulo).to.equal('Parágrafo único.');
        expect(state.articulacao.artigos[1].filhos[2].texto).to.equal('');
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 1 evento', () => {
          expect(eventos.length).to.equal(1);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
      });
      describe('Testando UNDO', () => {
        beforeEach(function () {
          state = undo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria apresentar um inciso', () => {
          expect(state.articulacao.artigos[1].filhos.length).to.equal(2);
        });
        it('Deveria apresentar o inciso original renumerado para I', () => {
          expect(state.articulacao.artigos[0].caput.filhos[0].rotulo).to.equal('I –');
          expect(state.articulacao.artigos[0].caput.filhos[0].texto).to.equal('texto do inciso do caput do Artigo 1.');
        });
        describe('Testando eventos', () => {
          it('Deveria apresentar 1 evento', () => {
            expect(eventos.length).to.equal(1);
          });
          it('Deveria apresentar 1 elemento excluído', () => {
            const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
            expect(removido.elementos!.length).equal(1);
            expect(removido.elementos![0].rotulo).equal('Parágrafo único.');
            expect(removido.elementos![0].conteudo?.texto).equal('');
          });
        });
      });
      describe('Testando REDO', () => {
        beforeEach(function () {
          state = undo(state);
          state = redo(state);
          eventos = getEventosQuePossuemElementos(state.ui.events);
        });
        it('Deveria manter inalterado o inciso I', () => {
          expect(state.articulacao.artigos[1].filhos[1].numero).to.equal('2');
          expect(state.articulacao.artigos[1].filhos[1].texto).to.equal('texto do inciso II do caput do Artigo 2.');
        });
        it('Deveria posicionar o inciso recém criado após o primeiro inciso', () => {
          expect(state.articulacao.artigos[1].filhos[2].numero).to.equal('1');
          expect(state.articulacao.artigos[1].filhos[2].rotulo).to.equal('Parágrafo único.');
          expect(state.articulacao.artigos[1].filhos[2].texto).to.equal('');
        });
        describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
          it('Deveria apresentar 1 evento', () => {
            expect(state.ui.events.length).to.equal(1);
          });
          it('Deveria apresentar 1 elemento incluído', () => {
            const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
            expect(incluido.elementos!.length).equal(1);
            expect(incluido.elementos![0].rotulo).to.equal('Parágrafo único.');
            expect(incluido.elementos![0].conteudo?.texto).to.equal('');
          });
        });
      });
    });
  });
});
