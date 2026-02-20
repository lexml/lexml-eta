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
