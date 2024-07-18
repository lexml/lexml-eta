import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda adiciona de agrupador de artigo em norma alterada', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    state.articulacao = documento.articulacao;
  });

  // PARTE
  it('Inclusão de Parte Única antes de artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, a seguinte Parte Única:');
  });

  it('Inclusão de Parte Única após o último artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art5', TipoDispositivo.parte.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 5º da Medida Provisória, a seguinte Parte Única:');
  });

  it('Inclusão de duas Partes antes do mesmo artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º da Medida Provisória, as seguintes Partes I e II:');
  });

  it('Inclusão de duas Partes antes de artigos não subsequentes em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state, 'art3', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Parte I antes do art. 1º e Parte II antes do art. 3º da Medida Provisória, com a seguinte redação:');
  });

  // LIVRO

  //
  it('Inclusão de agrupador capítulo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art3', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Capítulo Único:');
  });

  it('Inclusão de agrupador título em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art3', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Título Único:');
  });

  it('Inclusão de Parte Única antes de artigo de MPV', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, a seguinte Parte Única:');
  });

  //
  // it('Inclusão de Parte antes de outra Parte', () => {
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'prt1', TipoDispositivo.parte.tipo);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes da Parte I da Proposta, a seguinte Parte 0:');
  // });
  //
  // it('Inclusão de Parte após de outra Parte', () => {
  //   const antes = false;
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'prt1', TipoDispositivo.parte.tipo, antes);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte II da Proposta, a seguinte Parte II:');
  // });
  //
  // it('Inclusão de Parte antes de livro', () => {
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'prt1_liv1', TipoDispositivo.parte.tipo);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte II da Proposta, a seguinte Parte II:');
  // });

  //
  //
  //
  //
  // it('Inclusão de Livro antes de outro livro existente', () => {
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'prt1_liv1', TipoDispositivo.livro.tipo);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte I da Proposta, o seguinte Livro 0:');
  // });
  //
  // it('Inclusão de Livro antes de artigo', () => {
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'prt1_liv1', TipoDispositivo.livro.tipo);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte I da Proposta, o seguinte Livro 0:');
  // });

  //
  // it('Inclusão de Subseção Única', () => {
  //   TesteCmdEmdUtil.incluiAgrupador(stateProposta, 'art3', TipoDispositivo.subsecao.tipo);
  //   const itemComandoEmenda = new ComandoEmendaBuilder(proposta.urn!, stateProposta.articulacao!).getComandoEmenda().comandos[0];
  //   expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Proposta, a seguinte Subseção Única:');
  // });
});
