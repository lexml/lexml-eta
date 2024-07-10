import { expect } from '@open-wc/testing';
import { CitacaoComandoDispPrj } from '../../../src/emenda/citacao-cmd-disp-prj';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Citação envolvendo alterações de agrupadores de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // Símbolos: § “a”

  // --------------------------------------------------------------------------------
  // Alteração de denominação

  it('Altera denominação de capítulo', () => {
    /*
     * 'Art. 1º-1. nononoono'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'tit1_cap1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p class="capitulo agrupador">“<Rotulo>CAPÍTULO I</Rotulo></p><p class="capitulo agrupador"> TEXTO”</p>');
  });
});
