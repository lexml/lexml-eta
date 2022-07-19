import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com supressão dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  it('supressaoArtigo', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória.');
  });

  it('supressaoInciso', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se o inciso VII do caput do art. 2º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória.'
    );
  });

  it('supressaoIncisos', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1_inc1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprimam-se os incisos I e II do § 1º do art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como propostos pelo art. 1º da Medida Provisória.'
    );
  });

  it('supressaoAlineas', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali3');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprimam-se as alíneas “a” a “c” do inciso I do caput do art. 63-C da Lei nº 11.343, de 23 de agosto de 2006, como propostas pelo art. 2º da Medida Provisória.'
    );
  });

  it('supressaoIncisoEParagrafo', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprimam-se o inciso VII do caput do art. 2º e o § 1º do art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como propostos pelo art. 1º da Medida Provisória.'
    );
  });
});
