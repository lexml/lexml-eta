import { expect } from '@open-wc/testing';
import { TipoDispositivo } from '../../../src/model/dispositivo/tipo';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { ADICIONAR_ELEMENTO } from '../../../src/redux/elemento-actions';
import { adicionaElemento } from '../../../src/redux/elemento-reducer';
import { EXEMPLO_ARTIGOS } from '../../doc/exemplo-artigos';

let state: any;

describe('Testando a inclusão de dispositivos de alteração', () => {
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
  describe('Testando a criação do bloco de alteração a partir de uma pattern no conteúdo do texto', () => {
    beforeEach(function () {
      const artigo = state.articulacao.artigos[0];
      state = adicionaElemento(state, {
        atual: {
          type: ADICIONAR_ELEMENTO,
          tipo: TipoDispositivo.artigo.tipo,
          uuid: artigo.uuid,
          conteudo: { texto: 'abc passa a vigorar com a seguinte alteração:' },
          hierarquia: {
            tipo: artigo.pai.tipo,
            uuid: artigo.pai.uuid,
          },
        },
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
      });
    });
    describe('Testando a articulação resultante da ação de inclusão do artigo no meio da articulação', () => {
      it('Deveria apresentar bloco de alteracao no dispositivo atualizado', () => {
        expect(state.articulacao.artigos[0].texto).to.equal('abc passa a vigorar com a seguinte alteração:');
        expect(state.articulacao.artigos[0].hasAlteracao()).to.true;
        expect(state.articulacao.artigos[0].alteracoes[0].filhos.length === 1);
      });
    });
  });
});
