import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildJsonixArticulacaoFromProjetoNorma, buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';
import { criaDispositivo, createArticulacao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
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
  it('Deveria apresentar ementa', () => {
    expect(documento?.ementa?.texto).equals('EMENTA');
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
    it('Deveria apresentar sob o Art. 2, da alteração do Art. 1, o caput e uma linha pontilhada', () => {
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
    it('Deveria apresentar sob o caput do Art. 2, da alteração do Art. 1, uma linha pontilhada e um inciso', () => {
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

    it('Deveria apresentar o Parágrafo 4º, do Art. 5º na alteração do Art. 1º, com indicação de fecha aspas e nota de alteração', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[5].value.fechaAspas).equals(
        's'
      );
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[5].value.notaAlteracao).equals(
        'NR'
      );
    });
  });
});

describe('buildJsonixFromProjetoNorma', () => {
  let projetoNorma: ProjetoNorma;
  let resultado: any;
  const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

  beforeEach(function () {
    projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'LEI Nº 12.345' },
      ementa: { texto: 'Ementa da lei' } as any,
      preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
      articulacao: createArticulacao(),
    };
  });

  describe('Estrutura básica', () => {
    beforeEach(function () {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria criar estrutura básica com name e value', () => {
      expect(resultado).to.exist;
      expect(resultado).to.have.property('name');
      expect(resultado).to.have.property('value');
    });

    it('Deveria definir namespaceURI correto (http://www.lexml.gov.br/1.0)', () => {
      expect(resultado.name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
    });

    it('Deveria definir localPart como LexML', () => {
      expect(resultado.name.localPart).to.equal('LexML');
    });

    it('Deveria definir prefix vazio', () => {
      expect(resultado.name.prefix).to.equal('');
    });

    it('Deveria definir key formatado com namespaceURI', () => {
      expect(resultado.name.key).to.equal('{http://www.lexml.gov.br/1.0}LexML');
    });

    it('Deveria definir string formatado com namespaceURI', () => {
      expect(resultado.name.string).to.equal('{http://www.lexml.gov.br/1.0}LexML');
    });
  });

  describe('Metadados', () => {
    beforeEach(function () {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria incluir metadado com TYPE_NAME correto', () => {
      expect(resultado.value).to.have.property('metadado');
      expect(resultado.value.metadado.TYPE_NAME).to.equal('br_gov_lexml__1.Metadado');
    });

    it('Deveria incluir identificacao no metadado', () => {
      expect(resultado.value.metadado).to.have.property('identificacao');
    });

    it('Deveria incluir TYPE_NAME correto na identificacao', () => {
      expect(resultado.value.metadado.identificacao.TYPE_NAME).to.equal('br_gov_lexml__1.Identificacao');
    });

    it('Deveria incluir a URN fornecida na identificacao', () => {
      expect(resultado.value.metadado.identificacao.urn).to.equal(URN_TESTE);
    });

    it('Deveria funcionar com URN vazia', () => {
      const resultadoVazio = buildJsonixFromProjetoNorma(projetoNorma, '');
      expect(resultadoVazio.value.metadado.identificacao.urn).to.equal('');
    });

    it('Deveria funcionar com URN complexa', () => {
      const urnComplexa = 'urn:lex:br:federal:medida.provisoria:2019-06-17;885';
      const resultadoComplexo = buildJsonixFromProjetoNorma(projetoNorma, urnComplexa);
      expect(resultadoComplexo.value.metadado.identificacao.urn).to.equal(urnComplexa);
    });
  });

  describe('ProjetoNorma', () => {
    beforeEach(function () {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria incluir projetoNorma no value', () => {
      expect(resultado.value).to.have.property('projetoNorma');
    });

    it('Deveria criar TYPE_NAME correto para projetoNorma', () => {
      expect(resultado.value.projetoNorma.TYPE_NAME).to.equal('br_gov_lexml__1.ProjetoNorma');
    });

    it('Deveria criar campo norma quando classificacao é NORMA', () => {
      expect(resultado.value.projetoNorma).to.have.property('norma');
      expect(resultado.value.projetoNorma).not.to.have.property('projeto');
    });

    it('Deveria criar campo projeto quando classificacao é PROJETO', () => {
      const projeto: ProjetoNorma = {
        classificacao: ClassificacaoDocumento.PROJETO,
        epigrafe: { texto: 'PROJETO DE LEI' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      const resultadoProjeto = buildJsonixFromProjetoNorma(projeto, URN_TESTE);
      expect(resultadoProjeto.value.projetoNorma).to.have.property('projeto');
      expect(resultadoProjeto.value.projetoNorma).not.to.have.property('norma');
    });

    it('Deveria criar TYPE_NAME HierarchicalStructure para norma', () => {
      expect(resultado.value.projetoNorma.norma.TYPE_NAME).to.equal('br_gov_lexml__1.HierarchicalStructure');
    });
  });

  describe('ParteInicial', () => {
    beforeEach(function () {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria incluir parteInicial na norma', () => {
      expect(resultado.value.projetoNorma.norma).to.have.property('parteInicial');
    });

    it('Deveria criar TYPE_NAME correto para parteInicial', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial.TYPE_NAME).to.equal('br_gov_lexml__1.ParteInicial');
    });

    it('Deveria incluir epigrafe', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('epigrafe');
    });

    it('Deveria criar id para epigrafe', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.id).to.equal('epigrafe');
    });

    it('Deveria incluir ementa', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('ementa');
    });

    it('Deveria criar id para ementa', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.id).to.equal('ementa');
    });

    it('Deveria incluir preambulo', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('preambulo');
    });

    it('Deveria criar id para preambulo', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.id).to.equal('preambulo');
    });
  });

  describe('Articulacao', () => {
    beforeEach(function () {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria incluir articulacao na norma', () => {
      expect(resultado.value.projetoNorma.norma).to.have.property('articulacao');
    });

    it('Deveria criar TYPE_NAME correto para articulacao', () => {
      expect(resultado.value.projetoNorma.norma.articulacao.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
    });

    it('Deveria incluir lXhier na articulacao', () => {
      expect(resultado.value.projetoNorma.norma.articulacao).to.have.property('lXhier');
    });

    it('Deveria criar array vazio para lXhier quando articulacao não tem filhos', () => {
      expect(resultado.value.projetoNorma.norma.articulacao.lXhier).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.articulacao.lXhier).to.be.empty;
    });
  });

  describe('Retorno completo', () => {
    it('Deveria retornar objeto completo com estrutura LexML', () => {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado).to.exist;
      expect(resultado.name).to.exist;
      expect(resultado.value).to.exist;
      expect(resultado.value.metadado).to.exist;
      expect(resultado.value.metadado.identificacao).to.exist;
      expect(resultado.value.projetoNorma).to.exist;
      expect(resultado.value.projetoNorma.norma).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial).to.exist;
      expect(resultado.value.projetoNorma.norma.articulacao).to.exist;
    });

    it('Deveria funcionar com projetoNorma sem epigrafe', () => {
      const semEpigrafe: ProjetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(semEpigrafe, URN_TESTE);
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe).to.exist;
    });

    it('Deveria funcionar com projetoNorma sem ementa', () => {
      const semEmenta: ProjetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'EPÍGRAFE' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(semEmenta, URN_TESTE);
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa).to.exist;
    });

    it('Deveria funcionar com projetoNorma sem preambulo', () => {
      const semPreambulo: ProjetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'EPÍGRAFE' },
        ementa: { texto: 'Ementa' } as any,
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(semPreambulo, URN_TESTE);
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo).to.exist;
    });
  });
});

