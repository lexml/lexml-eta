import { expect } from '@open-wc/testing';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';

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
