import { expect } from '@open-wc/testing';
import { Norma } from '../../src/model/documento';
import { SubTipoDocumento, TipoDocumento } from '../../src/model/documento/tipoDocumento';
import { getDocumento } from '../../src/parser/parserLexmlJsonix';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../doc/parser/mpv_885_20190617';
import { MEDIDA_PROVISORIA_SEM_ALTERACAO_SEM_AGRUPADOR } from '../doc/parser/mpv_905_20191111';

let documento: Norma | undefined;

describe('Parser de medida provisória sem alteração e sem agrupador', () => {
  before(function () {
    documento = getDocumento(MEDIDA_PROVISORIA_SEM_ALTERACAO_SEM_AGRUPADOR);
  });
  it('Deveria apresentar um documento do tipo norma', () => {
    expect(documento?.tipo).equals(TipoDocumento.NORMA);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.subTipo).equals(SubTipoDocumento.MEDIDA_PROVISORIA);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('MEDIDA PROVISÓRIA Nº 905, DE 11 DE NOVEMBRO DE 2019');
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.ementa).equals('Institui o Contrato de Trabalho Verde e Amarelo, altera a legislação trabalhista, e dá outras providências.');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals(
      'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:'
    );
  });
});

describe('Parser de medida provisória com alteração e sem agrupador', () => {
  before(function () {
    documento = getDocumento(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
  });
  it('Deveria apresentar um documento do tipo norma', () => {
    expect(documento?.tipo).equals(TipoDocumento.NORMA);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.subTipo).equals(SubTipoDocumento.MEDIDA_PROVISORIA);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('MEDIDA PROVISÓRIA Nº 885, DE 17 DE JUNHO DE 2019');
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.ementa).equals(
      'Altera a <a href="urn:lex:br:federal:lei:1986-12-19;7560"> Lei nº 7.560, de 19 de dezembro de 1986 </a>, para alterar disposições acerca do Fundo Nacional Antidrogas, a <a href="urn:lex:br:federal:lei:2006-08-23;11343"> Lei nº 11.343, de 23 de agosto de 2006 </a>, que estabelece normas para repressão à produção não autorizada e ao tráfico ilícito de drogas, e a <a href="urn:lex:br:federal:lei:1993-12-09;8745"> Lei nº 8.745, de 9 de dezembro de 1993 </a>, que dispõe sobre a contratação por tempo determinado para atender a necessidade temporária de excepcional interesse público.'
    );
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals(
      'O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:'
    );
  });
});
