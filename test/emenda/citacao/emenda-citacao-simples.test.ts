import { expect } from '@open-wc/testing';
import { CitacaoComandoDispPrj } from '../../../src/emenda/citacao-cmd-disp-prj';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { DefaultState } from './../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from './../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com inclusão de artigos', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('acrescimoParagrafo', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<Citacao><p><Rotulo>“Parágrafo único.</Rotulo>Texto”</p></Citacao>');
  });
});
