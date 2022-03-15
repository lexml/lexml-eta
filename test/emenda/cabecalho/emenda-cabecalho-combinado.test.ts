import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com adição, modificação e supressão de artigo e dispositivos de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // it('supressaoDispositivoSemFilhos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o § 1º do art. 9º do Projeto.');
  // });

  // it('supressaoDispositivoComFilhos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6_inc1');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o inciso I do § 6º do art. 9º do Projeto.');
  // });

  // it('supressaoDoisDispositivosConsecutivos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par2');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 1º e 2º do art. 9º do Projeto.');
  // });

  // it('supressaoTresDispositivos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par5');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 1º, 3º e 5º do art. 9º do Projeto.');
  // });

  // it('supressaoTresDispositivosConsecutivos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par2');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par3');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 1º a 3º do art. 9º do Projeto.');
  // });

  // it('supressaoDoisDispositivosConsecutivosMaisUmDispositivo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 3º, 4º e 7º do art. 9º do Projeto.');
  // });

  // it('supressaoUmDispositivoTresDispositivosConsecutivosEUmDispositivo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par5');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 1º, 3º a 5º e 7º do art. 9º do Projeto.');
  // });

  // it('supressaoParagrafoUnico', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_par1');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o parágrafo único do art. 8º do Projeto.');
  // });

  // it('supressaoDeParagrafoEAlinea', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par5');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6_inc1');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os §§ 1º e 3º a 5º do art. 9º e o inciso I do § 6º do art. 9º do Projeto.');
  // });

  // it('supressaoDeArtigoEDispositivosDeArtigo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_inc9');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_par1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se o inciso IX do caput do art. 2º, o art. 3º, o parágrafo único do art. 8º e o art. 9º do Projeto.');
  // });
});
