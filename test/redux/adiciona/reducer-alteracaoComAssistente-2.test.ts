import { State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { ASSISTENTE_ALTERACAO } from '../../../src/model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { adicionaAlteracaoComAssistente } from '../../../src/redux/elemento/reducer/adicionaAlteracaoComAssistente';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { adicionaElemento } from '../../../src/redux/elemento/reducer/adicionaElemento';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

let state: State;

describe('Testando a "sincronização" de ids em alteração de norma', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      const atual = createElemento(state.articulacao!.artigos[0])!;

      state = adicionaAlteracaoComAssistente(state, {
        type: ASSISTENTE_ALTERACAO,
        atual,
        norma: 'urn:lex:br:federal:lei:1986-12-19;7560',
        dispositivos: 'inciso I do § 1º do Art. 2º',
      });

      state = adicionaElemento(state, {
        type: ADICIONAR_ELEMENTO,
        atual,
        novo: {
          tipo: TipoDispositivo.artigo.tipo,
        },
        posicao: 'depois',
      });
    });

    it('Art. 1º-2 deveria possuir a alteração de norma', () => {
      const art1_2 = state.articulacao!.artigos[2];
      expect(art1_2.alteracoes).to.not.be.undefined;
      expect(art1_2.alteracoes?.filhos.length).to.equal(1);
    });

    it('Dispositivo "alteracoes" e seus respectivos filhos deveriam possuir id iniciando com "art1-2"', () => {
      const art1_2 = state.articulacao!.artigos[2];
      const dispositivos = getDispositivoAndFilhosAsLista(art1_2.alteracoes!);
      const inicioId = art1_2.id! + '_cpt_';
      expect(dispositivos.every(d => d.id?.startsWith(inicioId))).to.be.true;
    });
  });
});
