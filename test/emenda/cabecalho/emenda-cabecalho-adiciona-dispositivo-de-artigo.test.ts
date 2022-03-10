import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com inclusão de dispositivos de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('Inclusão de um artigo', () => {
    const artigo = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    expect(artigo.rotulo).to.equal('Art. 1º-A');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A ao Projeto, com a seguinte redação:');
  });

  // --------------------------------------------------
  // Parágrafo

  it('acrescimoParagrafoUnico', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se parágrafo único ao art. 1º do Projeto, com a seguinte redação:');
  });

  it('acrescimoDoisParagrafosConsecutivos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1_par1u', false, 'art1_par2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se §§ 1º e 2º ao art. 1º do Projeto, com a seguinte redação:');
  });

  it('acrescimoTresParagrafosConsecutivos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1_par1u', false, 'art1_par2');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1_par2', false, 'art1_par3');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se §§ 1º a 3º ao art. 1º do Projeto, com a seguinte redação:');
  });

  it('acrescimoDoisParagrafosUnicosEmDoisArtigos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art3', false, 'art3_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se parágrafo único ao art. 1º e parágrafo único ao art. 3º do Projeto, com a seguinte redação:');
  });

  it('acrescimoDoisParagrafosEmDoisArtigos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art8_par1', false, 'art8_par2');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par7_inc2', false, 'art9_par8');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se § 2º ao art. 8º e § 8º ao art. 9º do Projeto, com a seguinte redação:');
  });

  it('acrescimoTresParagrafosEmDoisArtigos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1_par1u', false, 'art1_par2');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art3', false, 'art3_par1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se §§ 1º e 2º ao art. 1º e parágrafo único ao art. 3º do Projeto, com a seguinte redação:');
  });

  it('acrescimoQuatroParagrafosEmDoisArtigos', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1_par1u', false, 'art1_par2');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art3', false, 'art3_par1u');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art3_par1u', false, 'art3_par2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se §§ 1º e 2º ao art. 1º e §§ 1º e 2º ao art. 3º do Projeto, com a seguinte redação:');
  });

  // TODO - Acréscimo de parágrafo antes primeiro
  // it('acrescimoParagrafoAntesPrimeiro', () => {
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par1', true, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se § 0 ao art. 9º do Projeto, com a seguinte redação:');
  // });

  // --------------------------------------------------
  // Inciso

  it('acrescimoIncisoAoCaput', () => {
    TesteCmdEmdUtil.incluiInciso(state, 'art1_cpt', false, 'art1_cpt_inc1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se inciso I ao caput do art. 1º do Projeto, com a seguinte redação:');
  });

  // it('acrescimoDoisIncisosConsecutivos', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se incisos I e II ao § 1º do art. 9º do Projeto, com a seguinte redação:');
  // });

  // it('acrescimoTresIncisosConsecutivos', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se incisos I a III ao § 1º do art. 9º do Projeto, com a seguinte redação:');
  // });

  // it('acrescimoDoisIncisosEmDoisParagrafos', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se inciso I ao § 1º do art. 9º e inciso I' + ' ao § 2º do art. 9º do Projeto, com a seguinte redação:');
  // });

  // it('acrescimoDoisIncisosUmAntesOutroDepoisPrimeiro', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', true, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se incisos 0 e I-A ao § 6º do art. 9º do Projeto, com a seguinte redação:');
  // });

  // it('acrescimoTresIncisosEmDoisParagrafos', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par5', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se inciso I ao § 5º do art. 9º' + ' e incisos I-A e I-B ao § 6º do art. 9º do Projeto, com a seguinte redação:');
  // });

  // it('acrescimoQuatroIncisosEmDoisParagrafos', () => {
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par5', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par5', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiInciso(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se incisos I e II ao § 5º do art. 9º' + ' e incisos I-A e I-B ao § 6º do art. 9º do Projeto, com a seguinte redação:'
  //   );
  // });

  // --------------------------------------------------
  // Alínea

  // it('acrescimoAlinea', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se alínea “c” ao inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoDuasAlineasConsecutivas', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se alíneas “c” e “d” ao inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoTresAlineasConsecutivas', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se alíneas “c” a “e” ao inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoDuasAlineasEmDoisIncisos', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se alínea “c” ao inciso I do § 6º do art. 9º e alínea “a”' + ' ao inciso II do § 6º do art. 9º do Projeto, com a seguinte redação:'
  //   );
  // });

  // it('acrescimoDuasAlineasConsecutivasNoMeio', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se alíneas “a-A” e “a-B” ao inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoTresAlineasEmDoisIncisos', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', true, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', true, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se alíneas “0” e “0-A” ao inciso I do § 6º do art. 9º e alínea “a”' + ' ao inciso II do § 6º do art. 9º do Projeto, com a seguinte redação:'
  //   );
  // });

  // it('acrescimoQuatroAlineasEmDoisIncisos', () => {
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', true, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc1_ali1', true, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se alíneas “0” e “0-A” ao inciso I do § 6º do art. 9º e' + ' alíneas “a” e “b” ao inciso II do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:'
  //   );
  // });

  // // --------------------------------------------------
  // // Item

  // it('acrescimoItem', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se item 3 à alínea “a” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoDoisItemsConsecutivos', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se itens 3 e 4 à alínea “a” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoTresItemsConsecutivos', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se itens 3 a 5 à alínea “a” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoDoisItemsEmDuasAlineas', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se item 3 à alínea “a” do inciso I do § 6º do art. 9º e' + ' item 1 à alínea “b” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:'
  //   );
  // });

  // it('acrescimoDoisItensConsecutivosNoMeio', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se itens 1-A e 1-B à alínea “a” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:');
  // });

  // it('acrescimoTresItemsEmDuasAlineas', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', true, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', true, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se itens 0 e 0-A à alínea “a” do inciso I do § 6º do art. 9º e' + ' item 1 à alínea “b” do inciso I do § 6º do art. 9º do Projeto,' + ' com a seguinte redação:'
  //   );
  // });

  // it('acrescimoQuatroItemsEmDuasAlineas', () => {
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', true, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', true, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false, '');
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se itens 0 e 0-A à alínea “a” do inciso I do § 6º do art. 9º e' +
  //       ' itens 1 e 2 à alínea “b” do inciso I do § 6º do art. 9º do Projeto,' +
  //       ' com a seguinte redação:'
  //   );
  // });

  // // --------------------------------------------------
  // // Misto

  // it('acrescimoParagrafoAlineaParagrafoMesmoArtigo', () => {
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par1', true, '');
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false, '');
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9', false, '');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se § 0 ao art. 9º, alínea “a” ao inciso II do § 6º do art. 9º e' + ' § 8º ao art. 9º do Projeto, com a seguinte redação:'
  //   );
  // });

  // it('acrescimoArtigoParagrafoIncisoAlineaItem', () => {
  //   TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1'); // art. 1º-A
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art1-A', false); // art. 1º-A, parágrafo único (não deve aparecer , ''no
  //   // comando)
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art2', false); // art. 2º, parágrafo úni, ''co
  //   TesteCmdEmdUtil.incluiInciso(state, 'art8_par1', false); // art. 8º, § 1º, inciso, '' I
  //   TesteCmdEmdUtil.incluiAlinea(state, 'art9_par6_inc2', false); // art. 9º, § 6º, inciso II, alínea “, ''a”
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false); // art. 9º, § 6º, inciso I, alínea “b”, item, '' 1
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal(
  //     'Acrescentem-se art. 1º-A, parágrafo único ao art. 2º,' +
  //       ' inciso I ao parágrafo único do art. 8º,' +
  //       ' item 1 à alínea “b” do inciso I do § 6º do art. 9º' +
  //       ' e alínea “a” ao inciso II do § 6º do art. 9º do Projeto,' +
  //       ' com a seguinte redação:'
  //   );
  // });
});
