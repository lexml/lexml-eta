import { MPV_905_2019 } from './../../doc/mpv_905_2019';
import { State } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_002 } from '../../doc/emendas/emenda-002';
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
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_002.componentes[0].dispositivos });
      // eventos = getEventosQuePossuemElementos(state.ui!.events);
    });

    it('Deveria manter a ordem original dos artigos', () => {
      expect(state.articulacao!.artigos.map(a => a.id).join(',')).equal(idsArtigos);
    });

    it('Deveria possuir articulação com 7 capítulos', () => {
      expect(state.articulacao?.filhos.length).to.equal(7);
      expect(state.articulacao!.filhos.every(f => f.tipo === 'Capitulo')).to.be.true;
    });

    it('Deveria possuir primeiro capítulo com 1 filhos (seção antes Art. 1º)', () => {
      const cap = state.articulacao!.filhos[0];
      expect(cap.filhos.length).to.equal(1);
      expect(cap.filhos.every(f => f.tipo === 'Secao')).to.be.true;
    });

    it('Deveria possuir Seção Única do capítulo I com 2 filhos (subseção antes e depois de Art. 1º)', () => {
      const sec = state.articulacao!.filhos[0].filhos[0];
      expect(sec.filhos.length).to.equal(2);
      expect(sec.filhos.every(f => f.tipo === 'Subsecao')).to.be.true;

      expect(sec.filhos[0].id).to.equal('cap1_sec1_sub1');
      expect(sec.filhos[0].pai!.id).to.equal('cap1_sec1');

      expect(sec.filhos[1].id).to.equal('cap1_sec1_sub2');
      expect(sec.filhos[1].pai!.id).to.equal('cap1_sec1');
    });

    it('Deveria possuir Art. 1º filho de cap1_sec1_sub1', () => {
      expect(state.articulacao!.artigos[0].pai!.id).equal('cap1_sec1_sub2');
    });

    it('Deveria possuir Art. 2º filho de cap1_sec1_sub2', () => {
      expect(state.articulacao!.artigos[1].pai!.id).equal('cap1_sec1_sub2');
    });
  });
});
