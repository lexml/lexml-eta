import { expect } from '@open-wc/testing';
import { buildJsonixArticulacaoFromProjetoNorma, buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';

describe('buildJsonixContent', () => {
  describe('13.1. Sem conteúdo ou sem links', () => {
    it('Deveria retornar array com dispositivo quando campo é undefined', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = undefined;

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      // Quando texto é undefined, buildStructuredContent retorna array com o próprio dispositivo
      expect(caputNode.value.p).to.be.an('array');
      expect(caputNode.value.p).to.have.length(1);
    });

    it('Deveria retornar texto único quando não há ocorrências de regex', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto sem links';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content).to.be.an('array');
      expect(caputNode.value.p[0].content[0]).to.equal('Texto sem links');
    });

    it('Deveria cortar texto em " (NR)" quando presente', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto do dispositivo” (NR)';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content[0]).to.equal('Texto do dispositivo');
    });

    it('Deveria retornar texto completo quando não há " (NR)"', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto do dispositivo';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content[0]).to.equal('Texto do dispositivo');
    });
  });

  describe('13.2. Com links', () => {
    it('Deveria adicionar texto antes do primeiro link quando não começa com link', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto antes <a href="urn:lex:br:teste">link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content).to.be.an('array');
      expect(caputNode.value.p[0].content[0]).to.equal('Texto antes ');
      expect(caputNode.value.p[0].content[1]).to.have.property('name');
      expect(caputNode.value.p[0].content[1].name.localPart).to.equal('span');
    });

    it('Deveria processar link único corretamente', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Texto do Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content).to.be.an('array');
      expect(caputNode.value.p[0].content[0].name.localPart).to.equal('span');
      expect(caputNode.value.p[0].content[0].value.href).to.equal('urn:lex:br:teste');
      expect(caputNode.value.p[0].content[0].value.content).to.be.an('array');
      expect(caputNode.value.p[0].content[0].value.content[0]).to.equal('Texto do Link');
    });

    it('Deveria processar múltiplos links corretamente', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto <a href="urn1">link1</a> entre <a href="urn2">link2</a> fim';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content).to.have.length(5);
      expect(caputNode.value.p[0].content[0]).to.equal('Texto ');
      expect(caputNode.value.p[0].content[1].name.localPart).to.equal('span');
      expect(caputNode.value.p[0].content[2]).to.equal(' entre ');
      expect(caputNode.value.p[0].content[3].name.localPart).to.equal('span');
      expect(caputNode.value.p[0].content[4]).to.equal(' fim');
    });

    it('Deveria adicionar texto após último link', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a> texto depois';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content).to.have.length(2);
      expect(caputNode.value.p[0].content[0].name.localPart).to.equal('span');
      expect(caputNode.value.p[0].content[1]).to.equal(' texto depois');
    });

    it('Deveria chamar buildSpan para cada link', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn1">Link1</a> e <a href="urn2">Link2</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      const spans = caputNode.value.p[0].content.filter((c: any) => c.name?.localPart === 'span');
      expect(spans).to.have.length(2);
      expect(spans[0].value.href).to.equal('urn1');
      expect(spans[1].value.href).to.equal('urn2');
    });
  });

  describe('13.3. Formatação', () => {
    it('Deveria converter <strong> para <b>', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:test">Link</a> Texto <strong>negrito</strong> depois';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      // A conversão de tags acontece no texto após o link
      expect(caputNode.value.p[0].content[1]).to.include('<b>negrito</b>');
      expect(caputNode.value.p[0].content[1]).to.not.include('<strong>');
    });

    it('Deveria converter <em> para <i>', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:test">Link</a> Texto <em>itálico</em> depois';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      // A conversão de tags acontece no texto após o link
      expect(caputNode.value.p[0].content[1]).to.include('<i>itálico</i>');
      expect(caputNode.value.p[0].content[1]).to.not.include('<em>');
    });

    it('Deveria manter texto sem formatação quando não há tags', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto sem formatação';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];

      expect(caputNode.value.p[0].content[0]).to.equal('Texto sem formatação');
    });
  });
});

