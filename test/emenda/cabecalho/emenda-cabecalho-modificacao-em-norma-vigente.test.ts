import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { DefaultState, State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { MPV_885_2019 } from './../../../demo/doc/mpv_885_2019';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com modficiação de dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  // Dê-se nova redação ao art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória, nos termos a seguir:

  it('modificacaoArtigoComCaput', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao art. 1º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('modificacaoParagrafo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao § 2º do art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('modificacaoParagrafoUnico', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art3_cpt_alt1_art4_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao caput do parágrafo único do art. 4º da Lei nº 8.745, de 9 de dezembro de 1993, como proposto pelo art. 3º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('modificacaoIncisoDoCaput', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao inciso VII do caput do art. 2º da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('modificacaoAlinea', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação à alínea “b” do inciso I do caput do art. 63-C da Lei nº 11.343, de 23 de agosto de 2006, como proposta pelo art. 2º da Medida Provisória, nos termos a seguir:'
    );
  });

  // Proposta de alteração de dispositivo da norma que não existia na proposição.
  it('modificacaoCaput', () => {
    const d = TesteCmdEmdUtil.incluiArtigo(state, 'art1_cpt_alt1_art1', false);
    d.numero = '1-1';
    d.createRotulo(d);
    (d.situacao as DispositivoAdicionado).existeNaNormaAlterada = true;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao art. 1º-A da Lei nº 7.560, de 19 de dezembro de 1986, como proposto pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });

  // TODO - Tratar bloco de alteração em inciso (outros dispositivos que não caput de artigo)

  it('modificacaoDoisIncisosSeguidos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par1_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par1_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação aos incisos I e II do § 1º do art. 5º da Lei nº 7.560, de 19 de dezembro de 1986, como propostos pelo art. 1º da Medida Provisória, nos termos a seguir:'
    );
  });
});
