import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';

describe('buildJsonixMetadados', () => {
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
});
