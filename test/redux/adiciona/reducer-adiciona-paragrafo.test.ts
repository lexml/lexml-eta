import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acoes/acoes';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_PARAGRAFOS } from '../../doc/exemplo-paragrafos';

let state: any;

describe('Testando adicionar parágrafos', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_PARAGRAFOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a inclusão de parágrafos', () => {
    describe('Testando a inclusão de parágrafo resultante de um Enter no fim do texto de um inciso, terminado com ponto ', () => {
      beforeEach(function () {
        const inciso2 = state.articulacao.artigos[1].caput.filhos[1];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso2.uuid },
          novo: {
            tipo: TipoDispositivo.inciso.tipo,
          },
        });
      });
      it('Deveria manter inalterado o inciso I', () => {
        expect(state.articulacao.artigos[1].filhos[1].rotulo).to.equal('II –');
        expect(state.articulacao.artigos[1].filhos[1].texto).to.equal('texto do inciso II do caput do Artigo 2.');
      });
      it('Deveria posicionar o parágrafo recém criado após o último inciso do caput', () => {
        expect(state.articulacao.artigos[1].filhos[2].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[1].filhos[2].texto).to.equal('');
      });
      it('Deveria renumerar o antigo parágrafo único', () => {
        expect(state.articulacao.artigos[1].filhos[3].rotulo).to.equal('§ 2º');
        expect(state.articulacao.artigos[1].filhos[3].texto).to.equal('Texto do parágrafo único do artigo 2:');
      });
      describe('Testando eventos', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);

          expect(incluido.elementos![0].rotulo).to.equal('§ 1º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
        it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 2º');
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter no fim do texto de um parágrafo, terminado com ponto', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[0].filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid },
        });
      });
      it('Deveria manter inalterado o inciso I', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
      });
      it('Deveria posicionar o parágrafo recém criado após o antigo parágrafo único', () => {
        expect(state.articulacao.artigos[0].filhos[1].rotulo).to.equal('§ 2º');
        expect(state.articulacao.artigos[0].filhos[1].texto).to.equal('');
      });
      describe('Testando os eventos resultantes da ação de inclusão do parágrafo', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
        it('Deveria apresentar o antigo parágrafo 2 no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 3º');
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter no fim do texto de um parágrafo, que não termina com um caracter de pontuação', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[0].filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid, conteudo: { texto: 'teste' } },
        });
      });
      it('Deveria manter inalterado o inciso I', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('teste');
      });
      it('Deveria posicionar o parágrafo recém criado após o antigo parágrafo único', () => {
        expect(state.articulacao.artigos[0].filhos[1].rotulo).to.equal('§ 2º');
        expect(state.articulacao.artigos[0].filhos[1].texto).to.equal('');
      });
      describe('Testando os eventos resultantes da ação de inclusão do parágrafo', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(state.ui.events.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');
        });
        it('Deveria apresentar o antigo parágrafo 2 no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 3º');
        });
        it('Deveria apresentar vazio o array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter antes do texto, terminado com ponto, de um parágrafo que não possui filhos', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[0].filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid, conteudo: { texto: '' } },
          novo: {
            tipo: TipoDispositivo.paragrafo.tipo,
            conteudo: { texto: 'Texto do parágrafo 1 do Artigo 1 que não possui incisos.' },
          },
        });
      });
      it('Deveria apresentar o parágrafo sem o texto', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('');
      });
      it('Deveria posicionar o parágrafo recém criado após o primeiro parágrafo', () => {
        expect(state.articulacao.artigos[0].filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[0].filhos[1].texto).to.equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
      });
      describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(state.ui.events.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);

          expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
        });
        it('Deveria apresentar o antigo parágrafo no array de elementos no evento de ElementoModificado, com ambas versões do texto', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(renumerados.elementos!.length).equal(2);
          expect(renumerados.elementos![0].rotulo).equal('§ 1º');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
          expect(renumerados.elementos![1].rotulo).equal('§ 1º');
          expect(renumerados.elementos![1].conteudo?.texto).equal('');
        });
        it('Deveria apresentar o antigo parágrafo 3 no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 3º');
        });
        it('Deveria apresentar o antigo parágrafo único no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('§ 1º');
          expect(validados.elementos![0].mensagens?.length).equal(1);
          expect(validados.elementos![0].mensagens![0].descricao).equal('Não foi informado um texto para o Parágrafo');
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter no meio do texto, terminado com ponto, de um parágrafo que não possui filhos', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[0].filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid, conteudo: { texto: 'Texto do parágrafo 1 ' } },
          novo: {
            tipo: TipoDispositivo.paragrafo.tipo,
            conteudo: { texto: 'do Artigo 1 que não possui incisos.' },
          },
        });
      });
      it('Deveria apresentar o parágrafo com o texto modificado', () => {
        expect(state.articulacao.artigos[0].filhos[0].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[0].filhos[0].texto).to.equal('Texto do parágrafo 1 ');
      });
      it('Deveria posicionar o parágrafo recém criado após o primeiro parágrafo', () => {
        expect(state.articulacao.artigos[0].filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[0].filhos[1].texto).to.equal('do Artigo 1 que não possui incisos.');
      });
      describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(state.ui.events.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);

          expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('do Artigo 1 que não possui incisos.');
        });
        it('Deveria apresentar o antigo parágrafo no array de elementos no evento de ElementoModificado, com ambas versões do texto', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(renumerados.elementos!.length).equal(2);
          expect(renumerados.elementos![0].rotulo).equal('§ 1º');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do parágrafo 1 do Artigo 1 que não possui incisos.');
          expect(renumerados.elementos![1].rotulo).equal('§ 1º');
          expect(renumerados.elementos![1].conteudo?.texto).equal('Texto do parágrafo 1 ');
        });
        it('Deveria apresentar o antigo parágrafo 3 no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 3º');
        });
        it('Deveria apresentar o antigo parágrafo único no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('§ 1º');
          expect(validados.elementos![0].mensagens?.length).equal(1);
          expect(validados.elementos![0].mensagens![0].descricao).equal('Parágrafo deveria terminar com ponto');
        });
      });
    });
    describe('Testando a inclusão de parágrafo resultante de um Enter no meio do texto, terminado com dois pontos, de um parágrafo que possui filhos', () => {
      beforeEach(function () {
        const paragrafo = state.articulacao.artigos[2].filhos[0];
        state = adicionaElemento(state, {
          type: ADICIONAR_ELEMENTO,
          atual: { tipo: TipoDispositivo.paragrafo.tipo, uuid: paragrafo.uuid, conteudo: { texto: 'Texto do parágrafo 1 do ' } },
          novo: {
            tipo: TipoDispositivo.paragrafo.tipo,
            conteudo: { texto: 'Artigo 3 que possui incisos:' },
          },
        });
      });
      it('Deveria manter o parágrafo com o texto alterado', () => {
        expect(state.articulacao.artigos[2].filhos[0].rotulo).to.equal('§ 1º');
        expect(state.articulacao.artigos[2].filhos[0].texto).to.equal('Texto do parágrafo 1 do ');
      });
      it('Deveria posicionar o parágrafo recém criado após o primeiro parágrafo', () => {
        expect(state.articulacao.artigos[2].filhos[1].numero).to.equal('2');
        expect(state.articulacao.artigos[2].filhos[1].texto).to.equal('Artigo 3 que possui incisos:');
      });
      describe('Testando os eventos resultantes da ação de inclusão do inciso', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(state.ui.events.length).to.equal(5);
        });
        it('Deveria apresentar 3 elementos incluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(3);

          expect(incluido.elementos![0].rotulo).to.equal('§ 2º');
          expect(incluido.elementos![1].rotulo).to.equal('I –');
          expect(incluido.elementos![1].conteudo?.texto).to.equal('texto do inciso I do parágrafo 1 do artigo 3;');
          expect(incluido.elementos![2].rotulo).to.equal('II –');
          expect(incluido.elementos![2].conteudo?.texto).to.equal('texto do inciso II do parágrafo 1 do artigo 3.');
        });
        it('Deveria apresentar 2 elementos excluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(incluido.elementos!.length).equal(2);

          expect(incluido.elementos![0].rotulo).to.equal('I –');
          expect(incluido.elementos![1].rotulo).to.equal('II –');
        });
        it('Deveria apresentar o antigo parágrafo único no array de elementos no evento de ElementoModificado, com ambas versões do texto', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(renumerados.elementos!.length).equal(2);
          expect(renumerados.elementos![0].rotulo).equal('§ 1º');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do parágrafo 1 do Artigo 3 que possui incisos:');
          expect(renumerados.elementos![1].rotulo).equal('§ 1º');
          expect(renumerados.elementos![1].conteudo?.texto).equal('Texto do parágrafo 1 do ');
        });
        it('Deveria apresentar o antigo parágrafo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('§ 3º');
        });
        it('Deveria apresentar o antigo parágrafo único no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].mensagens![0].descricao).equal('Parágrafo deveria terminar com ponto');
        });
      });
    });
  });
});