describe('buildSpan (via buildStructuredContent)', () => {
  describe('14.1. Estrutura básica', () => {
    it('Deveria criar name com namespaceURI correto', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.name).to.have.property('namespaceURI', 'http://www.lexml.gov.br/1.0');
    });

    it('Deveria criar name com localPart "span"', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.name).to.have.property('localPart', 'span');
    });

    it('Deveria criar name com prefix vazio', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.name).to.have.property('prefix', '');
    });

    it('Deveria criar name com key formatado', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.name).to.have.property('key', '{http://www.lexml.gov.br/1.0}span');
    });

    it('Deveria criar value com TYPE_NAME "br_gov_lexml__1.GenInline"', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value).to.have.property('TYPE_NAME', 'br_gov_lexml__1.GenInline');
    });
  });

  describe('14.2. Extração de href', () => {
    it('Deveria extrair href do atributo href da tag', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value).to.have.property('href', 'urn:lex:br:teste');
    });

    it('Deveria incluir href no value', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:federal:lei:2020-01-01;12345">Lei 13.456</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value).to.have.property('href').that.is.a('string');
    });

    it('Deveria retornar href vazio quando não existe', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="">Link com href vazio</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value).to.have.property('href', '');
    });

    it('Deveria funcionar com href complexo (urn completa)', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:federal:decreto.lei:1943-05-01;5452">Decreto-Lei nº 5.452, de 1º de maio de 1943</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value.href).to.equal('urn:lex:br:federal:decreto.lei:1943-05-01;5452');
    });
  });

  describe('14.3. Extração de conteúdo', () => {
    it('Deveria extrair conteúdo dentro da tag <a>', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Texto do Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value).to.have.property('content').that.is.an('array');
      expect(span.value.content[0]).to.equal('Texto do Link');
    });

    it('Deveria fazer trim do conteúdo', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:test">  Texto com espaços  </a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      // O trim é aplicado ao extrair o conteúdo
      expect(span.value.content[0]).to.equal('Texto com espaços');
    });

    it('Deveria incluir content como array no value', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:teste">Link</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value.content).to.be.an('array');
      expect(span.value.content).to.have.length(1);
    });

    it('Deveria retornar array com string vazia quando conteúdo é vazio', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:test"></a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const span = caputNode.value.p[0].content[0];

      expect(span.value.content).to.be.an('array');
      expect(span.value.content[0]).to.equal('');
    });
  });
});

