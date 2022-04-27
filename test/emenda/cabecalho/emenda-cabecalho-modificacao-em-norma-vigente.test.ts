import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com modficiação de dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // it('modificacaoArtigoComCaput', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_cpt', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Altere-se o art. 1º do Projeto para modificar o art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:');
  // });

  // it('modificacaoParagrafo', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par5', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 1º do Projeto para modificar o § 5º do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('modificacaoParagrafoUnico', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par1u', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 1º do Projeto para modificar o parágrafo único do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('modificacaoIncisoDoCaput', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_cpt_inc3', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 1º do Projeto para modificar o inciso III do caput do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('modificacaoAlinea', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par2_inc1_ali2', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 1º do Projeto para modificar a alínea “b” do inciso I do § 2º do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('modificacaoItemEmDecreto', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_DECRETO, 'art10_par2_inc1_ali2_ite8', false);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o art. 1º do Projeto' +
  //       ' para modificar o item 8 da alínea “b” do inciso I do § 2º do art. 10' +
  //       ' do Decreto nº 58.979, de 3 de agosto de 1966, nos termos a seguir:'
  //   );
  // });

  it('modificacaoCaput', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art6_cpt_alt1_art1').existeNaNormaAlterada = true;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Altere-se o art. 6º do Projeto para modificar o caput do art. 1º da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:');
  });

  it('modificacaoCaput2', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art6_cpt_alt1_art1').existeNaNormaAlterada = false;
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Altere-se o art. 6º do Projeto para modificar o caput do art. 1º da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:');
  });

  // TODO - Tratar bloco de alteração em inciso (outros dispositivos que não caput de artigo)

  // it('modificacaoIncisoSeguidoDeOmissis', () => {
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art7_cpt_inc1').situacaoNormaVigente = SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o inciso VII do caput do art. 2º do Projeto' +
  //       ' para modificar o caput do inciso I do caput do art. 7º da Lei nº 11.340,' +
  //       ' de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('modificacaoDoisIncisoEUmIncisoSeguidoDeOmissis', () => {
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art7_cpt_inc3').situacaoNormaVigente = SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art7_cpt_inc4').situacaoNormaVigente = SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art7_cpt_inc5').situacaoNormaVigente = SituacaoNormaVigente.DISPOSITIVO_EXISTENTE;
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o inciso VII do caput do art. 2º do Projeto' +
  //       ' para modificar os incisos III e IV do caput do art. 7º' +
  //       ' e o caput do inciso V do caput do art. 7º da Lei nº 11.340,' +
  //       ' de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });
});
