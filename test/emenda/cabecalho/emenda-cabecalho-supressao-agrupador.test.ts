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

describe('Cabeçalho de comando de emenda com supressão de denominação de agrupador de artigo', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    documentoPl = buildProjetoNormaFromJsonix(PL_AGRUPADORES, true);
    state.articulacao = documento.articulacao;
    statePl.articulacao = documentoPl.articulacao;
  });

  it('Suprime Parte 1 da Proposta', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se toda a Parte I da Proposta.');
  });

  it('Suprime Parte 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'tit1_cap1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Capítulo I do Título I do Projeto.');
  });

  it('Suprime Livro 1 da Proposta', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1_liv1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Livro I da Parte I da Proposta.');
  });

  it('Suprime Título 1 da Proposta', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1_liv1_tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Título I do Livro I da Parte I da Proposta.');
  });

  it('Suprime Título 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'tit1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Título I do Projeto.');
  });

  it('Suprime Capítulo 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(state, 'tit1_cap1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Capítulo I do Título I do Projeto.');
  });

  it('Suprime Capítulo 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1_liv1_tit1_cap1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se todo o Capítulo I do Título I do Livro I da Parte I da Proposta.');
  });

  it('Suprime Seção 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1_liv1_tit1_cap1_sec1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se toda a Seção I do Capítulo I do Título I do Livro I da Parte I da Proposta.');
  });

  it('Suprime Subseção 1 do Projeto', () => {
    TesteCmdEmdUtil.suprimeDispositivo(statePl, 'prt1_liv1_tit1_cap1_sec3_sub1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documentoPl.urn!, statePl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Suprima-se toda a Subseção I da Seção III do Capítulo I do Título I do Livro I da Parte I da Proposta.');
  });
});
