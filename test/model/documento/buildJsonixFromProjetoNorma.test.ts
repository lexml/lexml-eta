import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';

let documento: ProjetoNorma;
let jsonix: any;

/* describe('Parser de medida provisória sem agrupador', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(TESTE_SIMPLES);
  });
  it('Deveria apresentar um documento do tipo norma', () => {
    expect(documento?.classificacao).equals(ClassificacaoDocumento.NORMA);
  });
  it('Deveria apresentar medida provisória como tipo da norma', () => {
    expect(documento?.tipo?.urn).equals('medida.provisoria');
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.epigrafe).equals('EPIGRAFE');
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento?.ementa).equals('EMENTA');
  });
  it('Deveria apresentar preâmbulo', () => {
    expect(documento?.preambulo).equals('PREAMBULO');
  });
  describe('Testando a transformação do model em jsonix', () => {
    beforeEach(function () {
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-11-11;905');
    });
    it('Deveria apresentar 18 filhos abaixo da articulação', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier.length).equals(18);
    });
    it('Deveria gerar apenas uma entrada em content quando não há referência a norma', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].name.localPart).equals('Caput');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content[0]).equals(
        'Fica instituído o Contrato de Trabalho Verde e Amarelo, modalidade de contratação destinada à criação de novos postos de trabalho para as pessoas entre dezoito e vinte e nove anos de idade, para fins de registro do primeiro emprego em Carteira de Trabalho e Previdência Social.'
      );
    });
    it('Deveria gerar mais de uma entrada no content quando possui uma referência externa', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[3].value.lXcontainersOmissis[1].value.p[0].content[0]).equals(
        'Os trabalhadores a que se refere o caput gozarão dos direitos previstos no '
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[3].value.lXcontainersOmissis[1].value.p[0].content[1].value.content[0]).equals(
        'Decreto-Lei nº 5.452, de 1º de maio de 1943'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[3].value.lXcontainersOmissis[1].value.p[0].content[1].value.href).equals(
        'urn:lex:br:federal:decreto.lei:1943-05-01;5452'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[3].value.lXcontainersOmissis[1].value.p[0].content[2]).equals(
        ' - Consolidação das Leis do Trabalho, e nas convenções e nos acordos coletivos da categoria a que pertença naquilo que não for contrário ao disposto nesta Medida Provisória.'
      );
    });
    it('Deveria gerar mais de uma entrada no content quando possui uma referência externa', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content.length).equals(5);
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content[0]).equals('O disposto no ');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content[1].value.content[0]).equals(
        'art. 451 da Consolidação das Leis do Trabalho'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content[2]).equals(', aprovada pelo ');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content[3].value.content[0]).equals('Decreto-Lei nº 5.452, de 1943');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[4].value.lXcontainersOmissis[2].value.p[0].content[4]).equals(
        ', não se aplica ao Contrato de Trabalho Verde e Amarelo.'
      );
    });
  });
}); */

describe('Parser de medida provisória com agrupador', () => {
  beforeEach(function () {
    documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
  });
  it('Deveria apresentar epigrafe', () => {
    expect(documento).not.null;
  });
  describe('Testando a transformação do model em jsonix', () => {
    beforeEach(function () {
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
      console.log(jsonix);
    });
    it('Deveria apresentar epigrafe', () => {
      expect(jsonix).not.null;
    });
  });
});