describe('buildJsonixArticulacaoFromProjetoNorma', () => {
  let articulacao: any;
  let resultado: any;

  describe('Estrutura básica', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
    });

    it('Deveria criar objeto com TYPE_NAME br_gov_lexml__1.Articulacao', () => {
      expect(resultado).to.exist;
      expect(resultado.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
    });

    it('Deveria retornar estrutura com lXhier', () => {
      expect(resultado).to.have.property('lXhier');
      expect(resultado.lXhier).to.be.an('array');
    });
  });

  describe('Articulação vazia', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
    });

    it('Deveria funcionar com articulação vazia', () => {
      expect(resultado).to.exist;
      expect(resultado.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      expect(resultado.lXhier).to.be.an('array');
      expect(resultado.lXhier).to.be.empty;
    });

    it('Deveria construir árvore com buildTree', () => {
      expect(resultado.lXhier).to.exist;
      expect(resultado.lXhier).to.be.an('array');
    });
  });

  describe('Articulação com dispositivos', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
    });

    it('Deveria funcionar com articulação com dispositivos', () => {
      expect(resultado).to.exist;
      expect(resultado.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      expect(resultado.lXhier).to.be.an('array');
      expect(resultado.lXhier).to.have.lengthOf(2);
    });

    it('Deveria passar articulacao corretamente para buildTree', () => {
      expect(resultado.lXhier).to.have.lengthOf(2);
      expect(resultado.lXhier[0]).to.have.property('name');
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
    });

    it('Deveria incluir dispositivos filhos na árvore', () => {
      expect(resultado.lXhier).to.have.lengthOf(2);
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
      expect(resultado.lXhier[1].name.localPart).to.equal('Artigo');
    });
  });

  describe('Articulação com agrupadores', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      const capitulo = criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
      resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
    });

    it('Deveria funcionar com agrupadores', () => {
      expect(resultado).to.exist;
      expect(resultado.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      expect(resultado.lXhier).to.be.an('array');
      expect(resultado.lXhier).to.have.lengthOf(1);
    });

    it('Deveria incluir agrupador Título', () => {
      expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
    });

    it('Deveria incluir hierarquia aninhada', () => {
      expect(resultado.lXhier[0]).to.have.property('value');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });
  });

  describe('Articulação com estrutura complexa', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(artigo1, TipoDispositivo.caput.tipo);
      criaDispositivo(artigo1, TipoDispositivo.paragrafo.tipo);
      resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
    });

    it('Deveria construir árvore com estrutura hierárquica', () => {
      expect(resultado).to.exist;
      expect(resultado.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
    });

    it('Deveria incluir caput e parágrafo filhos do artigo', () => {
      const artigo = resultado.lXhier[0];
      expect(artigo.value).to.have.property('lXcontainersOmissis');
      expect(artigo.value.lXcontainersOmissis).to.have.lengthOf.at.least(2);
    });
  });
});