describe('Tags HTML Inline - Testes Recomendados', () => {
  const criarProjetoNormaBasico = (textoArtigo: string) => {
    const articulacao = createArticulacao();
    const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
    artigo.rotulo = 'Art. 1º';
    (artigo as any).texto = textoArtigo;

    return {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa teste' } as any,
      preambulo: { texto: 'Preambulo' },
      articulacao,
    };
  };

  const helperValidarConteudo = (resultado: any, conteudoEsperado: any[]) => {
    const p = resultado.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0];
    expect(p).to.exist;
    expect(p.content).to.deep.equal(conteudoEsperado);
  };

  it('Deveria processar tag <b> simples', () => {
    const projetoNorma = criarProjetoNormaBasico('<b>texto em negrito</b>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'b',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}b',
          string: '{http://www.lexml.gov.br/1.0}b',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['texto em negrito'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tag <i> simples', () => {
    const projetoNorma = criarProjetoNormaBasico('<i>texto em itálico</i>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'i',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}i',
          string: '{http://www.lexml.gov.br/1.0}i',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['texto em itálico'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tags <strong> e <em> normalizadas para <b> e <i>', () => {
    const projetoNorma = criarProjetoNormaBasico('<strong>texto strong</strong> e <em>texto em</em>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'b',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}b',
          string: '{http://www.lexml.gov.br/1.0}b',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['texto strong'],
        },
      },
      ' e ',
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'i',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}i',
          string: '{http://www.lexml.gov.br/1.0}i',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['texto em'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tags aninhadas <b> com <i>', () => {
    const projetoNorma = criarProjetoNormaBasico('<b>texto <i>itálico e negrito</i> continuation</b>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'b',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}b',
          string: '{http://www.lexml.gov.br/1.0}b',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: [
            'texto ',
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'i',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}i',
                string: '{http://www.lexml.gov.br/1.0}i',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                content: ['itálico e negrito'],
              },
            },
            ' continuation',
          ],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar conteúdo misto com links dentro de <b>', () => {
    const projetoNorma = criarProjetoNormaBasico('<b>texto antes <a href="urn:teste1">link1</a> texto depois</b>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'b',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}b',
          string: '{http://www.lexml.gov.br/1.0}b',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: [
            'texto antes ',
            {
              name: {
                namespaceURI: 'http://www.lexml.gov.br/1.0',
                localPart: 'span',
                prefix: '',
                key: '{http://www.lexml.gov.br/1.0}span',
                string: '{http://www.lexml.gov.br/1.0}span',
              },
              value: {
                TYPE_NAME: 'br_gov_lexml__1.GenInline',
                href: 'urn:teste1',
                content: ['link1'],
              },
            },
            ' texto depois',
          ],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar múltiplas tags inline sequenciais', () => {
    const projetoNorma = criarProjetoNormaBasico('<b>negrito</b> normal <i>itálico</i>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'b',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}b',
          string: '{http://www.lexml.gov.br/1.0}b',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['negrito'],
        },
      },
      ' normal ',
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'i',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}i',
          string: '{http://www.lexml.gov.br/1.0}i',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['itálico'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tag <u> (sublinhado)', () => {
    const projetoNorma = criarProjetoNormaBasico('<u>texto sublinhado</u>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'u',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}u',
          string: '{http://www.lexml.gov.br/1.0}u',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['texto sublinhado'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tag <sub> (subscrito)', () => {
    const projetoNorma = criarProjetoNormaBasico('texto com <sub>subscrito</sub>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      'texto com ',
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'sub',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}sub',
          string: '{http://www.lexml.gov.br/1.0}sub',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['subscrito'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar tag <sup> (sobrescrito)', () => {
    const projetoNorma = criarProjetoNormaBasico('texto com <sup>sobrescrito</sup>');
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');

    const conteudoEsperado = [
      'texto com ',
      {
        name: {
          namespaceURI: 'http://www.lexml.gov.br/1.0',
          localPart: 'sup',
          prefix: '',
          key: '{http://www.lexml.gov.br/1.0}sup',
          string: '{http://www.lexml.gov.br/1.0}sup',
        },
        value: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          content: ['sobrescrito'],
        },
      },
    ];

    helperValidarConteudo(resultado, conteudoEsperado);
  });

  it('Deveria processar caso real do PDL 343/2023 com <b> contendo múltiplos spans', () => {
    const texto =
      '<b>Este Decreto Legislativo dispõe sobre a convocação de plebiscito, nos termos do art. 49, XV, da <a href="urn:lex:br:federal:constituicao:1988-10-05;1988">Constituição Federal</a> e da <a href="urn:lex:br:federal:lei:1998-11-18;9709">Lei 9.709, de 18 de novembro de 1998</a>.</b>';

    const projetoNorma = criarProjetoNormaBasico(texto);
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:lex:br:senado.federal:projeto.decreto.legislativo;pdl:2023;00343');

    const p = resultado.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0];

    // Verificar estrutura geral
    expect(p.content).to.be.an('array');
    expect(p.content).to.have.lengthOf(1);
    expect(p.content[0].name.localPart).to.equal('b');

    // Verificar conteúdo dentro de <b>
    const bContent = p.content[0].value.content;
    expect(bContent).to.be.an('array');
    expect(bContent).to.have.lengthOf(5);

    // Primeiro elemento: texto antes do primeiro span
    expect(bContent[0]).to.be.a('string');
    expect(bContent[0]).to.include('Este Decreto Legislativo');

    // Segundo elemento: primeiro span (Constituição Federal)
    expect(bContent[1].name.localPart).to.equal('span');
    expect(bContent[1].value.href).to.equal('urn:lex:br:federal:constituicao:1988-10-05;1988');
    expect(bContent[1].value.content).to.deep.equal(['Constituição Federal']);

    // Terceiro elemento: texto entre os spans
    expect(bContent[2]).to.equal(' e da ');

    // Quarto elemento: segundo span (Lei 9.709)
    expect(bContent[3].name.localPart).to.equal('span');
    expect(bContent[3].value.href).to.equal('urn:lex:br:federal:lei:1998-11-18;9709');
    expect(bContent[3].value.content).to.deep.equal(['Lei 9.709, de 18 de novembro de 1998']);

    // Quinto elemento: texto final
    expect(bContent[4]).to.equal('.');
  });
});

// ---------------------------------------------------------------------------
// Testes de serialização de remissão interna (Etapa 1 — PLANO_REMISSAO_SAVE_LOAD)
// ---------------------------------------------------------------------------

describe('Serialização de remissão interna', () => {
  describe('15.1. Detecção e tag Remissao', () => {
    it('deve serializar link com data-lexml-ref como Remissao', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Conforme o <a href="#lxEtaId42" data-lexml-ref="art5_cpt" class="lexml-remissao-interna" target="_self">art. 5</a> desta lei.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[1];

      expect(remissao.name.localPart).to.equal('Remissao');
    });

    it('deve usar o lexmlId como href, não o UUID interno', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="#lxEtaId42" data-lexml-ref="art5_cpt" class="lexml-remissao-interna" target="_self">art. 5</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.href).to.equal('art5_cpt');
      expect(remissao.value.href).to.not.include('#lxEtaId');
    });

    it('deve preservar o texto visível do link', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="#lxEtaId42" data-lexml-ref="art5_cpt" class="lexml-remissao-interna" target="_self">art. 5</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.content[0]).to.equal('art. 5');
    });

    it('não deve afetar links externos (sem data-lexml-ref)', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="urn:lex:br:federal:lei:2020-01-01;12345">Lei 12.345</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const node = caputNode.value.p[0].content[0];

      expect(node.name.localPart).to.equal('span');
    });
  });

  describe('15.2. Estrutura do nó Remissao', () => {
    it('deve ter namespaceURI correto', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="#lxEtaId1" data-lexml-ref="art10_par1" class="lexml-remissao-interna" target="_self">§ 1º do art. 10</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
      expect(remissao.name.key).to.equal('{http://www.lexml.gov.br/1.0}Remissao');
    });

    it('deve ter TYPE_NAME GenInline', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<a href="#lxEtaId1" data-lexml-ref="art5_cpt" class="lexml-remissao-interna">art. 5</a>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const remissao = caputNode.value.p[0].content[0];

      expect(remissao.value.TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });
  });

  describe('15.3. Texto ao redor da remissão', () => {
    it('deve preservar texto antes e depois', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'Ver o <a href="#lxEtaId5" data-lexml-ref="art5_cpt" class="lexml-remissao-interna">art. 5</a> e o <a href="#lxEtaId10" data-lexml-ref="art10_cpt" class="lexml-remissao-interna">art. 10</a> desta lei.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const content = caputNode.value.p[0].content;

      // Estrutura: ['Ver o ', Remissao(art5), ' e o ', Remissao(art10), ' desta lei.']
      expect(content[0]).to.equal('Ver o ');
      expect(content[1].name.localPart).to.equal('Remissao');
      expect(content[1].value.href).to.equal('art5_cpt');
      expect(content[3].name.localPart).to.equal('Remissao');
      expect(content[3].value.href).to.equal('art10_cpt');
    });

    it('deve misturar remissão interna e link externo no mesmo texto', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'Veja <a href="#lxEtaId5" data-lexml-ref="art5_cpt" class="lexml-remissao-interna">art. 5</a> e <a href="urn:lex:br:federal:lei:2020-01-01;123">Lei 123</a>.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const content = caputNode.value.p[0].content;

      const remissao = content.find((c: any) => c.name?.localPart === 'Remissao');
      const span = content.find((c: any) => c.name?.localPart === 'span');

      expect(remissao).to.not.be.undefined;
      expect(span).to.not.be.undefined;
      expect(remissao.value.href).to.equal('art5_cpt');
    });
  });

  describe('15.4. Remissão dentro de formatação', () => {
    it('deve serializar remissão dentro de <b> como Remissao (texto começa com <b>)', () => {
      // buildStructuredContentWithInlineElements é acionado quando o texto começa com tag inline
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = '<b>o <a href="#lxEtaId5" data-lexml-ref="art5_cpt" class="lexml-remissao-interna">art. 5</a></b>';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      const content = caputNode.value.p[0].content;

      const bNode = content.find((c: any) => c.name?.localPart === 'b');
      expect(bNode).to.not.be.undefined;

      const remissaoInB = bNode.value.content.find((c: any) => c.name?.localPart === 'Remissao');
      expect(remissaoInB).to.not.be.undefined;
      expect(remissaoInB.value.href).to.equal('art5_cpt');
    });
  });

  describe('15.5. Normalização do span do Parchment Attributor', () => {
    it('deve remover o <span data-lexml-ref> gerado pelo Parchment e serializar como Remissao', () => {
      // HTML exato gerado pelo Quill quando data-lexml-ref/data-ref-id são attributors:
      // <span data-lexml-ref="..." data-ref-id="..."><a class="lexml-remissao-interna">texto</a></span>
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'No <span data-lexml-ref="art2_cpt_inc2" data-ref-id="ref_123">' +
        '<a href="#lxEtaId42" data-lexml-ref="art2_cpt_inc2" class="lexml-remissao-interna" target="_self">' +
        'inciso II deste artigo</a></span> bla bla bla.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const content = resultado.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;

      // Não deve conter strings brutas com <span> ou </span>
      const stringsComHtml = content.filter((c: any) => typeof c === 'string' && /<\/?span/.test(c));
      expect(stringsComHtml).to.have.length(0);

      // Deve conter o nó Remissao com href correto
      const remissao = content.find((c: any) => c?.name?.localPart === 'Remissao');
      expect(remissao).to.not.be.undefined;
      expect(remissao.value.href).to.equal('art2_cpt_inc2');
    });

    it('deve preservar o texto ao redor após remover o span wrapper', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto =
        'Esebla bla bla no <span data-lexml-ref="art2_cpt_inc2" data-ref-id="ref_abc">' +
        '<a href="#lxEtaId10" data-lexml-ref="art2_cpt_inc2" class="lexml-remissao-interna" target="_self">' +
        'inciso II deste artigo</a></span> bla bla bla.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const content = resultado.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;

      expect(content[0]).to.equal('Esebla bla bla no ');
      expect(content[1]?.name?.localPart).to.equal('Remissao');
      expect(content[1]?.value?.href).to.equal('art2_cpt_inc2');
    });

    it('não deve afetar spans sem data-lexml-ref', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      // span convencional sem data-lexml-ref → não deve ser removido (não é do Parchment remissão)
      (caput as any).texto = 'Texto sem <a href="urn:lex:br:lei">link externo</a> normal.';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const content = resultado.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;

      const span = content.find((c: any) => c?.name?.localPart === 'span');
      expect(span).to.not.be.undefined;
      expect(span.value.href).to.equal('urn:lex:br:lei');
    });
  });
});

