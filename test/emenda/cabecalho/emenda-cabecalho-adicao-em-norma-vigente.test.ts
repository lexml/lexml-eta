import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com adição de dispositivos em alteração de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // it('acrescimoArtigoComCaput', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_cpt', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   // expect(itemComandoEmenda.cabecalho).to.equal('Altere-se o caput do art. 1º do Projeto para acrescentar art. 10 à Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:');
  //   expect('xxxx').to.equal('Altere-se o caput do art. 1º do Projeto para acrescentar art. 10 à Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:');
  // });

  // it('acrescimoParagrafo', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par5', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 1º do Projeto para acrescentar § 5º ao art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('acrescimoParagrafoUnico', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par1u', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 1º do Projeto para acrescentar parágrafo único ao art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('acrescimoIncisoDoCaput', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_cpt_inc3', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 1º do Projeto para acrescentar inciso III ao caput do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('acrescimoAlinea', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par2_inc1_ali2', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 1º do Projeto para acrescentar alínea “b” ao inciso I do § 2º do art. 10 da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });

  // it('acrescimoItemEmDecreto', () => {
  //   TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, 'art1_cpt', TesteCmdEmdUtil.URN_DECRETO, 'art10_par2_inc1_ali2_ite8', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 1º do Projeto' +
  //       ' para acrescentar item 8 à alínea “b” do inciso I do § 2º do art. 10' +
  //       ' do Decreto nº 58.979, de 3 de agosto de 1966, nos termos a seguir:'
  //   );
  // });

  // it('acrescimoInciso', () => {
  //   TesteCmdEmdUtil.incluiDispositivoEmAlteracaoDeNormaVigente(state, 'art6_cpt_alt1_art1_cpt_inc4', true);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Altere-se o caput do art. 6º do Projeto para acrescentar inciso IV ao caput do art. 1º da Lei nº 11.340, de 7 de agosto de 2006, nos termos a seguir:'
  //   );
  // });
});
