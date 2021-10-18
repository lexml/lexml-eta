import { expect } from '@open-wc/testing';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acoes/acoes';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacaoParser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';
import { EXEMPLO_DISPOSITIVOS_ARTIGO } from '../../doc/exemplo-dispositivos-artigo';

let state: any;

describe('Testando a exclusão de dispositivos de artigo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_DISPOSITIVOS_ARTIGO);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Testando a exclusão do inciso I do caput do artigo 1, que é único filho e não possui filhos', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[0].filhos[0];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do único inciso do caput do artigo 1', () => {
      it('Deveria apresentar o artigo não possuindo filhos', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(0);
      });
      describe('Testando os eventos resultantes da ação de exclusão do inciso', () => {
        it('Deveria apresentar 1 evento', () => {
          expect(state.ui.events.length).to.equal(1);
        });
        it('Deveria apresentar 1 elemento removido já que o inciso não possui filhos', () => {
          expect(state.ui.events[0].elementos.length).equal(1);
        });
        it('Deveria apresentar o inciso no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('texto do inciso do caput do Artigo 1.');
        });
      });
    });
  });
  describe('Testando a exclusão do inciso I do caput do artigo 2, com duas alineas, que possui um inciso posterior ', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[1].filhos[0];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do inciso I do caput do artigo 2', () => {
      it('Deveria apresentar o artigo possuindo um filho', () => {
        expect(state.articulacao.artigos[1].filhos.length).to.equal(1);
      });
      describe('Testando os eventos resultantes da ação de exclusão do inciso', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 6 elementos removidos', () => {
          expect(state.ui.events[0].elementos.length).equal(6);
          expect(state.ui.events[0].elementos[0].rotulo).equal('I –');
          expect(state.ui.events[0].elementos[1].rotulo).equal('a)');
          expect(state.ui.events[0].elementos[2].rotulo).equal('1.');
          expect(state.ui.events[0].elementos[3].rotulo).equal('b)');
          expect(state.ui.events[0].elementos[4].rotulo).equal('1.');
          expect(state.ui.events[0].elementos[5].rotulo).equal('2.');
        });
        it('Deveria apresentar o inciso no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('texto do inciso I do caput do Artigo 2:');
        });
        it('Deveria apresentar o inciso posterior no evento de ElementoRenumerado', () => {
          expect(state.ui.events[1].elementos.length).equal(1);
        });
        it('Deveria apresentar o inciso posterior renumerado como novo inciso I', () => {
          expect(state.ui.events[1].elementos[0].rotulo).equal('I –');
        });
      });
    });
  });
  describe('Testando a exclusão do inciso 2 do caput do artigo 2, sem alíneas, que possui um inciso anterior com duas alineas', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[1].filhos[1];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do inciso II do caput do artigo 2', () => {
      it('Deveria apresentar o artigo possuindo apenas 1 filho', () => {
        expect(state.articulacao.artigos[1].filhos.length).to.equal(1);
      });
      describe('Testando os eventos resultantes da ação de exclusão do inciso', () => {
        it('Deveria apresentar 1 evento', () => {
          expect(state.ui.events.length).to.equal(1);
        });
        it('Deveria apresentar 1 elemento removido já que o inciso não possui filhos', () => {
          expect(state.ui.events[0].elementos.length).equal(1);
          expect(state.ui.events[0].elementos[0].rotulo).equal('II –');
        });
        it('Deveria apresentar o inciso no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('texto do inciso II do caput do Artigo 2.');
        });
      });
    });
  });
  describe('Testando a exclusão do inciso 1 do caput do artigo 2, que possui duas alineas', () => {
    beforeEach(function () {
      const inciso = state.articulacao.artigos[1].filhos[0];
      state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.inciso.tipo, uuid: inciso.uuid! } });
    });
    describe('Verificando a estrutura resultante da ação de exclusão do inciso I do caput do artigo 2', () => {
      it('Deveria apresentar o artigo não possuindo filhos', () => {
        expect(state.articulacao.artigos[0].filhos.length).to.equal(1);
      });
      describe('Testando os eventos resultantes da ação de exclusão do inciso', () => {
        it('Deveria apresentar 2 eventos', () => {
          expect(state.ui.events.length).to.equal(2);
        });
        it('Deveria apresentar 5 elementos', () => {
          expect(state.ui.events[0].elementos.length).equal(6);
        });
        it('Deveria apresentar o inciso, alineas e itens no evento de ElementoRemoved', () => {
          expect(state.ui.events[0].elementos[0].conteudo.texto).equal('texto do inciso I do caput do Artigo 2:');
          expect(state.ui.events[0].elementos[1].conteudo.texto).equal('texto da alinea 1 do inciso 1 do caput do artigo 2:');
          expect(state.ui.events[0].elementos[2].conteudo.texto).equal('texto do item 1 da alinea 1 do inciso 1 do caput do artigo 2.');
          expect(state.ui.events[0].elementos[3].conteudo.texto).equal('texto da alinea 2 do inciso 1 do caput do artigo 2:');
          expect(state.ui.events[0].elementos[4].conteudo.texto).equal('texto do item 1 da alinea 2 do inciso 1 do caput do artigo 2;');
          expect(state.ui.events[0].elementos[5].conteudo.texto).equal('texto do item 2 da alinea 2 do inciso 1 do caput do artigo 2.');
        });
        it('Deveria apresentar o antigo inciso 2 no evento de ElementoRenumerado', () => {
          expect(state.ui.events[1].elementos.length).equal(1);
          expect(state.ui.events[1].elementos[0].conteudo.texto).equal('texto do inciso II do caput do Artigo 2.');
        });
      });
    });
  });
});
