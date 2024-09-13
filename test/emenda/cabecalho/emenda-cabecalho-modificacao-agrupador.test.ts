import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { PL_AGRUPADORES } from '../../doc/parser/pl_agrupadores';

let documento: ProjetoNorma;
let documentoPl: ProjetoNorma;
const state: State = new DefaultState();
const statePl: State = new DefaultState();

describe('Cabeçalho de comando de emenda com alteração de denominação de agrupador de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    documentoPl = buildProjetoNormaFromJsonix(PL_AGRUPADORES, true);
    state.articulacao = documento.articulacao;
    statePl.articulacao = documentoPl.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  it('Altera denominação de Parte', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação da Parte I da Proposta a seguinte redação:');
  });

  it('Altera denominação de Livro', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1_liv1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Livro I da Parte I da Proposta a seguinte redação:');
  });

  it('Altera denominação de Livro', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1_liv1_tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Título I do Livro I da Parte I da Proposta a seguinte redação:');
  });

  it('Altera denominação de capítulo', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'tit1_cap1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Capítulo I do Título I do Projeto a seguinte redação:');
  });

  it('Altera denominação do título', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Título I do Projeto a seguinte redação:');
  });

  it('Altera denominação de dois capítulos', () => {
    TesteCmdEmdUtil.modificaDispositivo(state, 'tit1_cap1');
    TesteCmdEmdUtil.modificaDispositivo(state, 'tit1_cap2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação do Capítulo I do Título I e à denominação do Capítulo II do Título I do Projeto a seguinte redação:');
  });

  it('Altera denominação de Seção', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1_liv1_tit1_cap1_sec2');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação da Seção II do Capítulo I do Título I do Livro I da Parte I da Proposta a seguinte redação:');
  });

  it('Altera denominação de Subseção', () => {
    TesteCmdEmdUtil.modificaDispositivo(statePl, 'prt1_liv1_tit1_cap1_sec3_sub1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Dê-se à denominação da Subseção I da Seção III do Capítulo I do Título I do Livro I da Parte I da Proposta a seguinte redação:');
  });
});
