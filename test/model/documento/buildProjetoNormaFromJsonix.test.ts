import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { NORMA_DEFAULT } from '../../doc/parser/normaDefault';
import { PROJETO_DEFAULT } from '../../doc/parser/projetoDefault';
import { NORMA_COM_PREAMBULO_HTML } from '../../assets/teste_preambulo_build_projetoNorma';

let documento: ProjetoNorma;

describe('Parser de norma default', () => {
  before(function () {
    documento = buildProjetoNormaFromJsonix(NORMA_DEFAULT);
  });
  it('Deveria apresentar um documento do tipo norma', () => {
    expect(documento?.classificacao).equals(ClassificacaoDocumento.NORMA);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.tipo?.urn).equals(undefined);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('');
  });
  it('Deveria apresentar ementa vazia', () => {
    expect(documento?.ementa?.texto).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});

describe('Parser de projeto default', () => {
  before(function () {
    documento = buildProjetoNormaFromJsonix(PROJETO_DEFAULT);
  });
  it('Deveria apresentar um documento classificado como projeto', () => {
    expect(documento?.classificacao).equals(ClassificacaoDocumento.PROJETO);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.tipo?.urn).equals(undefined);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('');
  });
  it('Deveria apresentar ementa vazia', () => {
    expect(documento?.ementa?.texto).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});

describe('Parser de norma com preâmbulo contendo HTML', () => {
  let documentoHtml: ProjetoNorma;

  before(function () {
    documentoHtml = buildProjetoNormaFromJsonix(NORMA_COM_PREAMBULO_HTML);
  });

  it('Deveria preservar tag <b> no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<b>');
    expect(documentoHtml?.preambulo).to.include('</b>');
  });

  it('Deveria preservar tag <i> no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<i>');
    expect(documentoHtml?.preambulo).to.include('</i>');
  });

  it('Deveria conter o texto formatado corretamente no preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('<b>no uso da atribuição</b>');
    expect(documentoHtml?.preambulo).to.include('<i>adopta a seguinte Medida Provisória</i>');
  });

  it('Deveria conter todo o conteúdo do preâmbulo', () => {
    expect(documentoHtml?.preambulo).to.include('O PRESIDENTE DA REPÚBLICA,');
    expect(documentoHtml?.preambulo).to.include('que lhe confere o art. 62 da Constituição,');
    expect(documentoHtml?.preambulo).to.include(', com força de lei:');
  });
});
