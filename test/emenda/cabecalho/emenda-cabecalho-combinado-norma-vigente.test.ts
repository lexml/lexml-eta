import { DispositivoAdicionado } from './../../../src/model/lexml/situacao/dispositivoAdicionado';
import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com diferentes operações sobre dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  it('alteracaoCaputESupressaoInciso', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao <i>caput</i> do art. 2º; e suprima-se o inciso VII do <i>caput</i> do art. 2º, ambos da Lei nº 7.560, de 19 de dezembro de 1986, como propostos pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('supressaoIncisoEAlteracaoCaput', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se o inciso VII do <i>caput</i> do art. 2º; e dê-se nova redação ao <i>caput</i> do art. 5º, ambos da Lei nº 7.560, de 19 de dezembro de 1986, como propostos pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('alteracaoCaputSupressaoIncisoAdicaoParagrafo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    const d = TesteCmdEmdUtil.incluiParagrafoAlteracao(state, 'art1_cpt_alt1_art5_par3', false);
    d.numero = '3-1';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao <i>caput</i> do art. 2º; suprima-se o inciso VII do <i>caput</i> do art. 2º; e acrescente-se § 3º-A ao art. 5º, todos da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('adicoesAlteracaoSupressoes', () => {
    let d = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1_cpt_alt1_art1');
    d.numero = '1-1';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    d = TesteCmdEmdUtil.incluiArtigoAntes(state, 'art1_cpt_alt1_art2');
    d.numero = '1-2';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = false;
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1_inc1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescentem-se arts. 1º-A e 1º-B; dê-se nova redação ao <i>caput</i> do art. 2º; e suprimam-se os incisos I e II do § 1º do art. 5º, todos da Lei nº 7.560, de 19 de dezembro de 1986, na forma proposta pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });
});
