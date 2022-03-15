import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com supressão de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // it('supressaoArtigo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o art. 1º do Projeto.');
  // });

  // it('supressaoDoisArtigosConsecutivos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art2');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 1º e 2º do Projeto.');
  // });

  // it('supressaoTresArtigos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art5');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 1º, 3º e 5º do Projeto.');
  // });

  // it('supressaoTresArtigosConsecutivos', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art5');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 3º a 5º do Projeto.');
  // });

  // it('supressaoDoisArtigosConsecutivosMaisUmArtigo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art5');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art7');
  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 3º a 5º e 7º do Projeto.');
  // });

  // it('supressaoUmArtigoMaisTresArtigosConsecutivosMaisUmArtigo', () => {
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art3');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art4');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art5');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art7');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 1º, 3º a 5º e 7º do Projeto.');
  // });

  // it('supressaoArtigoUnico() throws IOExcepti', on => {
  //   inicializaArquivo('PLS_ARTIGO_UNICO.xml');

  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o artigo único do Projeto.');
  // });

  // it('supressaoSequenciaDeArtigosEmAgrupadoresDiferentes() throws IOExcepti', on => {
  //   inicializaArquivo('PLS_ARTIGOS_AGRUPADOS.xml');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art6');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art7');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art8');

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 6º a 8º do Projeto.');
  // });

  // it('supressaoUmArtigoForaDeAgrupadorEUmEmAgrupador() throws IOExcepti', on => {
  //   inicializaArquivo('PLS_ARTIGO_FORA_DO_CAPITULO.xml');

  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   suprimePrimeiroArtigoDoSeparador('cap1', 0);

  //   const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandos()[0];

  //   expect(itemComandoEmenda.cabecalho).to.equal('Suprimam-se os arts. 1º e 2º do Projeto.');
  // });
});
