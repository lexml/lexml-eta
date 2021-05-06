import { expect } from '@open-wc/testing';
import { ArticulacaoParser } from '../../../src/model/lexml/service/articulacao-parser';
import { validaArticulacao } from '../../../src/redux/elemento-reducer';
import { getEvento } from '../../../src/redux/eventos';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_ARTICULACAO_COM_GENERICOS } from '../../doc/exemplo-articulacao-com-genericos';

let state: any;

describe('Testando a atualização de texto artigos e dispositivos de artigo', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_ARTICULACAO_COM_GENERICOS);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Inicialização do teste ', () => {
    beforeEach(function () {
      state = validaArticulacao(state);
    });
    it('Deveria apresentar evento de validação com 5 elementos', () => {
      const validados = getEvento(state.ui.events, StateType.ElementoValidado);
      expect(validados.elementos?.length).to.equal(5);
    });
  });
});
