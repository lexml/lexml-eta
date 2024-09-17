import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { MPV_1089_2021 } from '../../doc/mpv_1089_2021';
import { MPV_1170_2023_ALTERADA } from '../../doc/mpv_1170_2023_alterada';

let documento: ProjetoNorma;
let documentoPl: ProjetoNorma;
const state: State = new DefaultState();
const statePl: State = new DefaultState();

describe('Cabeçalho de comando de emenda modifica texto de agrupador de artigo em medida provisória', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_1089_2021, true);
    documentoPl = buildProjetoNormaFromJsonix(MPV_1170_2023_ALTERADA, true);
    state.articulacao = documento.articulacao;
    statePl.articulacao = documentoPl.articulacao;
  });

  it('Modifica texto Parte em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1u');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação da Parte Única da Medida Provisória a seguinte redação:');
  });

  it('Modifica texto Livro em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1u_liv1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Livro I da Parte Única da Medida Provisória a seguinte redação:');
  });

  it('Modifica texto Título em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1u_liv1_tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Título I do Livro I da Parte Única da Medida Provisória a seguinte redação:');
  });

  it('Modifica texto Capítulo em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_alt1_cap5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação à denominação do Capítulo V da Lei nº 7.565, de 19 de dezembro de 1986, como proposto pelo art. 2º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('Modifica texto Seção em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'art2_cpt_alt1_cap3_sec4');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se nova redação à denominação da Seção IV do Capítulo III da Lei nº 7.565, de 19 de dezembro de 1986, como proposta pelo art. 2º da Medida Provisória, nos termos a seguir:'
    );
  });

  it('Modifica texto Subeção em medida provisória', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1u_liv1_tit2_cap2_sec3_sub1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Dê-se à denominação da Subseção I da Seção III do Capítulo II do Título II do Livro I da Parte Única da Medida Provisória a seguinte redação:'
    );
  });
});
