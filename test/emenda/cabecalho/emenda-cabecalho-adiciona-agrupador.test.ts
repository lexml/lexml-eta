import { expect } from '@open-wc/testing';

import { ComandoEmendaBuilder } from '../../../src/emenda/comando-emenda-builder';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { State, DefaultState } from '../../../src/redux/state';
import { TesteCmdEmdUtil } from '../teste-cmd-emd-util';
import { PLC_ARTIGOS_AGRUPADOS } from '../../doc/parser/plc_artigos_agrupados';
import { PDL_343_2023 } from '../../doc/parser/pdl_343_2023';
import { PLP_137_2019 } from '../../doc/parser/plp_137_2019';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let projeto: ProjetoNorma;
let projetoPdl: ProjetoNorma;
let projetoPlp: ProjetoNorma;
const stateProjeto: State = new DefaultState();
const statePdl: State = new DefaultState();
const statePlp: State = new DefaultState();

describe('Cabeçalho de comando de emenda adiciona de agrupador de artigo', () => {
  beforeEach(function () {
    projeto = buildProjetoNormaFromJsonix(PLC_ARTIGOS_AGRUPADOS, true);
    projetoPdl = buildProjetoNormaFromJsonix(PDL_343_2023, true);
    projetoPlp = buildProjetoNormaFromJsonix(PLP_137_2019, true);
    stateProjeto.articulacao = projeto.articulacao;
    statePdl.articulacao = projetoPdl.articulacao;
    statePlp.articulacao = projetoPlp.articulacao;
  });

  // PARTE
  it('Inclusão de Parte Única antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePlp, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPlp.urn!, statePlp.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, a seguinte Parte Única:');
  });

  it('Inclusão de Parte Única antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, a seguinte Parte Única:');
  });

  it('Inclusão de Parte Única após o último artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art7', TipoDispositivo.parte.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 7º do Projeto, a seguinte Parte Única:');
  });

  it('Inclusão de duas Partes antes do mesmo artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º do Projeto, as seguintes Partes I e II:');
  });

  it('Inclusão de duas Partes antes de artigos não subsequentes', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.parte.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art3', TipoDispositivo.parte.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Parte I antes do art. 1º e Parte II antes do art. 3º do Projeto, com a seguinte redação:');
  });

  // LIVRO
  it('Inclusão de Livro Único antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePlp, 'art1', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPlp.urn!, statePlp.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, o seguinte Livro Único:');
  });

  it('Inclusão de Livro Único antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, o seguinte Livro Único:');
  });

  it('Inclusão de Livro Único após o último artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art7', TipoDispositivo.livro.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 7º do Projeto, o seguinte Livro Único:');
  });

  it('Inclusão de dois Livros antes do mesmo artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.livro.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º do Projeto, os seguintes Livros I e II:');
  });

  it('Inclusão de dois Livros antes de artigos não subsequentes', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.livro.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art3', TipoDispositivo.livro.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Livro I antes do art. 1º e Livro II antes do art. 3º do Projeto, com a seguinte redação:');
  });

  // TITULO
  it('Inclusão de Título Único antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePlp, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPlp.urn!, statePlp.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, o seguinte Título Único:');
  });

  it('Inclusão de Título Único antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 1º do Projeto, o seguinte Título Único:');
  });

  it('Inclusão de Título Único após o último artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art7', TipoDispositivo.titulo.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, após o art. 7º do Projeto, o seguinte Título Único:');
  });

  it('Inclusão de dois Títulos antes do mesmo artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.titulo.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 1º do Projeto, os seguintes Títulos I e II:');
  });

  it('Inclusão de dois Títulos antes de artigos não subsequentes', () => {
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art1', TipoDispositivo.titulo.tipo);
    TesteCmdEmdUtil.incluiAgrupador(statePdl, 'art3', TipoDispositivo.titulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projetoPdl.urn!, statePdl.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Título I antes do art. 1º e Título II antes do art. 3º do Projeto, com a seguinte redação:');
  });

  // CAPÍTULO
  it('Inclusão de capítulo antes de artigo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'art5', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 5º do Projeto, o seguinte Capítulo I-1:');
  });

  it('Inclusão de capítulo antes de artigo em norma alterada', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'art6', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 6º do Projeto, o seguinte Capítulo I-1:');
  });

  it('Inclusão de um primeiro capítulo antes de outro capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Capítulo I do Título I do Projeto, o seguinte Capítulo 0:');
  });

  it('Inclusão de um segundo capítulo antes de outro capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap2', TipoDispositivo.capitulo.tipo);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do Capítulo II do Título I do Projeto, o seguinte Capítulo I-1:');
  });

  // SECAO
  it('Inclusão de Seção Única antes de artigo dentro de capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescente-se, antes do art. 4º do Projeto, a seguinte Seção Única:');
  });

  it('Inclusão de duas Seções dentro do mesmo capítulo', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se, antes do art. 4º do Projeto, as seguintes Seções I e II:');
  });

  it('Inclusão de uma Seção dentro de dois capítulos distintos', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seção Única antes do art. 4º e Seção Única antes do art. 8º do Projeto, com a seguinte redação:');
  });

  it('Inclusão de duas Seções dentro de um Capítulo e uma seção dentro de outro distinto', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seções I e II antes do art. 4º e Seção Única antes do art. 8º do Projeto, com a seguinte redação:');
  });

  it('Inclusão de duas Seções dentro de dois Capítulos distintos', () => {
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap1', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap2', TipoDispositivo.secao.tipo, false);
    TesteCmdEmdUtil.incluiAgrupador(stateProjeto, 'tit1_cap2', TipoDispositivo.secao.tipo, false);
    const itemComandoEmenda = new ComandoEmendaBuilder(projeto.urn!, stateProjeto.articulacao!).getComandoEmenda().comandos[0];
    expect(itemComandoEmenda.cabecalho).to.equal('Acrescentem-se Seções I e II antes do art. 4º e Seções I e II antes do art. 8º do Projeto, com a seguinte redação:');
  });
});
