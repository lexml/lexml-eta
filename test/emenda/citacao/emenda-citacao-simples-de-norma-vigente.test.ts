import { expect } from '@open-wc/testing';

import { transformarEmOmissisIncisoParagrafo } from '../../../src/model/lexml/acao/transformarElementoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { getArticulacao } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { transformaTipoElemento } from '../../../src/redux/elemento/reducer/transformaTipoElemento';
import { DefaultState, State } from '../../../src/redux/state';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { CitacaoComandoDeNormaVigente } from './../../../src/emenda/citacao-cmd-de-norma-vigente';
import { buscaDispositivoById } from './../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { TesteCmdEmdUtil } from './../teste-cmd-emd-util';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Citação em comando de emenda com apenas um dispositivo de norma vigente', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  // --------------------------------------------------------------------------------
  // Inclusão de dispositivo

  it('acrescimoParagrafo', () => {
    const d = TesteCmdEmdUtil.incluiParagrafoAlteracao(state, 'art1_cpt_alt1_art5_par2', true, '1-A', true);
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('<p>“<Rotulo>Art. 5º</Rotulo> <Omissis/></p><p><Omissis/></p><p><Rotulo>§ 1º-A.</Rotulo> Texto</p><p><Omissis/>” (NR)</p>');
  });

  it('acrescimoInciso', () => {
    const d = TesteCmdEmdUtil.incluiIncisoAlteracao(state, 'art1_cpt_alt1_art5_par1_inc2', false, 'III', true);
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 5º</Rotulo> <Omissis/></p><p><Omissis/></p><p><Rotulo>§ 1º</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>III –</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  it('acrescimoAlinea', () => {
    const d = TesteCmdEmdUtil.incluiAlineaAlteracao(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2', false, 'b-A', true);
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 63-C.</Rotulo> <Omissis/></p><p><Rotulo>I –</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>b-A)</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  it('acrescimoItem', () => {
    const d = TesteCmdEmdUtil.incluiItem(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2', false);
    TesteCmdEmdUtil.numeraECriaRotulo(d, '1');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 63-C.</Rotulo> <Omissis/></p><p><Rotulo>I –</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>b)</Rotulo><Omissis/></p><p><Rotulo>1.</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  // --------------------------------------------------------------------------------
  // Modificação

  it('modificacaoCaputSemFilhos', () => {
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art1');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('<p>“<Rotulo>Art. 1º</Rotulo> Texto” (NR)</p>');
  });

  it('modificacaoCaputComFilhos', () => {
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('<p>“<Rotulo>Art. 2º</Rotulo> Texto</p><p><Omissis/>” (NR)</p>');
  });

  it('modificacaoParagrafo', () => {
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par1');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('<p>“<Rotulo>Art. 5º</Rotulo> <Omissis/></p><p><Omissis/></p><p><Rotulo>§ 1º</Rotulo> Texto</p><p><Omissis/>” (NR)</p>');
  });

  it('modificacaoInciso', () => {
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par1_inc2');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 5º</Rotulo> <Omissis/></p><p><Omissis/></p><p><Rotulo>§ 1º</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>II –</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  it('modificacaoAlinea', () => {
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 63-C.</Rotulo> <Omissis/></p><p><Rotulo>I –</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>b)</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  it('modificacaoItem', () => {
    const d = TesteCmdEmdUtil.incluiItem(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2', false);
    TesteCmdEmdUtil.numeraECriaRotulo(d, '1', false);
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      '<p>“<Rotulo>Art. 63-C.</Rotulo> <Omissis/></p><p><Rotulo>I –</Rotulo><Omissis/></p><p><Omissis/></p><p><Rotulo>b)</Rotulo><Omissis/></p><p><Rotulo>1.</Rotulo> Texto</p><p><Omissis/>” (NR)</p>'
    );
  });

  // --------------------------------------------------------------------------------
  // Supressão

  it('variasSupressoes', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_par3');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc2');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art2_cpt_alt1_art63-3_cpt_inc1_ali2');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d!));
    expect(cit).to.equal('');
  });

  // --------------------------------------------------------------------------------
  // Omissis

  it('acrescimoOmissisAposIrmao', () => {
    const d = TesteCmdEmdUtil.incluiIncisoAlteracao(state, 'art1_cpt_alt1_art5_par1_inc1', false);
    transformaTipoElemento(state, transformarEmOmissisIncisoParagrafo.execute(d));
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('');
  });

  it('supressaoOmissisAposIrmao', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art2_omi1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_omi1');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d!));
    expect(cit).to.equal('');
  });

  it('supressaoOmissisEntrePaiEFilho', () => {
    const d = buscaDispositivoById(state.articulacao!, 'art1_cpt_alt1_art2_cpt_omi1');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art2_cpt_omi1');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d!));
    expect(cit).to.equal('');
  });

  // // ----------------------- multipla-de-norma-vigente

  // // Símbolos: § “a”

  it('acrescimoArtigo', () => {
    const d = TesteCmdEmdUtil.incluiArtigo(state, 'art1_cpt_alt1_art1', false);
    TesteCmdEmdUtil.numeraECriaRotulo(d, '1-A', false);
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal('<p>“<Rotulo>Art. 1º-A.</Rotulo> Texto” (NR)</p>');
  });

  it('diversasModificacoes', () => {
    /*
     * "Art. 2º ...................
     * ............................
     * VII - Nono nonono nonono
     * ............................"
     * "Art. 5º ...................
     * (Suprimir omissis)
     * § 1º .......................
     * I – (Suprimir)
     * I-A – Nononono
     * ............................
     * § 4º Nono nonono nonono"
     */
    const d = TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art2_cpt_inc7');
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_omi1');
    TesteCmdEmdUtil.incluiIncisoAlteracao(state, 'art1_cpt_alt1_art5_par1_inc1', false, 'I-A', false);
    TesteCmdEmdUtil.suprimeDispositivo(state, 'art1_cpt_alt1_art5_par1_inc1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'art1_cpt_alt1_art5_par4');
    const cit = new CitacaoComandoDeNormaVigente().getTexto(getArticulacao(d));
    expect(cit).to.equal(
      // eslint-disable-next-line prettier/prettier
      '<p>“<Rotulo>Art. 2º</Rotulo> <Omissis/>' +
        '</p><p><Omissis/></p>' +
        '<p><Rotulo>VII –</Rotulo> Texto</p>' +
        '<p><Omissis/>” (NR)</p>' +
        '<p>“<Rotulo>Art. 5º</Rotulo> <Omissis/></p>' +
        '<p><Rotulo/> (Suprimir omissis)</p>' +
        '<p><Rotulo>§ 1º</Rotulo><Omissis/></p>' +
        '<p><Rotulo>I –</Rotulo> (Suprimir)</p>' +
        '<p><Rotulo>I-A –</Rotulo> Texto</p>' +
        '<p><Omissis/></p>' +
        '<p><Rotulo>§ 4º</Rotulo> Texto” (NR)</p>'
    );
  });
});
