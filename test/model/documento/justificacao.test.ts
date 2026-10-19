import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerJustificacao } from '../../../src/model/lexml/documento/conversor/justificacao';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Tabela no formato de `texto` do editor (fixture de test/components/editor-texto-rico/editor-texto-rico.test.ts, reduzido).
const TABELA =
  '<table table_id="h2t" border="1" style="width:80%"><tbody><tr row_id="r1">' +
  '<td class="td-q" table_id="h2t" row_id="r1" cell_id="c1" width="40%"><p class="align-center">1</p><p>2</p></td>' +
  '<td class="td-q" table_id="h2t" row_id="r1" cell_id="c2" colspan="2" rowspan="1"><p>3 4</p></td>' +
  '</tr><tr row_id="r2"><td class="td-q" table_id="h2t" row_id="r2" cell_id="c3" colspan="1" rowspan="1"><p><br></p></td></tr></tbody></table>';

const salvar = (dados: DadosLexEdit): any => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
  return criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, dados);
};

const blocosSalvos = (html: string): any[] => salvar({ justificacao: html }).value.projetoNorma.justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento;

// Remove `name` para comparar só o nome local e os valores.
const simplificar = (valor: any): any => {
  if (Array.isArray(valor)) return valor.map(simplificar);
  if (!valor || typeof valor !== 'object') return valor;
  if (valor.name?.localPart) return { [valor.name.localPart]: simplificar(valor.value) };
  return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, simplificar(v)]));
};

