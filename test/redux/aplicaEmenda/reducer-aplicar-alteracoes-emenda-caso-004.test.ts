import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_1160_2023 } from './../../doc/mpv_1160_2023';
import { State } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_004 } from '../../doc/emendas/emenda-004';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

let state: State;
// let idsArtigos = '';

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_1160_2023, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
    // idsArtigos = state.articulacao!.artigos.map(a => a.id).join(',');
  });

  it('Deveria possuir articulação com 6 artigos', () => {
    expect(state.articulacao?.filhos.length).to.equal(6);
    expect(state.articulacao!.filhos.every(f => f.tipo === 'Artigo')).to.be.true;
    expect(state.articulacao!.artigos.length).to.equal(6);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_004.componentes[0].dispositivos });
    });

    it('Deveria possuir articulação com 7 artigos', () => {
      expect(state.articulacao?.filhos.length).to.equal(7);
      expect(state.articulacao!.filhos.every(f => f.tipo === 'Artigo')).to.be.true;
      expect(state.articulacao!.artigos.length).to.equal(7);
    });

    it('Deveria possuir artigo "5º-1" na articulação', () => {
      expect(state.articulacao!.artigos.map(a => a.id).join(',')).includes('art5-1');
    });

    it('Deveria possuir artigo "5º-1" com alterações', () => {
      const disp = buscaDispositivoById(state.articulacao!, 'art5-1')!;
      expect(disp.alteracoes).to.not.be.undefined;
      expect(disp.alteracoes?.filhos.length).to.equal(1);
    });
  });
});
