import { expect } from '@open-wc/testing';
import { CitacaoComandoDispPrj } from '../../../src/emenda/citacao-cmd-disp-prj';

import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';

import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Citação em comando de emenda com mais de um dispositivo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // Símbolos: § “a”

  // --------------------------------------------------------------------------------
  // Inclusão de dispositivos

  it('acrescimoArtigo', () => {
    /*
     * 'Art. 1º-A nononoono'
     */
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 1º-A</Rotulo>Texto”</p>');
  });

  it('acrescimoParagrafoEIncisoNoMesmoArtigo', () => {
    /*
     * 'Art. 1º ..................
     * I – nononoo
     * Parágrafo único. nononono'
     */
    TesteCmdEmdUtil.incluiInciso(state, 'art1_cpt', false, 'art1_cpt_inc1'); // inciso I do caput do art. 1º
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u'); // parágrafo único do art. 1º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    // eslint-disable-next-line prettier/prettier
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 1º</Rotulo><Omissis/></p>' +
        '<p><Rotulo>I –</Rotulo>Texto</p>' +
        '<p><Rotulo>Parágrafo único.</Rotulo>Texto”</p>');
  });

  it('acrescimoParagrafoEIncisoEmArtigosDistintos', () => {
    /*
     * 'Art. 1º ..................
     * Parágrafo único. nononono'
     * 'Art. 2º ..................
     * ...........................
     * I-A - nonononono
     * ..........................'
     */
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u'); // parágrafo único do art. 1º
    TesteCmdEmdUtil.incluiInciso(state, 'art2_cpt_inc1', false, 'art2_cpt_inc1-1'); // inciso I-B do caput do art. 2º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    // eslint-disable-next-line prettier/prettier
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 1º</Rotulo><Omissis/></p>' +
        '<p><Rotulo>Parágrafo único.</Rotulo>Texto”</p>' +
        '<p>“<Rotulo>Art. 2º</Rotulo><Omissis/></p>' +
        '<p><Omissis/></p>' +
        '<p><Rotulo>I-A –</Rotulo>Texto</p>' +
        '<p><Omissis/>”</p>'
    );
  });

  // it('acrescimoParagrafosEsparsosNoMesmoArtigo', () => {
  //   /*
  //    * 'Art. 9º ..................
  //    * ...........................
  //    * § 2º-A nononono
  //    * ...........................
  //    * § 4º-A nononono
  //    * § 4º-B nononono
  //    * ..........................'
  //    */
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par2', false, ''); // § 2º-A do art. 9º
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par4', false, ''); // § 4º-A do art. 9º
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par5', true, ''); // § 4º-B do art. 9º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 9º</Rotulo><Omissis></Omissis>' +
  //       '<Omissis></Omissis><Paragrafo></Paragrafo><Omissis></Omissis>' +
  //       '<Paragrafo></Paragrafo><Paragrafo></Paragrafo>' +
  //       '<Omissis></Omissis></Artigo>”</p>'
  //   );
  // });

  // it('acrescimoPrimeiroEUltimoParagrafo', () => {
  //   /*
  //    * 'Art. 9º ..................
  //    * § 0 nononono
  //    * ...........................
  //    * § 8º nononono'
  //    */
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par1', true, ''); // § 0 do art. 9º
  //   TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par7', false, ''); // § 8º do art. 9º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 9º</Rotulo><Omissis></Omissis>' +
  //       '<Paragrafo></Paragrafo><Omissis></Omissis>' +
  //       '<Paragrafo></Paragrafo></Artigo>”</p>'
  //   );
  // });

  // // --------------------------------------------------------------------------------
  // // Modificação de dispositivos

  // it('modificacaoCaputEParagrafoUnicoSemAlterarIncisoDoCaput', () => {
  //   /*
  //    * 'Art. 8º nonnonon
  //    * ...........................
  //    * Parágrafo único. nononono'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt'); // caput do art. 8º
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1'); // parágrafo único do art. 8º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 8º</Rotulo><Caput></Caput><Omissis></Omissis><Paragrafo></Paragrafo></Artigo>”</p>'
  //   );
  // });

  // it('modificacaoIncisosEsparsosNoMesmoCaput', () => {
  //   /*
  //    * 'Art. 2º ..................
  //    * ...........................
  //    * II - nononono
  //    * ...........................
  //    * IV - nononono
  //    * V - nononono
  //    * ..........................'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc2'); // inciso II do caput do art. 2º
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc4'); // inciso IV do caput do art. 2º
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc5'); // inciso V do caput do art. 2º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 2º</Rotulo><Caput><Omissis></Omissis>' +
  //       '<Omissis></Omissis><Inciso></Inciso><Omissis></Omissis>' +
  //       '<Inciso></Inciso><Inciso></Inciso>' +
  //       '</Caput><Omissis></Omissis></Artigo>”</p>'
  //   );
  // });

  // it('modificacaoPrimeiroEUltimoIncisoNoMesmoCaput', () => {
  //   /*
  //    * 'Art. 2º ..................
  //    * I - nononono
  //    * ...........................
  //    * XIII - nononono'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc1'); // inciso I do caput do art. 2º
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc13'); // inciso XIII do caput do art. 2º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 2º</Rotulo><Caput><Omissis></Omissis>' +
  //       '<Inciso></Inciso><Omissis></Omissis>' +
  //       '<Inciso></Inciso></Caput></Artigo>”</p>'
  //   );
  // });

  // // --------------------------------------------------------------------------------
  // // Misto

  // it('modificacaoCaputESupressaoParagrafo', () => {
  //   /*
  //    * 'Art. 8º nonononon
  //    * ...........................
  //    * Parágrafo único. (Suprimido)'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_par1');
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 8º</Rotulo><Caput></Caput><Omissis></Omissis><Paragrafo></Paragrafo></Artigo>”</p>'
  //   );
  // });

  // it('modificacaoCaputESupressaoInciso', () => {
  //   /*
  //    * 'Art. 8º nonononon
  //    * I - (Suprimido)
  //    * ..........................'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_cpt_inc1');
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 8º</Rotulo><Caput><Inciso></Inciso></Caput><Omissis></Omissis></Artigo>”</p>'
  //   );
  // });

  // it('modificacaoCaputESupressaoDeParagrafosSemOmissisParaIncisos', () => {
  //   /*
  //    * 'Art. 9º nonononon
  //    * ..........................
  //    * § 6º (Suprimido)
  //    * § 7º (Suprimido)'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_cpt');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 9º</Rotulo>' +
  //       '<Caput></Caput>' +
  //       '<Omissis></Omissis>' +
  //       '<Paragrafo></Paragrafo>' +
  //       '<Paragrafo></Paragrafo>' +
  //       '</Artigo>”</p>'
  //   );

  // it('modificacaoCaputESupressaoDoSegundoInciso', () => {
  //   /*
  //    * 'Art. 2º nonononon
  //    * ...........................
  //    * II - (Suprimido)
  //    * ..........................'
  //    */
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt');
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_inc2');
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 2º</Rotulo>' +
  //       '<Caput><Omissis></Omissis><Inciso></Inciso></Caput>' +
  //       '<Omissis></Omissis></Artigo>”</p>'
  //   );
  // });

  // it('acrescimoItemEModificacaoAlinea', () => {
  //   /*
  //    * 'Art. 9º ..................
  //    * ...........................
  //    * § 6º ......................
  //    * I - .......................
  //    * a) ........................
  //    * ...........................
  //    * 1-A - nnoonononon onono
  //    * ...........................
  //    * b) nnonono o no nonono
  //    * ..........................'
  //    */
  //   TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', false, ''); // item 1-A da alínea 'a' do inciso I do § 6º
  //   // do art. 9º
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali2'); // alínea 'b' do inciso I do § 6º do art. 9º
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 9º</Rotulo><Omissis></Omissis><Omissis></Omissis>' +
  //       '<Paragrafo><Omissis><Rotulo>§ 6º</Rotulo></Omissis>' +
  //       '<Inciso><Omissis><Rotulo>I –</Rotulo></Omissis>' +
  //       '<Alinea><Omissis><Rotulo>a)</Rotulo></Omissis><Omissis></Omissis>' +
  //       '<Item></Item></Alinea><Omissis></Omissis>' +
  //       '<Alinea></Alinea>' +
  //       '</Inciso></Paragrafo><Omissis></Omissis></Artigo>”</p>'
  //   );
  // });

  // it('supressaoArtigoEModificacaoCaput', () => {
  //   /*
  //    * 'Art. 1º (Suprimido)'
  //    * 'Art. 5º nononononno'
  //    */
  //   TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
  //   TesteCmdEmdUtil.modificaDispositivo(state, 'art5_cpt');
  //   const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
  //   expect(cit).to.equal(
  //     '<p>“<Artigo><Rotulo>Art. 1º</Rotulo></Artigo></Aspas>' +
  //       '<Aspas><Artigo><Rotulo>Art. 5º</Rotulo>' +
  //       '<Caput></Caput></Artigo>”</p>'
  //   );
  // });
});