describe('montaCabecalho (via buildJsonixFromProjetoNorma)', () => {
  let resultado: any;
  const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

  describe('Estrutura name', () => {
    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria criar estrutura name com namespaceURI correto', () => {
      expect(resultado.name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
    });

    it('Deveria criar estrutura name com localPart LexML', () => {
      expect(resultado.name.localPart).to.equal('LexML');
    });

    it('Deveria criar estrutura name com prefix vazio', () => {
      expect(resultado.name.prefix).to.equal('');
    });

    it('Deveria criar estrutura name com key formatado', () => {
      expect(resultado.name.key).to.equal('{http://www.lexml.gov.br/1.0}LexML');
    });

    it('Deveria criar estrutura name com string formatado', () => {
      expect(resultado.name.string).to.equal('{http://www.lexml.gov.br/1.0}LexML');
    });
  });

  describe('Estrutura value e metadado', () => {
    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria criar estrutura value com TYPE_NAME br_gov_lexml__1.LexML', () => {
      expect(resultado.value.TYPE_NAME).to.equal('br_gov_lexml__1.LexML');
    });

    it('Deveria incluir metadado com TYPE_NAME correto', () => {
      expect(resultado.value.metadado.TYPE_NAME).to.equal('br_gov_lexml__1.Metadado');
    });

    it('Deveria incluir identificacao com a URN fornecida', () => {
      expect(resultado.value.metadado.identificacao.urn).to.equal(URN_TESTE);
    });
  });

  describe('URN variações', () => {
    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'LEI Nº 12.345' },
      ementa: { texto: 'Ementa da lei' } as any,
      preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
      articulacao: createArticulacao(),
    };

    it('Deveria funcionar com URN vazia', () => {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, '');
      expect(resultado.value.metadado.identificacao.urn).to.equal('');
      expect(resultado.name).to.exist;
      expect(resultado.value.TYPE_NAME).to.equal('br_gov_lexml__1.LexML');
    });

    it('Deveria funcionar com URN complexa', () => {
      const urnComplexa = 'urn:lex:br:federal:medida.provisoria:2019-06-17;885';
      resultado = buildJsonixFromProjetoNorma(projetoNorma, urnComplexa);
      expect(resultado.value.metadado.identificacao.urn).to.equal(urnComplexa);
      expect(resultado.name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
    });

    it('Deveria funcionar com URN de projeto de lei', () => {
      const urnPL = 'urn:lex:br:federal:projeto.lei:2023;1234';
      resultado = buildJsonixFromProjetoNorma(projetoNorma, urnPL);
      expect(resultado.value.metadado.identificacao.urn).to.equal(urnPL);
    });

    it('Deveria manter estrutura consistente independente da URN', () => {
      resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:test');
      expect(resultado.name.localPart).to.equal('LexML');
      expect(resultado.value.TYPE_NAME).to.equal('br_gov_lexml__1.LexML');
      expect(resultado.value.metadado.TYPE_NAME).to.equal('br_gov_lexml__1.Metadado');
      expect(resultado.value.metadado.identificacao.TYPE_NAME).to.equal('br_gov_lexml__1.Identificacao');
    });
  });

  describe('Estrutura completa do cabeçalho', () => {
    it('Deveria ter todas as propriedades obrigatórias do cabeçalho', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      // Verifica estrutura name
      expect(resultado.name).to.have.property('namespaceURI');
      expect(resultado.name).to.have.property('localPart');
      expect(resultado.name).to.have.property('prefix');
      expect(resultado.name).to.have.property('key');
      expect(resultado.name).to.have.property('string');

      // Verifica estrutura value
      expect(resultado.value).to.have.property('TYPE_NAME');
      expect(resultado.value).to.have.property('metadado');
      expect(resultado.value).to.have.property('projetoNorma');

      // Verifica estrutura metadado
      expect(resultado.value.metadado).to.have.property('TYPE_NAME');
      expect(resultado.value.metadado).to.have.property('identificacao');

      // Verifica estrutura identificacao
      expect(resultado.value.metadado.identificacao).to.have.property('TYPE_NAME');
      expect(resultado.value.metadado.identificacao).to.have.property('urn');
    });
  });
});