describe('Justificação — salvar (especificação 06)', () => {
  it('grava parágrafos formatados e listas, com as classes', () => {
    const blocos = blocosSalvos(
      '<p class="align-justify">Texto <strong>negrito</strong>, <em>itálico</em>, <u>sublinhado</u> e x<sup>2</sup>.</p><ul><li>um</li><li class="indent-1">dois</li></ul><ol><li>a</li></ol>'
    );

    expect(simplificar(blocos)).to.deep.equal([
      {
        p: {
          TYPE_NAME: 'br_gov_lexml__1.GenInline',
          clazz: 'align-justify',
          content: [
            'Texto ',
            { b: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['negrito'] } },
            ', ',
            { i: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['itálico'] } },
            ', ',
            { u: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['sublinhado'] } },
            ' e x',
            { sup: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['2'] } },
            '.',
          ],
        },
      },
      {
        ul: {
          TYPE_NAME: 'br_gov_lexml__1.HTMLlist',
          li: [
            { TYPE_NAME: 'br_gov_lexml__1.Li', content: ['um'] },
            { TYPE_NAME: 'br_gov_lexml__1.Li', clazz: 'indent-1', content: ['dois'] },
          ],
        },
      },
      { ol: { TYPE_NAME: 'br_gov_lexml__1.HTMLlist', li: [{ TYPE_NAME: 'br_gov_lexml__1.Li', content: ['a'] }] } },
    ]);
  });

  it('grava o nome completo do elemento no formato do conversor', () => {
    expect(blocosSalvos('<p>Texto.</p>')[0].name).to.deep.equal({
      namespaceURI: 'http://www.lexml.gov.br/1.0',
      localPart: 'p',
      prefix: '',
      key: '{http://www.lexml.gov.br/1.0}p',
      string: '{http://www.lexml.gov.br/1.0}p',
    });
  });

  it('grava a tabela sem controles do editor, com id, largura em style e parágrafos de célula como span', () => {
    expect(simplificar(blocosSalvos(TABELA))).to.deep.equal([
      {
        table: {
          TYPE_NAME: 'br_gov_lexml__1.Table',
          id: '_tabela1',
          style: 'width: 80%',
          border: 1,
          tr: [
            {
              TYPE_NAME: 'br_gov_lexml__1.Tr',
              tableCellElement: [
                {
                  td: {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    clazz: 'td-q',
                    style: 'width: 40%',
                    content: [
                      { span: { TYPE_NAME: 'br_gov_lexml__1.GenInline', clazz: 'p align-center', content: ['1'] } },
                      { span: { TYPE_NAME: 'br_gov_lexml__1.GenInline', clazz: 'p', content: ['2'] } },
                    ],
                  },
                },
                {
                  td: {
                    TYPE_NAME: 'br_gov_lexml__1.GenInline',
                    clazz: 'td-q',
                    colspan: 2,
                    content: [{ span: { TYPE_NAME: 'br_gov_lexml__1.GenInline', clazz: 'p', content: ['3 4'] } }],
                  },
                },
              ],
            },
            {
              TYPE_NAME: 'br_gov_lexml__1.Tr',
              tableCellElement: [{ td: { TYPE_NAME: 'br_gov_lexml__1.GenInline', clazz: 'td-q', content: [{ span: { TYPE_NAME: 'br_gov_lexml__1.GenInline', clazz: 'p' } }] } }],
            },
          ],
        },
      },
    ]);
  });

  it('descarta a célula oculta de mesclagem', () => {
    const html = '<table><tr><td colspan="2"><p>1</p></td><td merge_id="x"><p><br></p></td></tr></table>';
    expect(blocosSalvos(html)[0].value.tr[0].tableCellElement).to.have.length(1);
  });

  it('numera as tabelas na ordem do texto', () => {
    const blocos = blocosSalvos('<table><tr><td><p>1</p></td></tr></table><p>meio</p><table><tr><td><p>2</p></td></tr></table>');
    expect([blocos[0].value.id, blocos[2].value.id]).to.deep.equal(['_tabela1', '_tabela2']);
  });

  it('grava o link com xlink:href e target, sem rel', () => {
    const [p] = blocosSalvos('<p><a href="https://www.congressonacional.leg.br" rel="noopener noreferrer" target="_blank">site</a></p>');
    expect(simplificar(p.value.content)).to.deep.equal([
      { a: { TYPE_NAME: 'br_gov_lexml__1.GenInline', href: 'https://www.congressonacional.leg.br', target: '_blank', content: ['site'] } },
    ]);
  });

  it('grava a imagem dentro de um parágrafo, com a largura em style', () => {
    expect(simplificar(blocosSalvos(`<p>antes</p><img src="${PNG}" alt="logo" width="50%">`)[1])).to.deep.equal({
      p: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [{ img: { TYPE_NAME: 'br_gov_lexml__1.Img', src: PNG, alt: 'logo', style: 'width: 50%' } }] },
    });
  });

  it('grava parágrafo vazio sem conteúdo e sem br', () => {
    expect(simplificar(blocosSalvos('<p>a</p><p><br></p><p>b</p>')[1])).to.deep.equal({ p: { TYPE_NAME: 'br_gov_lexml__1.GenInline' } });
  });

  it('retira a nota de rodapé e as marcas de revisão, mantendo o texto incluído', () => {
    const [p] = blocosSalvos(
      '<p>Texto<lexml-eta-nota-rodape id-lexml-eta-nota-rodape="n1" numero="1">1</lexml-eta-nota-rodape> com <ins id-revisao="1">novo</ins><del id-revisao="2">velho</del> fim.</p>'
    );
    expect(p.value.content.join('')).to.equal('Texto com novo fim.');
  });

  it('preserva o texto literal com & e sinais de menor e maior', () => {
    const [p] = blocosSalvos('<p>A &amp; B, 1 &lt; 2 &gt; 0 e &amp;amp; escrito.</p>');
    expect(p.value.content).to.deep.equal(['A & B, 1 < 2 > 0 e &amp; escrito.']);
  });

  it('preserva o espaço entre dois elementos inline', () => {
    const [p] = blocosSalvos('<p><strong>a</strong> <em>b</em></p>');
    expect(simplificar(p.value.content)).to.deep.equal([
      { b: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['a '] } },
      { i: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['b'] } },
    ]);
  });

  for (const [caso, html] of [
    ['vazia', ''],
    ['só com parágrafos vazios', '<p><br></p><p> </p>'],
  ] as const) {
    it(`não grava Justificacao com a justificação ${caso}`, () => {
      expect(salvar({ justificacao: html }).value.projetoNorma).to.not.have.property('justificacao');
    });
  }

  it('sem justificação nos dados gera o mesmo documento de hoje', () => {
    expect(salvar({ justificacao: undefined })).to.deep.equal(salvar({}));
    expect(salvar({}).value.projetoNorma).to.not.have.property('justificacao');
  });
});

// Justificacao com os blocos informados, no formato que o conversor devolve.
const documentoComJustificacao = (...blocos: any[]): any => ({
  value: { projetoNorma: { justificacao: [{ partePrincipal: { agrupamentoHierarquicoOrDivOrAgrupamento: blocos } }] } },
});

const elemento = (localPart: string, value: any): any => ({ name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart }, value });

// O editor troca `ql-indent` por `indent` ao ler o Quill (`ajustaHtml`); simula esse passo na ida e volta.
const comoTextoDoEditor = (html: string): string => html.replace(/ql-indent/g, 'indent');

