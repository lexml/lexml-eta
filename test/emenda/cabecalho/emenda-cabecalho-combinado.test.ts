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

  it('supressaoAdicao', () => {
    TesteCmdEmdUtil.incluiArtigo(state, 'art4', false);
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o art. 1º; e acrescente-se art. 4º-A ao Projeto, nos termos a seguir:');
  });

  it('supressaoAdicaoModificacao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9');
    TesteCmdEmdUtil.incluiArtigo(state, 'art4', false);
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o art. 1º; acrescente-se art. 4º-A; e dê-se nova redação ao caput do art. 9º do Projeto, nos termos a seguir:');
  });

  it('supressaoModificacao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o art. 1º; e dê-se nova redação ao caput do art. 9º do Projeto, nos termos a seguir:');
  });

  it('supressaoModificacaoAdicao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par5');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par3', false, 'art9_par3-1');
    TesteCmdEmdUtil.incluiArtigo(state, 'art9', false);
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprimam-se o art. 1º e o § 2º do art. 9º;' +
        ' dê-se nova redação ao caput do art. 9º e ao § 5º do art. 9º;' +
        ' e acrescentem-se § 3º-A ao art. 9º e art. 10 ao Projeto,' +
        ' nos termos a seguir:'
    );
  });

  it('adicaoSupressao', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art4');
    TesteCmdEmdUtil.incluiArtigo(state, 'art1', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A; e suprima-se o art. 4º do Projeto, nos termos a seguir:');
  });

  it('adicaoSupressaoModificacao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par7');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art4');
    TesteCmdEmdUtil.incluiArtigo(state, 'art1', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A; suprima-se o art. 4º; e dê-se nova redação ao § 7º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('adicaoModificacao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par7');
    TesteCmdEmdUtil.incluiArtigo(state, 'art1', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A; e dê-se nova redação ao § 7º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('adicaoModificacaoSupressao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art4');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
    TesteCmdEmdUtil.incluiArtigo(state, 'art1', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-A; dê-se nova redação ao art. 4º; e suprima-se o § 7º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('modificacaoSupressao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art4');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se nova redação ao art. 4º; e suprima-se o § 7º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('modificacaoSupressaoAdicao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art4');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_cpt_inc1');
    TesteCmdEmdUtil.incluiParagrafo(state, 'art8', false, 'art8_par2');
    TesteCmdEmdUtil.incluiArtigo(state, 'art9', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação ao caput do art. 2º e ao art. 4º;' +
        ' suprimam-se o inciso I do caput do art. 8º e o § 7º do art. 9º;' +
        ' e acrescentem-se § 2º ao art. 8º e art. 10 ao Projeto,' +
        ' nos termos a seguir:'
    );
  });

  it('modificacaoAdicao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art4');
    TesteCmdEmdUtil.incluiArtigo(state, 'art9', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se nova redação ao art. 4º; e acrescente-se art. 10 ao Projeto, nos termos a seguir:');
  });

  it('modificacaoAdicaoSupressao', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art4');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
    TesteCmdEmdUtil.incluiArtigo(state, 'art5', false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se nova redação ao art. 4º; acrescente-se art. 5º-A; e suprima-se o § 7º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('modificacaoSupressaoDosParagrafosDeUmArtigo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se nova redação ao § 1º do art. 9º; e suprima-se o § 2º do art. 9º do Projeto, nos termos a seguir:');
  });

  it('modificacaoDeCaputESupressaoDeIncisoDoCaput', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_inc2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se nova redação ao caput do art. 2º; e suprima-se o inciso II do caput do art. 2º do Projeto, nos termos a seguir:');
  });
});
