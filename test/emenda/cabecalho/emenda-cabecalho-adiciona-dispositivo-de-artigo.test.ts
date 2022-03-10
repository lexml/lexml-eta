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
});