const COMPLETO =
  '<p class="align-justify">Texto <strong>negrito</strong> <em>itálico</em>, A &amp; B e <a href="https://www.congressonacional.leg.br" target="_blank">site</a>.</p>' +
  '<ul><li>um</li><li class="indent-1">dois</li></ul>' +
  TABELA +
  `<img src="${PNG}" width="50%">` +
  '<p class="ql-text-indent-0px ql-margin-bottom-0px">fim</p>';

describe('Justificação — abrir (especificação 06)', () => {
  // O espaço solto entre dois inline vai para o anterior (preservarEspacosJsonix), como nos dispositivos.
  it('lê parágrafos, listas e links no formato do editor', () => {
    expect(lerJustificacao(salvar({ justificacao: COMPLETO }))).to.include(
      '<p class="align-justify">Texto <b>negrito </b><i>itálico</i>, A &amp; B e <a href="https://www.congressonacional.leg.br" target="_blank">site</a>.</p>'
    );
  });

  it('converte indent-N em ql-indent-N sem tocar ql-text-indent-*', () => {
    const html = lerJustificacao(salvar({ justificacao: COMPLETO }));
    expect(html).to.include('<li class="ql-indent-1">dois</li>');
    expect(html).to.include('<p class="ql-text-indent-0px ql-margin-bottom-0px">fim</p>');
  });

  it('lê a tabela com a largura em style, a das colunas em atributo e os parágrafos de célula', () => {
    const tabela = new DOMParser().parseFromString(lerJustificacao(salvar({ justificacao: TABELA })), 'text/html').querySelector('table')!;
    expect(tabela.getAttribute('style')).to.equal('width: 80%');
    expect(tabela.getAttribute('border')).to.equal('1');
    expect(tabela.hasAttribute('id')).to.be.false;
    const [c1, c2] = Array.from(tabela.rows[0].cells);
    expect(c1.outerHTML).to.equal('<td class="td-q" width="40%"><p class="align-center">1</p><p>2</p></td>');
    expect(c2.outerHTML).to.equal('<td class="td-q" colspan="2"><p>3 4</p></td>');
    expect(tabela.rows[1].cells[0].outerHTML).to.equal('<td class="td-q"><p></p></td>');
  });

  it('lê a imagem de um parágrafo como bloco, com a largura em atributo', () => {
    expect(lerJustificacao(salvar({ justificacao: `<img src="${PNG}" width="50%">` }))).to.equal(`<img src="${PNG}" width="50%">`);
  });

  it('documento sem Justificacao devolve texto vazio', () => {
    expect(lerJustificacao(salvar({}))).to.equal('');
    expect(lerJustificacao({})).to.equal('');
  });

  it('concatena mais de uma Justificacao, na ordem', () => {
    const p = (texto: string): any => elemento('p', { content: [texto] });
    const documento = documentoComJustificacao(p('a'));
    documento.value.projetoNorma.justificacao.push({ partePrincipal: { agrupamentoHierarquicoOrDivOrAgrupamento: [p('b')] } });
    expect(lerJustificacao(documento)).to.equal('<p>a</p><p>b</p>');
  });

  it('preserva o texto de bloco e de inline que o editor não grava', () => {
    const div = elemento('div', { p: [elemento('p', { content: ['dentro do div'] })] });
    const comRemissao = elemento('p', { content: ['ver ', elemento('Remissao', { href: 'art1', content: ['art. 1º'] }), '.'] });
    expect(lerJustificacao(documentoComJustificacao(div, comRemissao))).to.equal('<p>dentro do div</p><p>ver art. 1º.</p>');
  });

  it('não lança erro com conteúdo malformado', () => {
    const malformado = elemento('table', { tr: [{ tableCellElement: 'x' }] });
    expect(() => lerJustificacao(documentoComJustificacao(malformado, elemento('p', { content: ['ok'] })))).to.not.throw();
    expect(lerJustificacao(documentoComJustificacao(malformado, elemento('p', { content: ['ok'] })))).to.include('<p>ok</p>');
  });

  it('salvar o HTML lido gera a mesma Justificacao', () => {
    const salvo = salvar({ justificacao: COMPLETO });
    const resalvo = salvar({ justificacao: comoTextoDoEditor(lerJustificacao(salvo)) });
    expect(resalvo.value.projetoNorma.justificacao).to.deep.equal(salvo.value.projetoNorma.justificacao);
  });
});