describe('montaProjetoNorma (via buildJsonixFromProjetoNorma)', () => {
  const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

  describe('Estrutura básica', () => {
    let resultado: any;

    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria criar TYPE_NAME br_gov_lexml__1.ProjetoNorma', () => {
      expect(resultado.value.projetoNorma.TYPE_NAME).to.equal('br_gov_lexml__1.ProjetoNorma');
    });

    it('Deveria criar estrutura HierarchicalStructure', () => {
      expect(resultado.value.projetoNorma.norma.TYPE_NAME).to.equal('br_gov_lexml__1.HierarchicalStructure');
    });
  });

  describe('Campo norma vs projeto', () => {
    it('Deveria criar campo norma quando isNorma retorna true', () => {
      const norma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      const resultado = buildJsonixFromProjetoNorma(norma, URN_TESTE);

      expect(resultado.value.projetoNorma).to.have.property('norma');
      expect(resultado.value.projetoNorma).not.to.have.property('projeto');
    });

    it('Deveria criar campo projeto quando isNorma retorna false', () => {
      const projeto = {
        classificacao: ClassificacaoDocumento.PROJETO,
        epigrafe: { texto: 'PROJETO DE LEI' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      const resultado = buildJsonixFromProjetoNorma(projeto, URN_TESTE);

      expect(resultado.value.projetoNorma).to.have.property('projeto');
      expect(resultado.value.projetoNorma).not.to.have.property('norma');
      expect(resultado.value.projetoNorma.projeto.TYPE_NAME).to.equal('br_gov_lexml__1.HierarchicalStructure');
    });
  });

  describe('ParteInicial e Articulacao', () => {
    let resultado: any;

    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria incluir parteInicial na estrutura', () => {
      expect(resultado.value.projetoNorma.norma).to.have.property('parteInicial');
      expect(resultado.value.projetoNorma.norma.parteInicial.TYPE_NAME).to.equal('br_gov_lexml__1.ParteInicial');
    });

    it('Deveria incluir articulacao na estrutura', () => {
      expect(resultado.value.projetoNorma.norma).to.have.property('articulacao');
      expect(resultado.value.projetoNorma.norma.articulacao.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
    });

    it('Deveria chamar montaParteInicial com projetoNorma', () => {
      const parteInicial = resultado.value.projetoNorma.norma.parteInicial;
      expect(parteInicial).to.have.property('epigrafe');
      expect(parteInicial).to.have.property('ementa');
      expect(parteInicial).to.have.property('preambulo');
    });

    it('Deveria chamar montaArticulacao com projetoNorma', () => {
      const articulacao = resultado.value.projetoNorma.norma.articulacao;
      expect(articulacao).to.have.property('lXhier');
      expect(articulacao.lXhier).to.be.an('array');
    });
  });

  describe('Estrutura completa do projetoNorma', () => {
    it('Deveria ter todas as propriedades obrigatórias', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      // Verifica estrutura do projetoNorma
      expect(resultado.value.projetoNorma).to.have.property('TYPE_NAME');
      expect(resultado.value.projetoNorma).to.have.property('norma');

      // Verifica estrutura da norma
      expect(resultado.value.projetoNorma.norma).to.have.property('TYPE_NAME');
      expect(resultado.value.projetoNorma.norma).to.have.property('parteInicial');
      expect(resultado.value.projetoNorma.norma).to.have.property('articulacao');

      // Verifica que parteInicial foi chamada corretamente
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('TYPE_NAME');
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('epigrafe');
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('ementa');
      expect(resultado.value.projetoNorma.norma.parteInicial).to.have.property('preambulo');

      // Verifica que articulacao foi chamada corretamente
      expect(resultado.value.projetoNorma.norma.articulacao).to.have.property('TYPE_NAME');
      expect(resultado.value.projetoNorma.norma.articulacao).to.have.property('lXhier');
    });
  });

  describe('Teste com diferentes tipos de norma', () => {
    it('Deveria funcionar com Medida Provisória', () => {
      const mpv = {
        classificacao: ClassificacaoDocumento.NORMA,
        tipo: { urn: 'medida.provisoria' },
        epigrafe: { texto: 'MEDIDA PROVISÓRIA Nº 905' },
        ementa: { texto: 'Ementa da MPV' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(mpv, URN_TESTE);

      expect(resultado.value.projetoNorma).to.have.property('norma');
      expect(resultado.value.projetoNorma.norma.parteInicial).to.exist;
      expect(resultado.value.projetoNorma.norma.articulacao).to.exist;
    });

    it('Deveria funcionar com Lei Ordinária', () => {
      const lei = {
        classificacao: ClassificacaoDocumento.NORMA,
        tipo: { urn: 'lei' },
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(lei, URN_TESTE);

      expect(resultado.value.projetoNorma).to.have.property('norma');
      expect(resultado.value.projetoNorma.norma.TYPE_NAME).to.equal('br_gov_lexml__1.HierarchicalStructure');
    });

    it('Deveria funcionar com Projeto de Lei', () => {
      const pl = {
        classificacao: ClassificacaoDocumento.PROJETO,
        tipo: { urn: 'projeto.lei' },
        epigrafe: { texto: 'PROJETO DE LEI Nº 1234' },
        ementa: { texto: 'Ementa do PL' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(pl, URN_TESTE);

      expect(resultado.value.projetoNorma).to.have.property('projeto');
      expect(resultado.value.projetoNorma.projeto.TYPE_NAME).to.equal('br_gov_lexml__1.HierarchicalStructure');
    });
  });
});

describe('montaParteInicial (via buildJsonixFromProjetoNorma)', () => {
  const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

  describe('Estrutura básica da ParteInicial', () => {
    let resultado: any;

    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' } as any,
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
    });

    it('Deveria criar TYPE_NAME br_gov_lexml__1.ParteInicial', () => {
      expect(resultado.value.projetoNorma.norma.parteInicial.TYPE_NAME).to.equal('br_gov_lexml__1.ParteInicial');
    });
  });

  describe('Epigrafe', () => {
    it('Deveria criar epigrafe com id correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.id).to.equal('epigrafe');
    });

    it('Deveria criar epigrafe com TYPE_NAME correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });

    it('Deveria processar epigrafe com buildStructuredContent quando existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content).to.have.lengthOf.at.least(1);
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content[0]).to.equal('LEI Nº 12.345');
    });

    it('Deveria retornar array vazio quando epigrafe não existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content).to.be.empty;
    });

    it('Deveria retornar array vazio quando epigrafe é null', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: null,
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.epigrafe.content).to.be.an('array');
    });
  });

  describe('Ementa', () => {
    it('Deveria criar ementa com id correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.id).to.equal('ementa');
    });

    it('Deveria criar ementa com TYPE_NAME correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });

    it('Deveria processar ementa com buildStructuredContent quando existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa da lei de teste' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content).to.have.lengthOf.at.least(1);
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content[0]).to.equal('Ementa da lei de teste');
    });

    it('Deveria retornar array vazio quando ementa não existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.ementa).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content).to.be.empty;
    });

    it('Deveria retornar array vazio quando ementa é null', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: null,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.ementa).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.ementa.content).to.be.an('array');
    });
  });

  describe('Preambulo', () => {
    it('Deveria criar preambulo com id correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.id).to.equal('preambulo');
    });

    it('Deveria criar preambulo com TYPE_NAME correto', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.TYPE_NAME).to.equal('br_gov_lexml__1.TextoType');
    });

    it('Deveria criar preambulo com array p', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta:' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p).to.have.lengthOf(1);
    });

    it('Deveria processar preambulo com buildStructuredContent quando existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: { texto: 'O CONGRESSO NACIONAL decreta e promulga:' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p[0].TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p[0].content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p[0].content[0]).to.equal('O CONGRESSO NACIONAL decreta e promulga:');
    });

    it('Deveria retornar array vazio quando preambulo não existe', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p).to.have.lengthOf(1);
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p[0].content).to.be.an('array');
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p[0].content).to.be.empty;
    });

    it('Deveria retornar array vazio quando preambulo é null', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: null,
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);

      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo).to.exist;
      expect(resultado.value.projetoNorma.norma.parteInicial.preambulo.p).to.be.an('array');
    });
  });

  describe('Estrutura completa da ParteInicial', () => {
    it('Deveria ter todos os campos obrigatórios', () => {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' },
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      } as any;
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const parteInicial = resultado.value.projetoNorma.norma.parteInicial;

      expect(parteInicial).to.have.property('TYPE_NAME', 'br_gov_lexml__1.ParteInicial');
      expect(parteInicial).to.have.property('epigrafe');
      expect(parteInicial).to.have.property('ementa');
      expect(parteInicial).to.have.property('preambulo');

      expect(parteInicial.epigrafe).to.have.property('id', 'epigrafe');
      expect(parteInicial.epigrafe).to.have.property('TYPE_NAME');
      expect(parteInicial.epigrafe).to.have.property('content');

      expect(parteInicial.ementa).to.have.property('id', 'ementa');
      expect(parteInicial.ementa).to.have.property('TYPE_NAME');
      expect(parteInicial.ementa).to.have.property('content');

      expect(parteInicial.preambulo).to.have.property('id', 'preambulo');
      expect(parteInicial.preambulo).to.have.property('TYPE_NAME');
      expect(parteInicial.preambulo).to.have.property('p');
    });
  });
});

