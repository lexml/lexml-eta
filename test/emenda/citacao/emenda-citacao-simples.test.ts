import { expect } from '@open-wc/testing';

import { CitacaoComandoDispPrj } from '../../../src/emenda/citacao-cmd-disp-prj';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { DefaultState } from './../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from './../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Citação em comando de emenda com apenas um dispositivo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('acrescimoParagrafo', () => {
    TesteCmdEmdUtil.incluiParagrafo(state, 'art1', false, 'art1_par1u');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p class="artigo">“<Rotulo>Art. 1º</Rotulo> <Omissis/></p><p class="paragrafo"><Rotulo>Parágrafo único.</Rotulo> Texto”</p>');
  });

  it('acrescimoInciso', () => {
    /*
     * "I – Nonono ono"
     */
    TesteCmdEmdUtil.incluiInciso(state, 'art1_cpt', false, 'art1_cpt_inc1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p class="artigo">“<Rotulo>Art. 1º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo>I –</Rotulo> Texto”</p>');
  });

  it('acrescimoAlinea', () => {
    /*
     * "a) Nonono ono"
     */
    TesteCmdEmdUtil.incluiAlinea(state, 'art9_par7_inc1', false, 'art9_par7_inc1_ali1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 7º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo> I – </Rotulo> <Omissis/></p><p class="alinea"><Rotulo>a)</Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  it('acrescimoItem', () => {
    /*
     * "1. Nonono ono"
     */
    TesteCmdEmdUtil.incluiItem(state, 'art9_par6_inc1_ali2', false, 'art9_par6_inc1_ali2_ite1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 6º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo> I – </Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="alinea"><Rotulo> b) </Rotulo> <Omissis/></p><p class="item"><Rotulo>1.</Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  // --------------------------------------------------------------------------------
  // Modificação

  it('modificacaoCaput', () => {
    /*
     * "Art. 1º Nonono ono"
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('<p class="artigo">“<Rotulo>Art. 1º</Rotulo> Texto”</p>');
  });

  it('modificacaoParagrafo', () => {
    /*
     * "§ 6º Nonono ono"
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 6º</Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  it('modificacaoInciso', () => {
    /*
     * "I – Nonono ono"
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 6º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo> I – </Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  it('modificacaoAlinea', () => {
    /*
     * "a) Nonono ono"
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 6º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo> I – </Rotulo> <Omissis/></p><p class="alinea"><Rotulo> a) </Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  it('modificacaoItem', () => {
    /*
     * "1. Nonono ono"
     */
    TesteCmdEmdUtil.modificaDispositivo(state, 'art9_par6_inc1_ali1_ite1');
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal(
      '<p class="artigo">“<Rotulo>Art. 9º</Rotulo> <Omissis/></p><p class="omissis"><Omissis/></p><p class="paragrafo"><Rotulo>§ 6º</Rotulo> <Omissis/></p><p class="inciso"><Rotulo> I – </Rotulo> <Omissis/></p><p class="alinea"><Rotulo> a) </Rotulo> <Omissis/></p><p class="item"><Rotulo> 1. </Rotulo> Texto</p><p class="omissis"><Omissis/>”</p>'
    );
  });

  // --------------------------------------------------------------------------------
  // Emenda sem dispositivos

  it('citacaoEmendaSemDispositivos', () => {
    const cit = new CitacaoComandoDispPrj(state.articulacao!).getTexto();
    expect(cit).to.equal('');
  });
});
