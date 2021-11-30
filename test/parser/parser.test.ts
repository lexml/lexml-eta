import { expect } from '@open-wc/testing';
import { Norma } from '../../src/model/documento';
import { SubTipoDocumento, TipoDocumento } from '../../src/model/documento/tipoDocumento';
import { getDocumento } from '../../src/parser/parserLexmlJsonix';
import { medidaProvisoria_905_20191111 } from '../doc/parser/medidaProvisoria_905_20191111';

let documento: Norma | undefined;

describe('Parser', () => {
  beforeEach(function () {
    documento = getDocumento('');
  });
  it('Deveria apresentar um documento undefined', () => {
    expect(documento).undefined;
  });
});
describe('Parser de medida provisória', () => {
  beforeEach(function () {
    documento = getDocumento(medidaProvisoria_905_20191111);
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
