import { StateEvent, StateType, State } from '../../../src/redux/state';
import { getEvento, getEventosQuePossuemElementos } from '../../../src/redux/elemento/evento/eventosUtil';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { EMENDA_001 } from '../../doc/emendas/emenda-001';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

let state: State;
let eventos: StateEvent[];

describe('Testando carregamento da MPV 885/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
  });
  it('Deveria possuir articulação com 5 artigos', () => {
    const nFilhos = state.articulacao?.filhos.length;
    const nArt = state.articulacao?.filhos.filter(f => f.tipo === 'Artigo').length;
    expect(nFilhos).to.equal(5);
    expect(nArt).to.equal(nFilhos);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_001.componentes[0].dispositivos });
      eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Testando se articulação possui apenas 1 filho (Capítulo I) ', () => {
      const d = state.articulacao!.filhos[0];
      expect(d.tipo).equal('Capitulo');
      expect(d.id).equal('cap1');
      expect(d.texto).equal('CAP 1');
      expect(d.rotulo).equal('CAPÍTULO ÚNICO');
      expect(d.pai).equal(state.articulacao);
      expect(d.filhos.length).equal(1);
      expect(d.filhos[0].id).equal('cap1_sec1');
      expect(state.articulacao?.filhos.length).equal(1);

      const incluidos = getEvento(eventos, StateType.ElementoIncluido);
      expect(incluidos.elementos?.length).equal(1);
      expect(incluidos.referencia?.tipo).equal('Ementa');
      expect(incluidos.referencia?.lexmlId ?? '').equal('ementa');
    });
  });
});
