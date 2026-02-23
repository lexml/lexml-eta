import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { ProjetoNorma } from '../../../../src/model/lexml/documento/projetoNorma';
import { createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';

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
