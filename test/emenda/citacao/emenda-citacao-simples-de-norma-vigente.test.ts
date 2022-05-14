import { expect } from '@open-wc/testing';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { DefaultState, State } from '../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Citação em comando de emenda com apenas um dispositivo de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // --------------------------------------------------------------------------------
  // Inclusão de dispositivo

  // it('acrescimoParagrafo', () => {
  //   /*
  //    * "Parágrafo único. Nonono ono"
  //    */
  //   // TesteCmdEmdUtil.// TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, state, 'art1_cpt', TesteCmdEmdUtil.URN_LEI, 'art10_par1u', true);
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Paragrafo refid='adi4'></Paragrafo></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('acrescimoInciso', () => {
  //   /*
  //    * "I - Nonono ono"
  //    */
  //   // TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, "art1_cpt", URN_LEI, "art1_cpt_inc1", true);
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Inciso refid='adi4'></Inciso></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('acrescimoAlinea', () => {
  //   /*
  //    * "a) Nonono ono"
  //    */
  //   // TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, "art1_cpt", URN_LEI, "art1_cpt_inc1_ali1", true);
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Alinea refid='adi5'></Alinea></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('acrescimoItem', () => {
  //   /*
  //    * "1. Nonono ono"
  //    */
  //   // TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, "art1_cpt", URN_LEI, "art1_cpt_inc1_ali1_ite1", true);
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Item refid='adi6'></Item></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // // --------------------------------------------------------------------------------
  // // Modificação

  // it('modificacaoCaput', () => {
  //   /*
  //    * "Art. 1º Nonono ono"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal('<Citacao><Aspas><Artigo><Rotulo>Art. 1º</Rotulo>' + "<Caput refid='mod1'></Caput></Artigo></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('modificacaoParagrafo', () => {
  //   /*
  //    * "§ 6º Nonono ono"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Paragrafo refid='mod1'></Paragrafo></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('modificacaoInciso', () => {
  //   /*
  //    * "I - Nonono ono"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Inciso refid='mod1'></Inciso></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('modificacaoAlinea', () => {
  //   /*
  //    * "a) Nonono ono"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Alinea refid='mod1'></Alinea></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('modificacaoItem', () => {
  //   /*
  //    * "1. Nonono ono"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Item refid='mod1'></Item></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // // ----------------------- omissis-de-norma-vigente

  // // Símbolos: § “a”

  // it('acrescimoOmissisAposIrmao', () => {
  //   incluiOmissis('art2_cpt_inc7_alt1_art1_cpt_inc2', false);
  //   const item = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(cit).to.equal('', item.getCitacao());
  // });

  // it('acrescimoOmissisEntreIrmaos', () => {
  //   incluiOmissis('art2_cpt_inc7_alt1_art1_cpt_inc2', true);
  //   const item = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(cit).to.equal('', item.getCitacao());
  // });

  // it('acrescimoOmissisEntrePaiEFilho', () => {
  //   incluiOmissis('art2_cpt_inc7_alt1_art1_cpt_inc1', true);
  //   const item = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(cit).to.equal('', item.getCitacao());
  // });

  // it('supressaoOmissisAposIrmao', () => {
  //   suprimeDispositivo('art6_cpt_alt1_art1_cpt_omi2');
  //   const item = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(cit).to.equal('', item.getCitacao());
  // });

  // it('supressaoOmissisEntrePaiEFilho', () => {
  //   suprimeDispositivo('art6_cpt_alt1_art1_cpt_omi1');
  //   const item = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
  //   expect(cit).to.equal('', item.getCitacao());
  // });

  // // ----------------------- multipla-de-norma-vigente

  // // Símbolos: § “a”

  // it('acrescimoArtigo', () => {
  //   /*
  //    * "Art. 9º A nononoono"
  //    */
  //   // TesteCmdEmdUtil.incluiAlteracaoNormaVigente(state, "art1_cpt", URN_LEI, "art9_cpt", true);
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal("<Citacao><Aspas><Artigo refid='adi2'><Rotulo>Art. 9º</Rotulo>" + "<Caput refid='adi3'></Caput></Artigo></Aspas></Citacao>", cit.getTexto(alteracao!));
  // });

  // it('modificaIncisosDeArtigosDiferentesNaMesmaAlteracao', () => {
  //   /*
  //    * "Art. 1º ...................
  //    * I - Nono nonono nonono
  //    * ............................"
  //    * "Art. 7º ...................
  //    * ............................
  //    * III - Nono nonono nonono
  //    * ............................"
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art1_cpt_inc1');
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc7_alt1_art7_cpt_inc3');
  //   const alteracao = buscaDispositivoById(state.articulacao!, 'art2_cpt_inc7_alt1');
  //   const cit = new CitacaoComandoDeNormaVigente();
  //   expect(cit).to.equal(
  //     '<Citacao><Aspas><Artigo><Rotulo>Art. 1º</Rotulo>' +
  //       "<Caput><Omissis></Omissis><Inciso refid='mod1'></Inciso></Caput>" +
  //       '<Omissis></Omissis></Artigo></Aspas><Aspas><Artigo><Rotulo>Art. 7º</Rotulo>' +
  //       "<Caput><Omissis></Omissis><Omissis></Omissis><Inciso refid='mod2'></Inciso>" +
  //       '</Caput><Omissis></Omissis></Artigo></Aspas></Citacao>',
  //     cit.getTexto(alteracao!)
  //   );
  // });
});