// ---------------------------------------------------------------------------
// Testes de injeção de links a partir do registry (Etapa 5 — PLANO_REMISSAO_SAVE_LOAD)
// ---------------------------------------------------------------------------

describe('Injeção de remissões a partir do registry', () => {
  const criarProjetoNorma = (textoArtigo: string) => ({
    classificacao: ClassificacaoDocumento.NORMA,
    epigrafe: { texto: 'TESTE' },
    ementa: { texto: 'Ementa' } as any,
    preambulo: { texto: '' },
    articulacao: (() => {
      const art = createArticulacao();
      const artigo = criaDispositivo(art, TipoDispositivo.artigo.tipo);
      artigo.rotulo = 'Art. 1º';
      (artigo as any).texto = textoArtigo;
      return art;
    })(),
  });

  const getCaputContent = (resultado: any) => resultado.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;

  describe('16.1. Remissão auto-detectada (texto simples)', () => {
    it('deve injetar link quando texto é simples e inicio aponta para textoRef', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      artigo.rotulo = 'Art. 3º';
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Mais um teste do art. 1 de teste teste.';
      const uuid = (caput as any).uuid ?? 99;
      (caput as any).uuid = uuid;

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao,
      };

      const remissoes: Record<number, any[]> = {
        [uuid]: [
          {
            refId: 'ref_001',
            targetLexmlId: 'art1',
            textoRef: 'art. 1',
            inicio: 15, // 'Mais um teste do '.length = 18? Vamos usar o índice real
            valida: undefined,
          },
        ],
      };

      // Ajusta inicio para corresponder ao texto real
      const texto = 'Mais um teste do art. 1 de teste teste.';
      remissoes[uuid][0].inicio = texto.indexOf('art. 1');

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', remissoes);
      const content = getCaputContent(resultado);

      const remissao = content.find((c: any) => c?.name?.localPart === 'Remissao');
      expect(remissao).to.not.be.undefined;
      expect(remissao.value.href).to.equal('art1');
      expect(remissao.value.content[0]).to.equal('art. 1');
    });

    it('deve preservar texto antes e depois da remissão injetada', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const texto = 'Conforme o art. 2 desta lei.';
      (caput as any).texto = texto;
      const uuid = 101;
      (caput as any).uuid = uuid;

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao,
      };

      const remissoes: Record<number, any[]> = {
        [uuid]: [{ refId: 'ref_x', targetLexmlId: 'art2', textoRef: 'art. 2', inicio: texto.indexOf('art. 2') }],
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', remissoes);
      const content = getCaputContent(resultado);

      expect(content[0]).to.equal('Conforme o ');
      expect(content[1]?.name?.localPart).to.equal('Remissao');
      expect(content[1]?.value?.href).to.equal('art2');
      expect(content[2]).to.equal(' desta lei.');
    });

    it('não deve injetar entradas com valida === false', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const texto = 'Texto referenciando art. 5.';
      (caput as any).texto = texto;
      const uuid = 102;
      (caput as any).uuid = uuid;

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao,
      };

      const remissoes: Record<number, any[]> = {
        [uuid]: [{ refId: 'ref_y', targetLexmlId: 'art5', textoRef: 'art. 5', inicio: texto.indexOf('art. 5'), valida: false }],
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', remissoes);
      const content = getCaputContent(resultado);

      const remissao = content.find((c: any) => c?.name?.localPart === 'Remissao');
      expect(remissao).to.be.undefined;
    });

    it('não deve duplicar link já presente no texto', () => {
      // Simula texto com <a href> já presente (como gerado pelo buildProjetoNormaFromJsonix na desserialização)
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Ver <a href="art3" data-lexml-ref="art3" class="lexml-remissao-interna" target="_self">art. 3</a> aqui.';
      const uuid = 103;
      (caput as any).uuid = uuid;

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao,
      };

      const remissoes: Record<number, any[]> = {
        [uuid]: [{ refId: 'ref_z', targetLexmlId: 'art3', textoRef: 'art. 3', inicio: 4 }],
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', remissoes);
      const content = getCaputContent(resultado);

      const remissoes_content = content.filter((c: any) => c?.name?.localPart === 'Remissao');
      expect(remissoes_content).to.have.length(1); // apenas um, não duplicado
    });
  });

  describe('16.2. Remissão em texto com HTML existente (Caso B)', () => {
    it('deve injetar remissão auto-detectada mesmo quando texto já tem outro link', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      // Texto com remissão manual já presente (com href) + referência auto-detectada sem link
      (caput as any).texto = 'Conforme <a href="art2" data-lexml-ref="art2" class="lexml-remissao-interna" target="_self">art. 2</a> e art. 3 desta lei.';
      const uuid = 104;
      (caput as any).uuid = uuid;

      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao,
      };

      const remissoes: Record<number, any[]> = {
        [uuid]: [
          { refId: 'ref_a', targetLexmlId: 'art2', textoRef: 'art. 2', inicio: 8 }, // já presente, não deve duplicar
          { refId: 'ref_b', targetLexmlId: 'art3', textoRef: 'art. 3', inicio: 99 }, // não presente, deve injetar
        ],
      };

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', remissoes);
      const content = getCaputContent(resultado);

      const remissaoArt2 = content.filter((c: any) => c?.name?.localPart === 'Remissao' && c?.value?.href === 'art2');
      const remissaoArt3 = content.filter((c: any) => c?.name?.localPart === 'Remissao' && c?.value?.href === 'art3');

      expect(remissaoArt2).to.have.length(1); // não duplicado
      expect(remissaoArt3).to.have.length(1); // injetado
    });
  });

  describe('16.3. Sem registry', () => {
    it('deve funcionar normalmente sem parâmetro remissoes', () => {
      const texto = 'Texto simples sem remissões.';
      const projetoNorma = criarProjetoNorma(texto);

      const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste');
      const content = getCaputContent(resultado);

      expect(content[0]).to.equal(texto);
    });
  });
});
