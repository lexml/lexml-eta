import { expect } from '@open-wc/testing';
import { ProjetoNorma } from '../../src/model/documento';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { buildDocumento } from '../../src/parser/parserLexmlJsonix';
import { NORMA_DEFAULT } from '../doc/parser/normaDefault';
import { PROJETO_DEFAULT } from '../doc/parser/projetoDefault';

let documento: ProjetoNorma;

describe('Parser de norma default', () => {
  before(function () {
    documento = buildDocumento(NORMA_DEFAULT);
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
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.ementa).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});

describe('Parser de projeto default', () => {
  before(function () {
    documento = buildDocumento(PROJETO_DEFAULT);
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
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.ementa).equals('');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('');
  });
});
