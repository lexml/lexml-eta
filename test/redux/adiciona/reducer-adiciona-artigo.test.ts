import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { ADICIONAR_ELEMENTO } from '../../../src/redux/elemento/action/elementoAction';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { StateEvent, StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;
let eventos: StateEvent[];

describe('Testando a inclusão de artigos', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTIGOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  it('Deveria possui 5 artigos', () => {
    expect(state.articulacao.artigos.length).to.equal(5);
  });
  describe('Testando a inclusão do artigo resultante de um Enter no fim do texto, terminado com ponto, de um artigo que não possui filhos', () => {
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
    describe('Testando a articulação resultante da ação de inclusão do artigo no meio da articulação', () => {
      it('Deveria possuir 6 artigos após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria retornar o novo artigo como artigo 2º', () => {
        expect(state.articulacao.artigos[1].texto).to.equal('');
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
      });
      it('Deveria apresentar o último artigo renumerado para 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        expect(eventos[0].elementos!.length).equal(1);
        expect(eventos[0].elementos![0].rotulo).equal('Art. 2º');
        expect(eventos[0].elementos![0].conteudo?.texto).equal('');
      });
      it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(getEvento(state.ui.events, StateType.ElementoRenumerado).elementos!.length).equal(4);
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no fim do texto, terminado com ponto, do último artigo que não possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[4];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput do Artigo 5.' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo ao final da lista', () => {
      it('Deveria possuir 6 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria apresentar como último artigo o artigo 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 1 evento', () => {
        expect(eventos.length).to.equal(1);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).equal('Art. 6º');
        expect(incluido.elementos![0].conteudo?.texto).equal('');
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter antes do texto, terminado com ponto, de um artigo que não possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: '' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'Texto do caput do Artigo 1.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo no meio da articulação', () => {
      it('Deveria possuir 6 artigos após incluir o artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria retornar o antigo artigo 1º alterado', () => {
        expect(state.articulacao.artigos[0].rotulo).to.equal('Art. 1º');
        expect(state.articulacao.artigos[0].texto).to.equal('');
      });
      it('Deveria retornar o novo artigo como artigo 2º com o texto do artigo 1º', () => {
        expect(state.articulacao.artigos[1].texto).to.equal('Texto do caput do Artigo 1.');
        expect(state.articulacao.artigos[1].rotulo).to.equal('Art. 2º');
      });
      it('Deveria apresentar o último artigo renumerado para 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        expect(getEvento(state.ui.events, StateType.ElementoIncluido).elementos!.length).equal(1);
        expect(getEvento(state.ui.events, StateType.ElementoIncluido).elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 1.');
      });
      it('Deveria apresentar os artigos subsequentes no evento de ElementoRenumerado', () => {
        expect(getEvento(state.ui.events, StateType.ElementoRenumerado).elementos!.length).equal(4);
      });
      it('Deveria apresentar um elemento no array de elementos no evento de ElementoValidado', () => {
        expect(getEvento(state.ui.events, StateType.ElementoValidado).elementos!.length).equal(1);
        expect(getEvento(state.ui.events, StateType.ElementoValidado).elementos![0].rotulo).equal('Art. 1º');
        expect(getEvento(state.ui.events, StateType.ElementoValidado).elementos![0].mensagens?.length).equal(1);
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no meio do texto, terminado com ponto, de um artigo que não possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[4];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput ' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'do Artigo 5.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo ao final da lista', () => {
      it('Deveria possuir 6 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria apresentar como último artigo o artigo 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 3 eventos', () => {
        expect(eventos.length).to.equal(3);
      });
      it('Deveria apresentar 1 elemento incluído', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).equal('Art. 6º');
        expect(incluido.elementos![0].conteudo?.texto).equal('do Artigo 5.');
      });
      it('Deveria apresentar o artigo 5 no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
        expect(modificado.elementos![0].rotulo).equal('Art. 5º');
      });
      it('Deveria apresentar o texto artigo 5 antes e depois da modificação para permitir o undo/redo', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 5.');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar vazio o array de elementos no evento de ElementoValidado', () => {
        const validado = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validado.elementos!.length).equal(1);
        expect(validado.elementos![0].rotulo).equal('Art. 5º');
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no meio do texto, terminado com dois pontos, de um artigo que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput ' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
          conteudo: {
            texto: 'do Artigo 4.',
          },
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo ao final da lista', () => {
      it('Deveria possuir 6 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria apresentar como último artigo o artigo 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 5 eventos', () => {
        expect(eventos.length).to.equal(5);
      });
      it('Deveria apresentar o novo artigo e os filhos do artigo desmembrado no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(11);
      });
      it('Deveria apresentar os filhos do artigo desmembrado no array de elementos removidos', () => {
        const removido = getEvento(state.ui.events, StateType.ElementoRemovido);
        expect(removido.elementos!.length).equal(10);
      });
      it('Deveria apresentar duas vezes o artigo 4 no evento de ElementoModificado', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos!.length).equal(2);
      });
      it('Deveria apresentar o texto artigo 4 antes e depois da modificação para permitir o undo/redo', () => {
        const modificado = getEvento(state.ui.events, StateType.ElementoModificado);
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 4:');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput ');
      });
      it('Deveria apresentar o último artigo no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('Art. 6º');
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no fim do texto, terminado com dois pontos, de um artigo que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo ao final da lista', () => {
      it('Deveria possuir 5 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(5);
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do dispositivo', () => {
      it('Deveria apresentar 2 eventos', () => {
        expect(eventos.length).to.equal(2);
      });
      it('Deveria apresentar o novo dispositivo criado sob o artigo 1º no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
        expect(incluido.elementos![0].rotulo).equal('I –');
        expect(incluido.elementos![0].conteudo?.texto).equal('');
      });
      it('Deveria apresentar os incisos seguintes ao inclído no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(4);
        expect(renumerados.elementos![0].rotulo).equal('II –');
        expect(renumerados.elementos![0].conteudo?.texto).equal('texto do inciso 1 do caput do artigo 4:');
      });
    });
  });
  describe('Testando a inclusão de artigo resultante de um Enter no fim do texto, terminado com ponto, de um artigo que possui filhos', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[3];
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        hasDesmembramento: true,
        atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid, conteudo: { texto: 'Texto do caput do Artigo 4.' } },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
      eventos = getEventosQuePossuemElementos(state.ui.events);
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo', () => {
      it('Deveria possuir 6 artigos após a inclusão do artigo', () => {
        expect(state.articulacao.artigos.length).to.equal(6);
      });
      it('Deveria apresentar como último artigo o artigo 6º', () => {
        expect(state.articulacao.artigos[5].rotulo).to.equal('Art. 6º');
      });
    });
    describe('Testando os eventos resultantes da ação de inclusão do artigo', () => {
      it('Deveria apresentar 4 eventos', () => {
        expect(eventos.length).to.equal(4);
      });
      it('Deveria apresentar o novo artigo e os filhos do artigo desmembrado no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos!.length).equal(1);
      });
      it('Deveria apresentar o novo artigo no array de elementos incluídos', () => {
        const incluido = getEvento(state.ui.events, StateType.ElementoIncluido);
        expect(incluido.elementos![0].rotulo).to.equal('Art. 5º');
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
        expect(modificado.elementos![0].conteudo?.texto).equal('Texto do caput do Artigo 4:');
        expect(modificado.elementos![1].conteudo?.texto).equal('Texto do caput do Artigo 4.');
      });
      it('Deveria apresentar o último artigo no array de elementos no evento de ElementoRenumerado', () => {
        const renumerados = getEvento(state.ui.events, StateType.ElementoRenumerado);
        expect(renumerados.elementos!.length).equal(1);
        expect(renumerados.elementos![0].rotulo).equal('Art. 6º');
      });
      it('Deveria apresentar o artigo modificado no array de elementos no evento de ElementoRenumerado', () => {
        const validados = getEvento(state.ui.events, StateType.ElementoValidado);
        expect(validados.elementos!.length).equal(1);
        expect(validados.elementos![0].rotulo).equal('Art. 4º');
        expect(validados.elementos![0].mensagens![0].descricao).equal('Artigo deveria terminar com dois pontos');
      });
    });
  });
});