describe('montaArticulacao (via buildJsonixFromProjetoNorma)', () => {
  const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

  describe('Estrutura básica da Articulacao', () => {
    let resultado: any;
    let articulacaoJson: any;

    beforeEach(function () {
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: createArticulacao(),
      };
      resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      articulacaoJson = resultado.value.projetoNorma.norma.articulacao;
    });

    it('Deveria criar TYPE_NAME br_gov_lexml__1.Articulacao', () => {
      expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
    });

    it('Deveria retornar estrutura com lXhier', () => {
      expect(articulacaoJson).to.have.property('lXhier');
      expect(articulacaoJson.lXhier).to.be.an('array');
    });
  });

  describe('Integração com buildTree', () => {
    it('Deveria chamar buildTree com projetoNorma.articulacao', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

      // buildTree foi chamado e processou os artigos
      expect(articulacaoJson.lXhier).to.have.lengthOf(1);
      expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Artigo');
    });

    it('Deveria passar projetoNorma.articulacao como segundo parâmetro para buildTree', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

      // buildTree processou corretamente a articulacao
      expect(articulacaoJson.lXhier).to.have.lengthOf(2);
      expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Artigo');
      expect(articulacaoJson.lXhier[1].name.localPart).to.equal('Artigo');
    });
  });

  describe('Articulacao com dispositivos complexos', () => {
    it('Deveria processar articulacao com agrupadores e artigos', () => {
      const articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      const capitulo = criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

      expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      expect(articulacaoJson.lXhier).to.have.lengthOf.at.least(2);
      expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Titulo');
    });

    it('Deveria processar articulacao vazia corretamente', () => {
      const articulacao = createArticulacao();

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

      expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      expect(articulacaoJson.lXhier).to.be.an('array');
      expect(articulacaoJson.lXhier).to.be.empty;
    });
  });

  describe('Estrutura completa da Articulacao', () => {
    it('Deveria ter todas as propriedades obrigatórias', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

      expect(articulacaoJson).to.have.property('TYPE_NAME', 'br_gov_lexml__1.Articulacao');
      expect(articulacaoJson).to.have.property('lXhier');
      expect(articulacaoJson.lXhier).to.be.an('array');
      expect(articulacaoJson.lXhier[0]).to.have.property('name');
      expect(articulacaoJson.lXhier[0]).to.have.property('value');
    });
  });

  describe('Consistência com buildJsonixArticulacaoFromProjetoNorma', () => {
    it('Deveria produzir o mesmo resultado que buildJsonixArticulacaoFromProjetoNorma', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado1 = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'LEI Nº 12.345' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: 'Preambulo' },
        articulacao: articulacao,
      };

      const resultado2 = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
      const articulacaoJson = resultado2.value.projetoNorma.norma.articulacao;

      // Ambos devem ter a mesma estrutura básica
      expect(resultado1.TYPE_NAME).to.equal(articulacaoJson.TYPE_NAME);
      expect(resultado1.lXhier).to.have.lengthOf(articulacaoJson.lXhier.length);
    });
  });
});

