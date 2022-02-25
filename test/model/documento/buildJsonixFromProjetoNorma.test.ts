import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';
import { TESTE_SIMPLES } from '../../doc/parser/teste_simples';

let documento: ProjetoNorma;
let jsonix: any;

describe('Parser de medida provisória sem agrupador', () => {
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
});

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
    });
    it('Deveria apresentar 5 artigos abaixo da articulacao', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier.length).equals(5);
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier.map(l => l.name.flocalPart === 'Artigo').length).equals(5);
    });
    it('Deveria apresentar 3 artigos na alteração do Art. 1', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content.length).equals(3);
    });
    it('Deveria apresentar o Art. 1 na alteração, com href e indicação de aspas', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.href).equals('art1');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.abreAspas).equals('s');
    });
    it('Deveria apresentar no caput do Art. 1, da alteração do Art. 1, indicação de aspas e de NR e o texto sem NR ao final', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0].value.fechaAspas).equals(
        's'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0].value.notaAlteracao).equals(
        'NR'
      );
      expect(
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0].value.p[0].content[0]
      ).equals(
        'Fica instituído, no âmbito do Ministério da Justiça e Segurança Pública, o Fundo Nacional Antidrogas - Funad, a ser gerido pela Secretaria Nacional de Políticas sobre Drogas do Ministério da Justiça e Segurança Pública.'
      );
    });
    it('Deveria apresentar sob o Art. 2, da alteração do Art. 1, o caput e um omissis', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.href).equals(
        'art2_cpt'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.id).equals(
        'art1_cpt_alt1_art2_cpt'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[1].value.href).equals('omi1');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[1].value.id).equals(
        'art1_cpt_alt1_art2_omi1'
      );
    });
    it('Deveria apresentar sob o caput do Art. 2, da alteração do Art. 1, um omissis e um inciso', () => {
      expect(
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].name
          .localPart
      ).equals('Omissis');
      expect(
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.lXcontainersOmissis[1].name
          .localPart
      ).equals('Inciso');
      expect(
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.lXcontainersOmissis[1]
          .value.href
      ).equals('inc7');
      expect(
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.lXcontainersOmissis[1]
          .value.id
      ).equals('art1_cpt_alt1_art2_cpt_inc7');
    });
    it('Deveria apresentar o caput com texto omitido no Art. 5, da alteração do Art. 1', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[0].name.localPart).equals(
        'Caput'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[0].value.textoOmitido).equals(
        's'
      );
    });
    it('Deveria apresentar 5 dispositivos, além do caput, no Art. 5, da alteração do Art. 1', () => {
      /*       console.log(
        (MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value as any).alteracao.content[2].value
          .lXcontainersOmissis[0]
      );
      console.log(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[0].value.p[0].content);
    */

      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis.length).equals(6);

      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[0].name.localPart).equals(
        'Caput'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[1].value.href).equals('omi1');
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[1].value.id).equals(
        'art1_cpt_alt1_art5_omi1'
      );

      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[2].value.id).equals(
        'art1_cpt_alt1_art5_par1'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[3].value.id).equals(
        'art1_cpt_alt1_art5_par2'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[4].value.id).equals(
        'art1_cpt_alt1_art5_par3'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[5].value.id).equals(
        'art1_cpt_alt1_art5_par4'
      );
    });
  });
});
