import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com modificação de dispositivos', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // -----------------------------------------------------------
  // Caput

  it('modificacaoCaputSemIncisosEmArtigoSemParagrafos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao art. 1º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputSemIncisosEmArtigoComParagrafos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao caput do art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputComIncisosNaoModificadosEmArtigoSemParagrafos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao caput do art. 2º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputComIncisosNaoModificadosEmArtigoComParagrafosModificados', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao caput do art. 8º e ao parágrafo único do art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputComIncisosNaoModificadosEmArtigoComParagrafosNaoModificados', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao caput do art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputComIncisosModificadosEmArtigoComParagrafosNaoModificados', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt_inc1'); // Não aparece no comando por ser único
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao caput do art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoCaputComIncisosModificadosEmArtigoComParagrafosModificados', () => {
    // Modificação total do art. 8º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoDoisCaputUmSemIncisosOutroComIncisos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1'); // art. 1º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2'); // caput do art. 2º
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao art. 1º e ao caput do art. 2º do Projeto a seguinte redação:');
  });

  // -----------------------------------------------------
  // Parágrafo

  it('modificacaoParagrafoUnico', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao parágrafo único do art. 8º do Projeto a seguinte redação:');
  });

  it('modificacaoParagrafo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par3');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao § 3º do art. 9º do Projeto a seguinte redação:');
  });

  it('modificacao4ParagrafosMesmoArtigo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par3');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par4');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se aos §§ 1º e 3º a 5º do art. 9º do Projeto a seguinte redação:');
  });

  it('modificacao3ParagrafosArtigosDiferentes', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par3');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par4');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao parágrafo único do art. 8º e aos §§ 3º e 4º do art. 9º do Projeto' + ' a seguinte redação:');
  });

  it('modificacaoIntegralParagrafo', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc2');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao § 6º do art. 9º do Projeto a seguinte redação:');
  });

  // -----------------------------------------------------
  // Inciso

  it('modificacaoInciso', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao inciso II do § 6º do art. 9º do Projeto a seguinte redação:');
  });

  it('modificacao3Incisos1EmCaputE2EmParagrafo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao inciso I do caput do art. 8º e aos incisos I e II do § 6º do art. 9º do Projeto' + ' a seguinte redação:');
  });

  it('modificacaoIntegralInciso', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6_inc1_ali1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali2');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao inciso I do § 6º do art. 9º do Projeto a seguinte redação:');
  });

  // -----------------------------------------------------
  // Alínea “a”

  it('modificacaoAlinea', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à alínea “a” do inciso I do § 6º do art. 9º do Projeto a seguinte redação:');
  });

  it('modificacao2AlineasMesmoInciso', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se às alíneas “a” e “b” do inciso I do § 6º do art. 9º do Projeto a seguinte redação:');
  });

  it('modificacaoIntegralAlinea', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6_inc1_ali1_ite1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite2');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à alínea “a” do inciso I do § 6º do art. 9º do Projeto a seguinte redação:');
  });

  // -----------------------------------------------------
  // Item

  it('modificacaoItem', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se ao item 1 da alínea “a” do inciso I do § 6º do art. 9º do Projeto' + ' a seguinte redação:');
  });

  it('modificacao2ItensMesmaAlinea', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se aos itens 1 e 2 da alínea “a” do inciso I do § 6º do art. 9º do Projeto' + ' a seguinte redação:');
  });

  // -----------------------------------------------------
  // Misto

  it('modificacaoArtigoCaputParagrafoIncisoAlineaItem', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1'); // art. 1º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2'); // caput do art. 2º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u'); // parágrafo único do art. 8º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc2'); // inciso II do § 6º do art. 9º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali2'); // alínea “b” do inciso I do § 6º do art. 9º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite1'); // item 1 da alínea “a” do inciso I do § 6º
    // do art. 9º
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se ao art. 1º, ao caput do art. 2º, ao parágrafo único do art. 8º,' +
        ' ao item 1 da alínea “a” do inciso I do § 6º do art. 9º,' +
        ' à alínea “b” do inciso I do § 6º do art. 9º' +
        ' e ao inciso II do § 6º do art. 9º do Projeto a seguinte redação:'
    );
  });
});
