import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { State, StateType } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_012 } from '../../doc/emendas/emenda-012';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { moveElementoAcima } from '../../../src/redux/elemento/reducer/moveElementoAcima';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

let state: State;

describe('Testando movimentação de artigo com alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.EMENDA });
    state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_012.componentes[0].dispositivos });

    const dispositivo = buscaDispositivoById(state.articulacao!, 'art1-1')!;
    state = moveElementoAcima(state, { atual: createElemento(dispositivo) });
  });

  describe('Testando estrutura após movimentação', () => {
    it('Deveria não encontra Art. 1º-1', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art1-1');
      expect(dispositivo).to.be.undefined;
    });

    it('Deveria encontrar Art. 0', () => {
      const dispositivo = buscaDispositivoById(state.articulacao!, 'art0');
      expect(dispositivo).to.not.be.undefined;
    });

    it('Artigo 0 deveria possuir alteração de norma', () => {
      const alteracoes = buscaDispositivoById(state.articulacao!, 'art0')!.alteracoes!;
      expect(alteracoes).to.not.be.undefined;
      expect(alteracoes.filhos.length).to.be.equal(1);
    });

    it('Todos os dispositivos movidos deveriam possuir id iniciando com "art0"', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(buscaDispositivoById(state.articulacao!, 'art0')!);
      dispositivos.forEach(d => {
        expect(d.id).to.match(/^art0/);
      });
    });
  });

  describe('Testando eventos de atualização do editor', () => {
    it('Deveria possuir evento de exclusão', () => {
      const evExclusao = state.ui!.events.filter(ev => ev.stateType === StateType.ElementoRemovido);
      expect(evExclusao.length).to.be.equal(1);
      expect(evExclusao[0].elementos?.length).to.be.equal(5);
    });

    it('Deveria possuir evento de inclusão', () => {
      const evInclusao = state.ui!.events.filter(ev => ev.stateType === StateType.ElementoIncluido);
      expect(evInclusao.length).to.be.equal(1);
      expect(evInclusao[0].elementos?.length).to.be.equal(5);
    });
  });
});
