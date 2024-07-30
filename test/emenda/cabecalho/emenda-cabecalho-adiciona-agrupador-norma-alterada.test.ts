import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { MPV_885_2019 } from '../../doc/mpv_885_2019';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { MPV_GENERICOS } from '../../doc/exemplo-articulacao-mpv-generico';

let mpv885: ProjetoNorma;
let mpv905: ProjetoNorma;
let mpvGenerico: ProjetoNorma;
const state885: State = new DefaultState();
const state905: State = new DefaultState();
const stateGenerico: State = new DefaultState();

describe('Cabeçalho de comando de emenda adiciona de agrupador de artigo em norma alterada', () => {
  beforeEach(function () {
    mpv885 = buildProjetoNormaFromJsonix(MPV_885_2019, true);
    mpv905 = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    mpvGenerico = buildProjetoNormaFromJsonix(MPV_GENERICOS, true);
    state885.articulacao = mpv885.articulacao;
    state905.articulacao = mpv905.articulacao;
    stateGenerico.articulacao = mpvGenerico.articulacao;
  });

  // PARTE
  it('Inclusão de Parte Única antes de artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, a seguinte Parte Única:');
  });

  it('Inclusão de Parte Única após o último artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art5', TipoDispositivo.parte.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 5º da Medida Provisória, a seguinte Parte Única:');
  });

  it('Inclusão de duas Partes antes do mesmo artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º da Medida Provisória, as seguintes Partes I e II:');
  });

  it('Inclusão de duas Partes antes de artigos não subsequentes em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art3', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Parte I antes do art. 1º e Parte II antes do art. 3º da Medida Provisória, com a seguinte redação:');
  });

  // LIVRO

  //
  it('Inclusão de agrupador capítulo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art3', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Capítulo Único:');
  });

  it('Inclusão de agrupador título em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art3', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 3º da Medida Provisória, o seguinte Título Único:');
  });

  it('Inclusão de Parte Única antes de artigo de MPV', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, a seguinte Parte Única:');
  });

  it('Inclusão de Parte antes de outra Parte', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes da Parte I da Medida Provisória, a seguinte Parte 0:');
  });

  it('Inclusão de Parte após de outra Parte', () => {
    const antes = false;
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1', TipoDispositivo.parte.tipo, antes);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte II da Medida Provisória, a seguinte Parte II:');
  });

  it('Inclusão de Parte antes de livro', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1_liv1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte II da Medida Provisória, a seguinte Parte II:');
  });

  // LIVRO
  it('Inclusão de Livro antes de outro livro existente', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1_liv1', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte I da Medida Provisória, o seguinte Livro 0:');
  });

  it('Inclusão de Livro antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1_liv1', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Livro I da Parte I da Medida Provisória, o seguinte Livro 0:');
  });

  it('Inclusão de Livro Único após o último artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'art3', TipoDispositivo.livro.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 3º da Medida Provisória, o seguinte Livro II:');
  });

  it('Inclusão de dois Livros antes do mesmo artigo em mpv', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'art3', TipoDispositivo.livro.tipo);
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'art3', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 3º da Medida Provisória, os seguintes Livros II e III:');
  });

  it('Inclusão de dois Livros antes de dispositivos não subsequentes', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1_liv1', TipoDispositivo.livro.tipo);
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'art3', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Livro 0 antes do Livro I da Parte I e Livro II antes do art. 3º da Medida Provisória, com a seguinte redação:');
  });

  // TITULO
  it('Inclusão de Título Único antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, o seguinte Título Único:');
  });

  it('Inclusão de Título Único antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, o seguinte Título Único:');
  });

  it('Inclusão de Título Único após o último artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art5', TipoDispositivo.titulo.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 5º da Medida Provisória, o seguinte Título Único:');
  });

  it('Inclusão de dois Títulos antes do mesmo artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.titulo.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º da Medida Provisória, os seguintes Títulos I e II:');
  });

  it('Inclusão de dois Títulos antes de artigos não subsequentes', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art1', TipoDispositivo.titulo.tipo);
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art3', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Título I antes do art. 1º e Título II antes do art. 3º da Medida Provisória, com a seguinte redação:');
  });

  // CAPÍTULO
  it('Inclusão de capítulo antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art5', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 5º da Medida Provisória, o seguinte Capítulo Único:');
  });

  it('Inclusão de capítulo antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(state885, 'art5', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv885.urn!, state885.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 5º da Medida Provisória, o seguinte Capítulo Único:');
  });

  it('Inclusão de um primeiro capítulo antes de outro capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateGenerico, 'prt1_liv1_tit1_cap1', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpvGenerico.urn!, stateGenerico.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Capítulo I do Título I do Livro I da Parte I da Medida Provisória, o seguinte Capítulo 0:');
  });

  it('Inclusão de um segundo capítulo antes de outro capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap2', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Capítulo II da Medida Provisória, o seguinte Capítulo I-1:');
  });

  // SECAO
  it('Inclusão de Seção Única antes de artigo dentro de capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º da Medida Provisória, a seguinte Seção Única:');
  });

  it('Inclusão de duas Seções dentro do mesmo capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º da Medida Provisória, as seguintes Seções I e II:');
  });

  it('Inclusão de uma Seção dentro de dois capítulos distintos', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seção Única antes do art. 1º e Seção Única antes do art. 19 da Medida Provisória, com a seguinte redação:');
  });

  it('Inclusão de duas Seções dentro de um Capítulo e uma seção dentro de outro distinto', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seções I e II antes do art. 1º e Seção Única antes do art. 19 da Medida Provisória, com a seguinte redação:');
  });

  it('Inclusão de duas Seções dentro de dois Capítulos distintos', () => {
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap2', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(state905, 'cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(mpv905.urn!, state905.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seções I e II antes do art. 1º e Seções I e II antes do art. 19 da Medida Provisória, com a seguinte redação:');
  });
});
