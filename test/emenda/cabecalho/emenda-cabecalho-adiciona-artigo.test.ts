import { TipoDispositivo } from './../../../src/model/lexml/tipo/tipoDispositivo';
import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { DefaultState } from './../../../src/redux/state';
import { PLC_ARTIGOS_AGRUPADOS } from './../../doc/parser/plc_artigos_agrupados';

let documento: ProjetoNorma;
const state: State = new DefaultState();

describe('Cabeçalho de comando de emenda com inclusão de artigos', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    state.articulacao = documento.articulacao;
  });

  it('Deveria possuir 9 artigos', () => {
    expect(state.articulacao?.artigos.length).to.equal(9);
  });

  // TODO - Artigo antes do primeiro
  // public void acrescimoArtigoAntesPrimeiro() {
  //     incluiArtigoAntes("art1");
  //     ItemComandoEmenda item = new ComandoEmendaBuilder(emenda).getComandoEmenda().comandos.get(0);
  //     Assert.assertEquals("Acrescente-se art. 0 ao Projeto, com a seguinte redação:", item.getCabecalho());
  // }

  // public void acrescimoDoisArtigosAntesPrimeiro() {
  //     incluiArtigoAntes("art1");
  //     incluiArtigoAntes("art1");
  //     ItemComandoEmenda item = new ComandoEmendaBuilder(emenda).getComandoEmenda().comandos.get(0);
  //     Assert.assertEquals("Acrescentem-se arts. 0 e 0-1 ao Projeto, com a seguinte redação:",
  //                         item.getCabecalho());
  // }

  it('Inclusão de um artigo', () => {
    const artigo = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    expect(artigo.rotulo).to.equal('Art. 1º-1.');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 1º-1 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de dois artigos consecutivos', () => {
    const artigo1 = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    expect(artigo1.rotulo).to.equal('Art. 1º-1.');
    const artigo2 = TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1-1');
    expect(artigo2.rotulo).to.equal('Art. 1º-2.');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-1 e 1º-2 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de três artigos consecutivos', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-1 a 1º-3 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de quatro artigos com um separado', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art5');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-1 a 1º-3 e 5º-1 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de duas sequências de artigo', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art5');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art5');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art5');
    state.articulacao?.renumeraArtigos();
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 1º-1 a 1º-3 e 5º-1 a 5º-3 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigo no final do projeto', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art9');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 10 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de dois artigos ao final do projeto', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art9');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art10');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 10 e 11 ao Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigo em inicio capítulo', () => {
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art8');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 7º-1 ao Capítulo II do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de dois artigos e inicio de capítulo', () => {
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art8');
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art8');
    state.articulacao?.renumeraFilhos();
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 7º-1 e 7º-2 ao Capítulo II do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigo no fim do capitulo', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 7º-1 ao Capítulo I do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de dois artigos no fim capítulo', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art7');
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art7');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se arts. 7º-1 e 7º-2 ao Capítulo I do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigos em diferentes captulos', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art7');
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art8');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se art. 7º-1 ao Capítulo I do Título I e art. 7º-2 ao Capítulo II do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigo antes do primeiro agrupador', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art3');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se art. 3º-1 antes do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigos antes e depois do primeiro agrupador', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art3');
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art4');
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se art. 3º-1 antes do Título I e art. 3º-2 ao Capítulo I do Título I do Projeto, com a seguinte redação:');
  });

  it('Inclusão de artigos em diferentes agrupadores removendo ambiguidade', () => {
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art1'); // Sem agrupador
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art4'); // no Capítulo I
    TesteCmdEmdUtil.incluiArtigoDepois(state, 'art4'); // no Capítulo I
    TesteCmdEmdUtil.incluiArtigoAntes(state, 'art8'); // no Capítulo II
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal(
      'Acrescentem-se art. 1º-1 antes do Título I,' +
        ' arts. 3º-1 e 4º-1 ao Capítulo I do Título I' +
        ' e art. 7º-1 ao Capítulo II do Título I do Projeto,' +
        ' com a seguinte redação:'
    );
  });

  it('Inclusão de capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(state, 'art5', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(documento.urn!, state.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 5º do Projeto, o seguinte Capítulo I-1:');
  });
});
