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
    expect(cit).to.equal('<p>“<Rotulo>Art. 1º</Rotulo><Omissis/></p>' + '<p><Rotulo>I –</Rotulo>Texto</p>' + '<p><Rotulo>Parágrafo único.</Rotulo>Texto”</p>');
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

  it('acrescimoParagrafosEsparsosNoMesmoArtigo', () => {
    /*
     * 'Art. 9º ..................
     * ...........................
     * § 2º-A nononono
     * ...........................
     * § 4º-A nononono
     * § 4º-B nononono
     * ..........................'
     */
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par2', false, 'art9_par2-1'); // § 2º-A do art. 9º
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par4', false, 'art9_par4-1'); // § 4º-A do art. 9º
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par4-1', false, 'art9_par4-2'); // § 4º-B do art. 9º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 9º</Rotulo><Omissis/></p>' +
        '<p><Omissis/></p>' +
        '<p><Rotulo>§ 2º-A</Rotulo>Texto</p>' +
        '<p><Omissis/></p>' +
        '<p><Rotulo>§ 4º-A</Rotulo>Texto</p>' +
        '<p><Rotulo>§ 4º-B</Rotulo>Texto</p>' +
        '<p><Omissis/>”</p>'
    );
  });

  it('alteraPrimeiroEIncluiUltimoParagrafo', () => {
    /*
     * 'Art. 9º ..................
     * § 1º nononono
     * ...........................
     * § 8º nononono'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par1'); // § 1º do art. 9º
    TesteCmdEmdUtil.incluiParagrafo(state, 'art9_par7_inc2', false, 'art9_par8'); // § 8º do art. 9º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 9º</Rotulo><Omissis/></p><p><Rotulo>§ 1º</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo>§ 8º</Rotulo>Texto”</p>');
  });

  // // --------------------------------------------------------------------------------
  // // Modificação de dispositivos

  it('modificacaoCaputEParagrafoUnicoSemAlterarIncisoDoCaput', () => {
    /*
     * 'Art. 8º nonnonon
     * ...........................
     * Parágrafo único. nononono'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt'); // caput do art. 8º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_par1u'); // parágrafo único do art. 8º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 8º</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo>Parágrafo único.</Rotulo>Texto”</p>');
  });

  it('modificacaoIncisosEsparsosNoMesmoCaput', () => {
    /*
     * 'Art. 2º ..................
     * ...........................
     * II - nononono
     * ...........................
     * IV - nononono
     * V - nononono
     * ..........................'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc2'); // inciso II do caput do art. 2º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc4'); // inciso IV do caput do art. 2º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc5'); // inciso V do caput do art. 2º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 2º</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo> II – </Rotulo>Texto</p><p><Omissis/></p><p><Rotulo> IV – </Rotulo>Texto</p><p><Rotulo> V – </Rotulo>Texto</p><p><Omissis/>”</p>'
    );
  });

  it('modificacaoPrimeiroEUltimoIncisoNoMesmoCaput', () => {
    /*
     * 'Art. 2º ..................
     * I - nononono
     * ...........................
     * XIII - nononono'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc1'); // inciso I do caput do art. 2º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_inc13'); // inciso XIII do caput do art. 2º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 2º</Rotulo><Omissis/></p><p><Rotulo> I – </Rotulo>Texto</p><p><Omissis/></p><p><Rotulo> XIII – </Rotulo>Texto”</p>');
  });

  // // --------------------------------------------------------------------------------
  // // Misto

  it('modificacaoCaputESupressaoParagrafo', () => {
    /*
     * 'Art. 8º nonononon
     * ...........................
     * Parágrafo único. (Suprimido)'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_par1u');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 8º</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo>Parágrafo único.</Rotulo>(Suprimido)”</p>');
  });

  it('modificacaoCaputESupressaoInciso', () => {
    /*
     * 'Art. 8º nonononon
     * I - (Suprimido)
     * ..........................'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art8_cpt');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art8_cpt_inc1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 8º</Rotulo>Texto</p><p><Rotulo> I – </Rotulo>(Suprimido)</p><p><Omissis/>”</p>');
  });

  it('modificacaoCaputESupressaoDeParagrafosSemOmissisParaIncisos', () => {
    /*
     * 'Art. 9º nonononon
     * ..........................
     * § 6º (Suprimido)
     * § 7º (Suprimido)'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_cpt');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par6');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art9_par7');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 9º</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo>§ 6º</Rotulo>(Suprimido)</p><p><Rotulo>§ 7º</Rotulo>(Suprimido)”</p>');
  });

  it('modificacaoCaputESupressaoDoSegundoInciso', () => {
    /*
     * 'Art. 2º nonononon
     * ...........................
     * II - (Suprimido)
     * ..........................'
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_inc2');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 2º</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo> II – </Rotulo>(Suprimido)</p><p><Omissis/>”</p>');
  });

  it('acrescimoItemEModificacaoAlinea', () => {
    /*
     * 'Art. 9º ..................
     * ...........................
     * § 6º ......................
     * I - .......................
     * a) ........................
     * ...........................
     * 1-A - nnoonononon onono
     * ...........................
     * b) nnonono o no nonono
     * ..........................'
     */
    TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali1_ite1', false, 'art9_par6_inc1_ali1_ite1-1'); // item 1-A da alínea 'a' do inciso I do § 6º do art. 9º
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali2'); // alínea 'b' do inciso I do § 6º do art. 9º
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 9º</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>§ 6º</Rotulo><Omissis/></p><p><Rotulo> I – </Rotulo><Omissis/></p><p><Rotulo> a) </Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>1-A.</Rotulo>Texto</p><p><Omissis/></p><p><Rotulo> b) </Rotulo>Texto</p><p><Omissis/>”</p>'
    );
  });

  it('supressaoArtigoEModificacaoCaput', () => {
    /*
     * 'Art. 1º (Suprimido)'
     * 'Art. 5º nononononno'
     */
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art5_cpt');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p>“<Rotulo>Art. 1º</Rotulo>(Suprimido)”</p><p>“<Rotulo>Art. 5º</Rotulo>Texto”</p>');
  });
});
