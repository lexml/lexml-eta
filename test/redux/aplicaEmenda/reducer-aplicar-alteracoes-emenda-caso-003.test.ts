import { buscaDispositivoById } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { State } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_003 } from '../../doc/emendas/emenda-003';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';

let state: State;
// let eventos: StateEvent[];
let idsArtigos = '';

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = {} as any;
    idsArtigos = state.articulacao!.artigos.map(a => a.id).join(',');
  });

  it('Deveria possuir articulação com 7 capítulos', () => {
    expect(state.articulacao?.filhos.length).to.equal(7);
    expect(state.articulacao!.filhos.every(f => f.tipo === 'Capitulo')).to.be.true;
  });

  it('Deveria possuir articulação com 53 artigos', () => {
    expect(state.articulacao?.filhos.length).to.equal(7);
    expect(state.articulacao!.artigos.length).to.equal(53);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_003.componentes[0].dispositivos });
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Deveria manter a ordem original dos artigos', () => {
      expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
    });

    it('Deveria possuir articulação com 3 livros', () => {
      expect(state.articulacao?.filhos.length).to.equal(3);
      expect(state.articulacao!.filhos.every(f => f.tipo === 'Livro')).to.be.true;
    });

    it('Deveria possuir cada livro com apenas 1 filho (título)', () => {
      expect(state.articulacao?.filhos[0].filhos.length).to.equal(1);
      expect(state.articulacao?.filhos[1].filhos.length).to.equal(1);
      expect(state.articulacao?.filhos[2].filhos.length).to.equal(1);
    });

    it('Deveria possuir capítulo I, do título único do Livro I com 18 filhos (artigos)', () => {
      const cap = buscaDispositivoById(state.articulacao!, 'liv1_tit1_cap1')!;
      expect(cap.filhos.length).to.equal(18);
      expect(cap.filhos.every(f => f.tipo === 'Artigo')).to.be.true;
      expect(cap.filhos.every(f => f.pai?.id === 'liv1_tit1_cap1')).to.be.true;
    });

    it('Deveria possuir capítulo II, do título único do Livro II sem filhos', () => {
      const cap = buscaDispositivoById(state.articulacao!, 'liv2_tit1_cap2')!;
      expect(cap.filhos.length).to.equal(0);
    });

    it('Deveria possuir título único do Livro III com 11 filhos (6 artigos, 5 capítulos)', () => {
      const cap = buscaDispositivoById(state.articulacao!, 'liv3_tit1')!;
      expect(cap.filhos.length).to.equal(11);
      expect(cap.filhos.filter(f => f.tipo === 'Artigo').length).equal(6);
      expect(cap.filhos.filter(f => f.tipo === 'Capitulo').length).equal(5);
      expect(cap.filhos.every(f => f.pai?.id === 'liv3_tit1')).to.be.true;
    });
  });
});
