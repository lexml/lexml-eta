import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acoes/acoes';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { redo } from '../../../src/redux/elemento/reducer/redo';
import { undo } from '../../../src/redux/elemento/reducer/undo';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTIGO_UNICO } from '../../doc/exemplo-artigo-unico';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de artigos, quando há artigo único', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGO_UNICO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  it('Deveria possui 1 artigo', () => {
    expect(state.articulacao.artigos.length).to.equal(1);
  });
  describe('Testando a inclusão do artigo resultante de um Enter no fim do texto, terminado com ponto, de um artigo único que não possui filhos (inclui undo e redo)', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigo após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo único como artigo 1º', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único.');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].texto).to.equal('');
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
      });
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![0].conteudo?.texto).equal('');
      });
      it('Deveria apresentar vazio o array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 1º');
        expect(validados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
      });
    });
    describe('Testando undo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando a articulação resultante da ação de desfazer a inclusão do artigo', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único.');
        });
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento removido', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
      });
    });
    describe('Testando redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigo após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo único como artigo 1º', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único.');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].texto).to.equal('');
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
      });
      describe('Testando os eventos resultantes do redo', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(eventos.length).to.equal(2);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          expect(eventos[0].elementos!.length).equal(1);
          expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
          expect(eventos[0].elementos![0].conteudo?.texto).equal('');
        });
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter antes do texto, terminado com ponto, de um artigo que não possui filhos (inclui undo e redo)', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: '' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'Texto do caput do artigo único.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigos após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('Texto do caput do artigo único.');
      });
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
      });
      it('Deveria apresentar as duas versões do antigo artigo único no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        expect(modificado.elementos![1].conteudo?.texto).equal('');
      });
      it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
      });
      it('Deveria apresentar um elemento no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 1º');
      });
    });
    describe('Testando undo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando a articulação resultante da ação de desfazer a inclusão do artigo', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único.');
        });
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(eventos.length).to.equal(3);
        });
        it('Deveria apresentar 1 elemento removido', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
        it('Deveria apresentar somente a versão mais atualizada do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(1);
          expect(modificado.elementos![0].rotulo).equal('Artigo único.');
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
      });
    });
    describe('Testando redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigos após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('Texto do caput do artigo único.');
      });
      describe('Testando os eventos resultantes da ação de redo', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(eventos.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
        it('Deveria apresentar o antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(2);
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
          expect(modificado.elementos![1].conteudo?.texto).equal('');
        });
        it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
        });
        it('Deveria apresentar um elemento no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('Art. 1º');
        });
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no meio do texto, terminado com ponto, de um artigo que não possui filhos (inclui undo e redo)', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput ' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'do Artigo único.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput ');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('do Artigo único.');
      });
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).equal('Art. 2º');
        expect(incluido.elementos![0].conteudo?.texto).equal('do Artigo único.');
      });
      it('Deveria apresentar as duas versões do antigo artigo único no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar o artigo 1 como primeiro no array de elementos no evento de ElementoRenumerado', () => {
        const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerado.elementos!.length).equal(1);
        expect(renumerado.elementos![0].rotulo).equal('Art. 1º');
        expect(renumerado.elementos![0].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoValidado', () => {
        const validado = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validado.elementos!.length).equal(1);
        expect(validado.elementos![0].conteudo?.texto).equal('Texto do caput ');
      });
    });
    describe('Testando undo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando a articulação resultante da ação de desfazer a inclusão do artigo', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único.');
        });
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(eventos.length).to.equal(3);
        });
        it('Deveria apresentar 1 elemento removido', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('do Artigo único.');
        });
        it('Deveria apresentar somente a versão mais atualizada do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(1);
          expect(modificado.elementos![0].rotulo).equal('Artigo único.');
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
        });
      });
    });
    describe('Testando redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput ');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('do Artigo único.');
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(eventos.length).to.equal(4);
        });
        it('Deveria apresentar 1 elemento incluído', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos![0].rotulo).equal('Art. 2º');
          expect(incluido.elementos![0].conteudo?.texto).equal('do Artigo único.');
        });
        it('Deveria apresentar o texto atualizado do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(2);
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único.');
          expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
        });
        it('Deveria apresentar o artigo 1 como primeiro no array de elementos no evento de ElementoRenumerado', () => {
          const renumerado = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerado.elementos!.length).equal(1);
          expect(renumerado.elementos![0].rotulo).equal('Art. 1º');
          expect(renumerado.elementos![0].conteudo?.texto).equal('Texto do caput ');
        });
        it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoValidado', () => {
          const validado = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validado.elementos!.length).equal(1);
          expect(validado.elementos![0].conteudo?.texto).equal('Texto do caput ');
        });
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no meio do texto, terminado com dois pontos, de um artigo que possui filhos (inclui undo e redo)', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput do artigo único:' } },
        novo: {
          tipo: TipoDispositivo.inciso.tipo,
        },
      });
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput ' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'do artigo único.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o novo artigo e o filho do artigo desmembrado no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(2);
        expect(incluido.elementos![0].conteudo?.texto).equal('do artigo único.');
        expect(incluido.elementos![1].rotulo).equal('I –');
        expect(incluido.elementos![1].conteudo?.texto).equal('');
      });
      it('Deveria apresentar o filho do artigo desmembrado no array de elementos removidos', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(1);
        expect(removido.elementos![0].rotulo).equal('I –');
      });
      it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
      });
      it('Deveria apresentar o texto do artigo único antes e depois da modificação para permitir o undo/redo', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o antigo artigo no array de elementos no evento de ElementoRenumerado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 1º');
      });
    });
    describe('Testando undo', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando a articulação resultante da ação de desfazer a inclusão do artigo', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único:');
        });
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(eventos.length).to.equal(4);
        });
        it('Deveria apresentar 2 elementos removidos', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(2);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('do artigo único.');
          expect(removido.elementos![1].rotulo).equal('I –');
          expect(removido.elementos![1].conteudo?.texto).equal('');
        });
        it('Deveria apresentar somente a versão mais atualizada do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(1);
          expect(modificado.elementos![0].rotulo).equal('Artigo único.');
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
      });
    });
    describe('Testando redo', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput ');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('do artigo único.');
      });
      describe('Testando os eventos resultantes da ação de undo/redo', () => {
        it('Deveria apresentar 5 eventos', () => {
          expect(eventos.length).to.equal(5);
        });
        it('Deveria apresentar o novo artigo e o filho do artigo desmembrado no array de elementos incluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(2);
          expect(incluido.elementos![0].conteudo?.texto).equal('do artigo único.');
          expect(incluido.elementos![1].rotulo).equal('I –');
          expect(incluido.elementos![1].conteudo?.texto).equal('');
        });
        it('Deveria apresentar o filho do artigo desmembrado no array de elementos removidos', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('I –');
        });
        it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(2);
        });
        it('Deveria apresentar o texto do artigo único antes e depois da modificação para permitir o undo/redo', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
          expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
        });
        it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
        });
        it('Deveria apresentar o antigo artigo no array de elementos no evento de ElementoRenumerado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('Art. 1º');
        });
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no fim do texto, terminado sem caracter de pontuação, de um artigo que possui filhos (inclui undo e redo)', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput do artigo único:' } },
        novo: {
          tipo: TipoDispositivo.inciso.tipo,
        },
      });
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput ' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput ');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('');
      });
    });
    describe('Testando os eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar o novo artigo e os filhos do artigo desmembrado no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
      });
      it('Deveria apresentar o novo artigo no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);

        expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('');
      });
      it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
      });
      it('Deveria apresentar o texto artigo 4 antes e depois da modificação para permitir o undo/redo', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o artigo modificado no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 1º');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Artigo deveria terminar com dois pontos');
      });
    });
    describe('Testando UNDO', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando articulação', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único:');
        });
      });
      describe('Testando oeventos', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(eventos.length).to.equal(3);
        });
        it('Deveria apresentar 2 elementos removidos', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('');
        });
        it('Deveria apresentar somente a versão mais atualizada do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(1);
          expect(modificado.elementos![0].rotulo).equal('Artigo único.');
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
      });
    });
    describe('Testando REDO', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput ');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('');
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no fim do texto, terminado com ponto, de um artigo que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput do artigo único:' } },
        novo: {
          tipo: TipoDispositivo.inciso.tipo,
        },
      });
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput.' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
    });
    describe('Testando articulação', () => {
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput.');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('');
      });
    });
    describe('Testando eventos', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar o novo artigo e os filhos do artigo desmembrado no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
      });
      it('Deveria apresentar o novo artigo no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
        expect(incluido.elementos![0].conteudo?.texto).to.equal('');

        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos!.length).equal(1);
      });
      it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
      });
      it('Deveria apresentar o texto artigo 4 antes e depois da modificação para permitir o undo/redo', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput.');
      });
      it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
      });
      it('Deveria apresentar o artigo modificado no array de elementos no evento de ElementoValidado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 1º');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Artigo deveria terminar com dois pontos');
      });
    });
    describe('Testando UNDO', () => {
      beforeEach(function () {
        state = undo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      describe('Testando a articulação resultante da ação de desfazer a inclusão do artigo', () => {
        it('Deveria possuir somente o artigo original', () => {
          expect(state.articulacao.artigos.length).to.equal(1);
        });
        it('Deveria retornar o antigo artigo único', () => {
          expect(state.articulacao.artigos[0].rotulo).to.equal('Artigo único.');
          expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput do artigo único:');
        });
      });
      describe('Testando os eventos resultantes da ação de undo', () => {
        it('Deveria apresentar 3 eventos', () => {
          expect(eventos.length).to.equal(3);
        });
        it('Deveria apresentar 2 elementos removidos', () => {
          const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
          expect(removido.elementos!.length).equal(1);
          expect(removido.elementos![0].rotulo).equal('Art. 2º');
          expect(removido.elementos![0].conteudo?.texto).equal('');
        });
        it('Deveria apresentar somente a versão mais atualizada do antigo artigo único no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(1);
          expect(modificado.elementos![0].rotulo).equal('Artigo único.');
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
        it('Deveria apresentar o artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Artigo único.');
          expect(renumerados.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
        });
      });
    });
    describe('Testando REDO', () => {
      beforeEach(function () {
        state = undo(state);
        state = redo(state);
        eventos = getEventosQuePossuemElementos(state.ui.events);
      });
      it('Deveria possuir 2 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(2);
      });
      it('Deveria retornar o antigo artigo 1º inalterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('Texto do caput.');
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
        expect(state.articulacao.artigos[1].texto).to.equal('');
      });
      describe('Testando os eventos', () => {
        it('Deveria apresentar 4 eventos', () => {
          expect(eventos.length).to.equal(4);
        });
        it('Deveria apresentar o novo artigo e os filhos do artigo desmembrado no array de elementos incluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos!.length).equal(1);
        });
        it('Deveria apresentar o novo artigo no array de elementos incluídos', () => {
          const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
          expect(incluido.elementos![0].rotulo).to.equal('Art. 2º');
          expect(incluido.elementos![0].conteudo?.texto).to.equal('');

          expect(incluido.elementos!.length).equal(1);
          expect(incluido.elementos!.length).equal(1);
        });
        it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos!.length).equal(2);
        });
        it('Deveria apresentar o texto artigo 4 antes e depois da modificação para permitir o undo/redo', () => {
          const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
          expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do artigo único:');
          expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput.');
        });
        it('Deveria apresentar o antigo artigo único no array de elementos no evento de ElementoRenumerado', () => {
          const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
          expect(renumerados.elementos!.length).equal(1);
          expect(renumerados.elementos![0].rotulo).equal('Art. 1º');
        });
        it('Deveria apresentar o artigo modificado no array de elementos no evento de ElementoValidado', () => {
          const validados = getEvento(state.ui.events, StateType.ElementoValidado);
          expect(validados.elementos!.length).equal(1);
          expect(validados.elementos![0].rotulo).equal('Art. 1º');
          expect(validados.elementos![0].mensagens![0].descricao).equal('Artigo deveria terminar com dois pontos');
        });
      });
    });
  });
});
