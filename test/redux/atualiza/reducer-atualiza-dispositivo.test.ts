import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { ArticulacaoParser } from '../../../src/model/lexml/parser/articulacao-parser';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipo-dispositivo';
import { ATUALIZAR_ELEMENTO } from '../../../src/redux/elemento-actions';
import { atualizaElemento } from '../../../src/redux/elemento-reducer';
import { StateType } from '../../../src/redux/state';
import { EXEMPLO_SEM_AGRUPADORES } from '../../doc/exemplo-sem-agrupadores';

let state: any;

describe('Testando a validação da articulação', () => {
  beforeEach(function () {
    const articulacao = ArticulacaoParser.load(EXEMPLO_SEM_AGRUPADORES);
    articulacao.renumeraArtigos();
    state = {
      articulacao,
    };
  });
  describe('Inicialização do teste ', () => {
    beforeEach(function () {
      const artigo3 = state.articulacao.artigos.filter((artigo: Artigo) => artigo.numero === '3')[0];
      state = atualizaElemento(state, { type: ATUALIZAR_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo3.uuid!, conteudo: { texto: 'novo texto:' } } });
    });
    it('Deveria atualizar o texto', () => {
      expect(state.articulacao.artigos[2].texto).to.equal('novo texto:');
    });
    it('Deveria apresentar evento de modificação com 1 elemento', () => {
      expect(state.ui.events[0].stateType).to.equal(StateType.ElementoModificado);
      expect(state.ui.events[0].elementos.length).to.equal(1);
    });
  });
});