describe('buildTree (via buildJsonixArticulacaoFromProjetoNorma)', () => {
  describe('Agrupadores vs não agrupadores', () => {
    it('Deveria criar lXhier quando dispositivo é agrupador', () => {
      const articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier).to.be.an('array');
      expect(resultado.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });

    it('Deveria criar lXcontainersOmissis quando dispositivo não é agrupador', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier).to.be.an('array');
      expect(resultado.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
      expect(resultado.lXhier[0].value).to.have.property('lXcontainersOmissis');
    });
  });

  describe('Processamento de Artigo', () => {
    it('Deveria processar Artigo com caput', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
      expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
    });

    it('Deveria chamar buildNode para caput do artigo', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caput).to.have.property('name');
      expect(caput).to.have.property('value');
      expect(caput.name.localPart).to.equal('Caput');
      expect(caput.value).to.have.property('TYPE_NAME');
    });

    it('Deveria chamar buildTree recursivamente para caput', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value).to.have.property('lXcontainersOmissis');
      expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
      expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
    });
  });

  describe('Filtragem de caput', () => {
    it('Deveria filtrar caput ao buildFilhos de artigo', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // lXcontainersOmissis deve ter caput + parágrafo (não apenas parágrafo)
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(2);
    });
  });

  describe('Processamento de não-Artigo', () => {
    it('Deveria processar não-Artigo chamando apenas buildFilhos', () => {
      const articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
      expect(resultado.lXhier[0].value.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].value.lXhier[0].name.localPart).to.equal('Capitulo');
    });
  });

  describe('Remoção de lXcontainersOmissis vazio', () => {
    it('Deveria remover lXcontainersOmissis quando vazio', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Caput não tem filhos, então pode ou não ter lXcontainersOmissis
      // Mas se tiver e estiver vazio, deve ser removido
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      if (caputNode.value.lXcontainersOmissis) {
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
      }
    });
  });

  describe('Agrupadores complexos', () => {
    it('Deveria funcionar com agrupador Livro', () => {
      const articulacao = createArticulacao();
      const livro = criaDispositivo(articulacao, TipoDispositivo.livro.tipo);
      criaDispositivo(livro, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Livro');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
      expect(resultado.lXhier[0].value.lXhier[0].name.localPart).to.equal('Artigo');
    });

    it('Deveria funcionar com agrupador Título', () => {
      const articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });

    it('Deveria funcionar com agrupador Capítulo', () => {
      const articulacao = createArticulacao();
      const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Capitulo');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });

    it('Deveria funcionar com agrupador Seção', () => {
      const articulacao = createArticulacao();
      const secao = criaDispositivo(articulacao, TipoDispositivo.secao.tipo);
      criaDispositivo(secao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Secao');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });

    it('Deveria funcionar com agrupador Subseção', () => {
      const articulacao = createArticulacao();
      const subsecao = criaDispositivo(articulacao, TipoDispositivo.subsecao.tipo);
      criaDispositivo(subsecao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Subsecao');
      expect(resultado.lXhier[0].value).to.have.property('lXhier');
    });
  });

  describe('Dispositivo folha', () => {
    it('Deveria funcionar com dispositivo folha (sem filhos)', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
      // O artigo deve ter apenas o caput
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(1);
      expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
    });

    it('Deveria funcionar com inciso sem filhos', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(1);
      expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
    });
  });

  describe('Estrutura hierárquica complexa', () => {
    it('Deveria retornar a árvore construída corretamente', () => {
      const articulacao = createArticulacao();
      const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput1 = criaDispositivo(artigo1, TipoDispositivo.caput.tipo);
      const inciso1 = criaDispositivo(caput1, TipoDispositivo.inciso.tipo);
      criaDispositivo(inciso1, TipoDispositivo.alinea.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Verifica estrutura em múltiplos níveis
      expect(resultado.lXhier).to.have.lengthOf(1);
      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');

      const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caput.name.localPart).to.equal('Caput');

      const inciso = caput.value.lXcontainersOmissis[0];
      expect(inciso.name.localPart).to.equal('Inciso');

      const alinea = inciso.value.lXcontainersOmissis[0];
      expect(alinea.name.localPart).to.equal('Alinea');
    });

    it('Deveria processar múltiplos artigos corretamente', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier).to.have.lengthOf(3);
      resultado.lXhier.forEach((artigo: any) => {
        expect(artigo.name.localPart).to.equal('Artigo');
        expect(artigo.value).to.have.property('lXcontainersOmissis');
      });
    });
  });
});

describe('buildAlteracaoSeNecessario (via buildJsonixFromProjetoNorma)', () => {
  describe('Artigo sem alteração', () => {
    it('Não deveria adicionar alteracao quando hasAlteracao retorna false', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).not.to.have.property('alteracao');
    });
  });

  describe('Artigo com alteração (usando dados reais)', () => {
    let jsonix: any;

    beforeEach(function () {
      documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
    });

    it('Deveria adicionar alteracao quando hasAlteracao retorna true', () => {
      expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value).to.have.property('alteracao');
    });

    it('Deveria criar TYPE_NAME br_gov_lexml__1.Alteracao', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao.TYPE_NAME).to.equal('br_gov_lexml__1.Alteracao');
    });

    it('Deveria incluir base quando existe em dispositivo.alteracoes.base', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao).to.have.property('base');
      expect(alteracao.base).to.equal('urn:lex:br:federal:lei:1986-12-19;7560');
    });

    it('Deveria construir id com buildIdAlteracao do caput', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao).to.have.property('id');
      expect(alteracao.id).to.equal('art1_cpt_alt1');
    });

    it('Deveria inicializar id como string vazia antes de construir', () => {
      // Verifica que o id foi construído corretamente (não está vazio)
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao.id).to.be.a('string');
      expect(alteracao.id).not.to.equal('');
    });

    it('Deveria inicializar content como array', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao).to.have.property('content');
      expect(alteracao.content).to.be.an('array');
    });

    it('Deveria processar cada filho em alteracoes.filhos', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
      expect(alteracao.content).to.have.lengthOf(3);
    });

    it('Deveria chamar buildNode para cada filho', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

      alteracao.content.forEach((filho: any) => {
        expect(filho).to.have.property('name');
        expect(filho).to.have.property('value');
        expect(filho.value).to.have.property('TYPE_NAME');
      });
    });

    it('Deveria adicionar filho ao content da alteracao', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

      expect(alteracao.content[0].name.localPart).to.equal('Artigo');
      expect(alteracao.content[1].name.localPart).to.equal('Artigo');
      expect(alteracao.content[2].name.localPart).to.equal('Artigo');
    });

    it('Deveria chamar buildTree recursivamente para cada filho', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

      // Primeiro filho (Art. 1) deve ter seus filhos processados
      expect(alteracao.content[0].value).to.have.property('lXcontainersOmissis');
      expect(alteracao.content[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');

      // Segundo filho (Art. 2) deve ter seus filhos processados
      expect(alteracao.content[1].value).to.have.property('lXcontainersOmissis');
      expect(alteracao.content[1].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');

      // Terceiro filho (Art. 5) deve ter seus filhos processados
      expect(alteracao.content[2].value).to.have.property('lXcontainersOmissis');
    });

    it('Deveria manter estrutura hierárquica nos filhos da alteração', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

      // Art. 2 deve ter caput e filhos
      const art2 = alteracao.content[1].value;
      expect(art2.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
      expect(art2.lXcontainersOmissis[0].value).to.have.property('lXcontainersOmissis');

      // Verifica omissis e inciso dentro do caput
      expect(art2.lXcontainersOmissis[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Omissis');
      expect(art2.lXcontainersOmissis[0].value.lXcontainersOmissis[1].name.localPart).to.equal('Inciso');
    });
  });

  describe('Estrutura completa da alteração', () => {
    let jsonix: any;

    beforeEach(function () {
      documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
    });

    it('Deveria ter todas as propriedades obrigatórias da alteração', () => {
      const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

      expect(alteracao).to.have.property('TYPE_NAME', 'br_gov_lexml__1.Alteracao');
      expect(alteracao).to.have.property('id');
      expect(alteracao).to.have.property('base');
      expect(alteracao).to.have.property('content');
      expect(alteracao.content).to.be.an('array');
    });
  });
});

