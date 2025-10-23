import { isArticulacao } from './../../../src/model/dispositivo/tipo';
import { getDispositivoAndFilhosAsLista, isAdicionado } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { State } from '../../../src/redux/state';
import { aplicaAlteracoesEmenda } from '../../../src/redux/elemento/reducer/aplicaAlteracoesEmenda';
import { EMENDA_011 } from '../../doc/emendas/emenda-011';
import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';

let state: State;

describe('Testando carregamento da MPV 905/2019', () => {
  beforeEach(function () {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    state = elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  });

  it('Deveria possuir articulação com 7 capítulos', () => {
    expect(state.articulacao?.filhos.length).to.equal(7);
    expect(state.articulacao!.filhos.every(f => f.tipo === 'Capitulo')).to.be.true;
    expect(state.articulacao!.artigos.length).to.equal(53);
  });

  describe('Testando aplicação de dispositivos emendados', () => {
    beforeEach(function () {
      state = aplicaAlteracoesEmenda(state, { alteracoesEmenda: EMENDA_011.componentes[0].dispositivos });
    });

    it('Deveria possuir 4 dispositivos adicionados', () => {
      const dispositivos = getDispositivoAndFilhosAsLista(state.articulacao!).filter(d => isAdicionado(d) && !isArticulacao(d));
      expect(dispositivos.length).to.equal(4);
    });
  });
});
