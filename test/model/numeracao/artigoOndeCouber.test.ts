import { State } from '../../../src/redux/state';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { REMOVER_ELEMENTO } from '../../../src/model/lexml/acao/removerElementoAction';
import { removeElemento } from '../../../src/redux/elemento/reducer/removeElemento';

let state: State;

describe('Testando numeração de emenda de "artigo onde couber"', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);

    const artigo = projetoNorma.articulacao!.artigos[0]!;
    artigo.rotulo = 'Art.';
    artigo.numero = '1';
    artigo.id = 'art1';
    artigo.texto = 'Teste 1.';
    artigo.caput!.texto = 'Teste 1.';
    const situacao = new DispositivoAdicionado();
    situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    artigo.situacao = situacao;

    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  it('Artigo inicial deveria possuir id "art1"', () => {
    const art1 = state.articulacao!.artigos[0];
    expect(art1.id).to.equal('art1');
  });

  it('Caput do artigo inicial deveria possuir id "art1_cpt"', () => {
    expect(state.articulacao!.artigos[0].caput!.id).to.equal('art1_cpt');
  });

  describe('Adiciona novo artigo antes do artigo "original"', () => {
    beforeEach(function () {
      const atual = createElemento(state.articulacao!.artigos[0])!;
      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual,
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
        posicao: 'antes',
      });
    });

    it('Segundo artigo deveria possuir texto "Teste 1."', () => {
      expect(state.articulacao!.artigos[1].texto).equal('Teste 1.');
    });

    it('Segundo artigo deveria possuir id "art2', () => {
      expect(state.articulacao!.artigos[1].id).equal('art2');
    });

    describe('Remove atual art1', () => {
      beforeEach(function () {
        const artigo = state.articulacao!.artigos[0];
        state = removeElemento(state, { type: REMOVER_ELEMENTO, atual: { tipo: TipoDispositivo.artigo.tipo, uuid: artigo.uuid! } });
      });

      it('Primeiro artigo deveria possuir id "art1"', () => {
        expect(state.articulacao!.artigos[0].id).equal('art1');
      });

      it('Caput do primeiro artigo deveria possuir id "art1_cpt"', () => {
        expect(state.articulacao!.artigos[0].caput!.id).equal('art1_cpt');
      });

      it('Primeiro artigo deveria possuir texto "Teste 1."', () => {
        expect(state.articulacao!.artigos[0].texto).equal('Teste 1.');
      });
    });
  });
});
