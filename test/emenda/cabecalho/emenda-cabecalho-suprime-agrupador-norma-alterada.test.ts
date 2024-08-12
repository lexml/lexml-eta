import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { MPV_1089_2021 } from '../../doc/mpv_1089_2021';
import { MPV_1170_2023_ALTERADA } from '../../doc/mpv_1170_2023_alterada';

let mpv1089: ProjetoNorma;
let mpv1170: ProjetoNorma;
const state1089: State = new DefaultState();
const state1170: State = new DefaultState();

describe('Cabeçalho de comando de emenda modifica texto de agrupador de artigo em norma alterada', () => {
  beforeEach(function () {
    mpv1089 = buildProjetoNormaFromJsonix(MPV_1089_2021, true);
    mpv1170 = buildProjetoNormaFromJsonix(MPV_1170_2023_ALTERADA, true);
    state1089.articulacao = mpv1089.articulacao;
    state1170.articulacao = mpv1170.articulacao;
  });

  it('Suprime agrupador Parte em norma alterada', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1170, 'prt1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1170.urn!, state1170.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se toda a Parte Única da Medida Provisória.');
  });

  it('Suprime agrupador Livro em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1170, 'prt1u_liv1');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1170.urn!, state1170.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Livro I da Parte Única da Medida Provisória.');
  });

  it('Suprime agrupador Título em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1170, 'prt1u_liv1_tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1170.urn!, state1170.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Título I do Livro I da Parte Única da Medida Provisória.');
  });

  it('Suprime agrupador Capítulo em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1089, 'art2_cpt_alt1_cap5');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1089.urn!, state1089.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se o agrupador Capítulo V da Lei nº 7.565, de 19 de dezembro de 1986, como proposto pelo art. 2º da Medida Provisória.');
  });

  it('Suprime agrupador Título em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1170, 'prt1u_liv1_tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1170.urn!, state1170.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Título I do Livro I da Parte Única da Medida Provisória.');
  });

  it('Suprime agrupador Seção em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1089, 'art2_cpt_alt1_cap3_sec4');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1089.urn!, state1089.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Suprima-se o agrupador Seção IV do Capítulo III da Lei nº 7.565, de 19 de dezembro de 1986, como proposta pelo art. 2º da Medida Provisória.'
    );
  });

  it('Suprime agrupador Subseção em medida provisória', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state1170, 'prt1u_liv1_tit2_cap2_sec3_sub1');
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv1170.urn!, state1170.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se toda a Subseção I da Seção III do Capítulo II do Título II do Livro I da Parte Única da Medida Provisória.');
  });
});