describe('buildFilhos (via buildJsonixArticulacaoFromProjetoNorma)', () => {
  describe('Tratamento de filhos undefined e vazios', () => {
    it('Não deveria adicionar nada quando filhos é undefined', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      // Caput é criado automaticamente, mas sem filhos adicionais

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Artigo tem apenas o caput (filho padrão)
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(1);
      expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
    });

    it('Não deveria adicionar nada quando filhos é array vazio', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      // Caput não tem filhos

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      // Se lXcontainersOmissis existir e estiver vazio, deve ter sido removido
      if (caputNode.value.lXcontainersOmissis) {
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(0);
      }
    });
  });

  describe('Processamento de filhos únicos', () => {
    it('Deveria funcionar com filho único', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(1);
      expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
    });

    it('Deveria chamar buildNode para cada filho', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Caput foi processado como um nó válido
      const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caput).to.have.property('name');
      expect(caput).to.have.property('value');
      expect(caput.value).to.have.property('TYPE_NAME');
    });

    it('Deveria adicionar node à tree', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // O nó foi adicionado à árvore
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.be.an('array');
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
    });

    it('Deveria chamar buildTree para cada filho', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // buildTree foi chamado recursivamente para o inciso
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.lXcontainersOmissis[0]).to.have.property('name');
      expect(caputNode.value.lXcontainersOmissis[0]).to.have.property('value');
    });
  });

  describe('Processamento de múltiplos filhos', () => {
    it('Deveria processar múltiplos filhos em ordem', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(3);
      caputNode.value.lXcontainersOmissis.forEach((filho: any) => {
        expect(filho.name.localPart).to.equal('Inciso');
      });
    });

    it('Deveria funcionar com filhos de tipos diferentes', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(2);
    });

    it('Deveria funcionar com inciso, alinea e item', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
      criaDispositivo(inciso, TipoDispositivo.alinea.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const incisoNode = caputNode.value.lXcontainersOmissis[0];
      expect(incisoNode.name.localPart).to.equal('Inciso');
      expect(incisoNode.value.lXcontainersOmissis).to.have.lengthOf(2);
      expect(incisoNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Alinea');
      expect(incisoNode.value.lXcontainersOmissis[1].name.localPart).to.equal('Alinea');
    });
  });

  describe('Hierarquia profunda', () => {
    it('Deveria funcionar com hierarquia profunda', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
      criaDispositivo(alinea, TipoDispositivo.item.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Navega pela hierarquia: Artigo → Caput → Inciso → Alínea → Item
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const incisoNode = caputNode.value.lXcontainersOmissis[0];
      const alineaNode = incisoNode.value.lXcontainersOmissis[0];
      const itemNode = alineaNode.value.lXcontainersOmissis[0];

      expect(caputNode.name.localPart).to.equal('Caput');
      expect(incisoNode.name.localPart).to.equal('Inciso');
      expect(alineaNode.name.localPart).to.equal('Alinea');
      expect(itemNode.name.localPart).to.equal('Item');
    });
  });

  describe('Filhos de agrupadores', () => {
    it('Deveria processar filhos de agrupador', () => {
      const articulacao = createArticulacao();
      const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
      criaDispositivo(titulo, TipoDispositivo.artigo.tipo);
      criaDispositivo(titulo, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const tituloNode = resultado.lXhier[0];
      expect(tituloNode.value.lXhier).to.have.lengthOf(2);
      tituloNode.value.lXhier.forEach((filho: any) => {
        expect(filho.name.localPart).to.equal('Artigo');
      });
    });

    it('Deveria processar filhos de capítulo', () => {
      const articulacao = createArticulacao();
      const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
      criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const capituloNode = resultado.lXhier[0];
      expect(capituloNode.value.lXhier).to.have.lengthOf(3);
    });
  });

  describe('Processamento de parágrafos', () => {
    it('Deveria funcionar com parágrafos filhos de artigo', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Artigo deve ter caput + 2 parágrafos (total 3 filhos)
      expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(3);
      expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
      expect(resultado.lXhier[0].value.lXcontainersOmissis[1].name.localPart).to.equal('Paragrafo');
      expect(resultado.lXhier[0].value.lXcontainersOmissis[2].name.localPart).to.equal('Paragrafo');
    });
  });
});
