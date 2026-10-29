import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerJustificacao, montaJustificacao } from '../../../src/model/lexml/documento/conversor/justificacao';
import { formatDateTimeToIso } from '../../../src/util/date-util';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';
import { decodeHtml, encodeHtml } from '../../../src/util/string-util';

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

// Nota de rodapé no formato de `texto` do editor: `texto` é o HTML do modal, codificado.
const nota = (id: string, textoHtml: string, numero = 1): string => {
  const el = document.createElement('lexml-eta-nota-rodape');
  el.setAttribute('class', 'lexml-eta-nota-rodape');
  el.setAttribute('contenteditable', 'false');
  el.setAttribute('id-lexml-eta-nota-rodape', id);
  el.setAttribute('numero', String(numero));
  el.setAttribute('texto', encodeHtml(textoHtml));
  el.textContent = String(numero);
  return el.outerHTML;
};

const GEN = 'br_gov_lexml__1.GenInline';

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

describe('Justificação — salvar notas de rodapé (especificação 07)', () => {
  it('grava a nota no ponto da referência, com a formatação e sem número nem id', () => {
    const [p] = blocosSalvos(`<p>O conceito é definido em regulamento${nota('nr1', '<p>Texto <strong>formatado</strong> da nota.</p>', 3)}.</p>`);
    expect(simplificar(p.value.content)).to.deep.equal([
      'O conceito é definido em regulamento',
      { NotaDeRodape: { TYPE_NAME: GEN, content: ['Texto ', { b: { TYPE_NAME: GEN, content: ['formatado'] } }, ' da nota.'] } },
      '.',
    ]);
  });

  it('grava o link da nota com xlink:href e sem rel', () => {
    const [p] = blocosSalvos(`<p>a${nota('nr1', '<p>Ver <a href="https://www.congressonacional.leg.br" rel="noopener noreferrer" target="_blank">portal</a>.</p>')}</p>`);
    expect(simplificar(p.value.content[1])).to.deep.equal({
      NotaDeRodape: { TYPE_NAME: GEN, content: ['Ver ', { a: { TYPE_NAME: GEN, href: 'https://www.congressonacional.leg.br', target: '_blank', content: ['portal'] } }, '.'] },
    });
  });

  it('une os parágrafos da nota com um espaço', () => {
    const [p] = blocosSalvos(`<p>a${nota('nr1', '<p>Primeiro.</p><p><br></p><p>Segundo.</p>')}</p>`);
    expect(p.value.content[1].value.content).to.deep.equal(['Primeiro. Segundo.']);
  });

  it('grava a nota vazia sem conteúdo', () => {
    const [p] = blocosSalvos(`<p>a${nota('nr1', '<p><br></p>')}</p>`);
    expect(simplificar(p.value.content[1])).to.deep.equal({ NotaDeRodape: { TYPE_NAME: GEN } });
  });

  it('grava as notas dentro do item de lista e do span da célula', () => {
    const tabela = `<table table_id="t1" border="1"><tbody><tr row_id="r1"><td class="td-q" table_id="t1" row_id="r1" cell_id="c1"><p>2025${nota(
      'nr2',
      '<p>Na tabela.</p>',
      2
    )}</p></td></tr></tbody></table>`;
    const [lista, tab] = blocosSalvos(`<ul><li>item${nota('nr1', '<p>Na lista.</p>')}</li></ul>${tabela}`);
    expect(simplificar(lista.value.li[0].content[1])).to.deep.equal({ NotaDeRodape: { TYPE_NAME: GEN, content: ['Na lista.'] } });
    const span = tab.value.tr[0].tableCellElement[0].value.content[0];
    expect(simplificar(span)).to.deep.equal({ span: { TYPE_NAME: GEN, clazz: 'p', content: ['2025', { NotaDeRodape: { TYPE_NAME: GEN, content: ['Na tabela.'] } }] } });
  });
});

// Marca de revisão no formato de `texto` do editor.
const marca = (tag: 'ins' | 'del', idRevisao: string | undefined, conteudo: string, autor: { idUsuario?: string; sigla?: string; date?: string } = {}): string =>
  `<${tag} usuario="Fulano de Tal" date="${autor.date ?? '2026-05-11 15:51:00 '}"` +
  (idRevisao !== undefined ? ` id-revisao="${idRevisao}"` : '') +
  (autor.idUsuario ? ` id-usuario="${autor.idUsuario}"` : '') +
  (autor.sigla ? ` sigla-usuario="${autor.sigla}"` : '') +
  `>${conteudo}</${tag}>`;

describe('Justificação — salvar revisões de texto (especificação 09)', () => {
  const ID = 'a1b2c3d4-0000-4000-8000-000000000001';
  const ID2 = 'a1b2c3d4-0000-4000-8000-000000000002';

  it('grava o trecho incluído em ins e o excluído em del, com id de prefixo _rt e o seu RevisaoTextual', () => {
    const html = `<p>Texto ${marca('ins', ID, 'novo', { idUsuario: 'sf:fulano', sigla: 'FT' })}${marca('del', ID2, 'velho', { idUsuario: 'sf:fulano', sigla: 'FT' })} fim.</p>`;
    const [p] = blocosSalvos(html);
    expect(simplificar(p.value.content)).to.deep.equal([
      'Texto ',
      { ins: { TYPE_NAME: GEN, id: `_rt${ID}_1`, content: ['novo'] } },
      { del: { TYPE_NAME: GEN, id: `_rt${ID2}_1`, content: ['velho'] } },
      ' fim.',
    ]);

    const { revisoes } = montaJustificacao(html);
    expect(revisoes.map(r => r.id)).to.deep.equal([`_rt${ID}_1`, `_rt${ID2}_1`]);
    revisoes.forEach(r => {
      expect(r.usuario).to.include({ nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' });
      expect(r.data).to.equal(formatDateTimeToIso('2026-05-11 15:51:00'));
    });
  });

  it('dá ids distintos ao del e ao ins da mesma substituição', () => {
    const { justificacao, revisoes } = montaJustificacao(`<p>${marca('del', ID, 'velho')}${marca('ins', ID, 'novo')}</p>`);
    const [del, ins] = justificacao.partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content;
    expect([del.value.id, ins.value.id]).to.deep.equal([`_rt${ID}_1`, `_rt${ID}_2`]);
    expect(revisoes.map(r => r.id)).to.deep.equal([`_rt${ID}_1`, `_rt${ID}_2`]);
  });

  it('dá ids distintos aos trechos de uma exclusão que atravessa negrito', () => {
    const [p] = blocosSalvos(`<p>${marca('del', ID, 'texto ')}<strong>${marca('del', ID, 'negrito')}</strong> fim</p>`);
    expect(simplificar(p.value.content)).to.deep.equal([
      { del: { TYPE_NAME: GEN, id: `_rt${ID}_1`, content: ['texto '] } },
      { b: { TYPE_NAME: GEN, content: [{ del: { TYPE_NAME: GEN, id: `_rt${ID}_2`, content: ['negrito'] } }] } },
      ' fim',
    ]);
  });

  it('grava a nota de rodapé dentro do trecho excluído', () => {
    const [p] = blocosSalvos(`<p>a ${marca('del', ID, `velho${nota('nr1', '<p>Da exclusão.</p>')}`)}</p>`);
    expect(simplificar(p.value.content[1])).to.deep.equal({
      del: { TYPE_NAME: GEN, id: `_rt${ID}_1`, content: ['velho', { NotaDeRodape: { TYPE_NAME: GEN, content: ['Da exclusão.'] } }] },
    });
  });

  it('gera um id-revisao novo para marca sem id-revisao, com cada marca num grupo', () => {
    const { revisoes } = montaJustificacao(`<p>${marca('ins', undefined, 'a')} e ${marca('ins', undefined, 'b')}</p>`);
    expect(revisoes).to.have.length(2);
    revisoes.forEach(r => expect(r.id).to.match(/^_rt[0-9a-f-]{36}_1$/));
    expect(revisoes[0].id).to.not.equal(revisoes[1].id);
  });

  it('troca o id-revisao que não cabe num NCName, mantendo o grupo', () => {
    const { revisoes } = montaJustificacao(`<p>${marca('del', 'id com espaço', 'a')}<b>${marca('del', 'id com espaço', 'b')}</b></p>`);
    const [primeiro, segundo] = revisoes.map(r => /^_rt(.+)_(\d+)$/.exec(r.id)!);
    expect(primeiro[1]).to.match(/^[0-9a-f-]{36}$/);
    expect(segundo[1]).to.equal(primeiro[1]);
    expect([primeiro[2], segundo[2]]).to.deep.equal(['1', '2']);
  });

  it('marca sem id do usuário fica só com o nome', () => {
    const [revisao] = montaJustificacao(`<p>${marca('ins', ID, 'a')}</p>`).revisoes;
    expect(revisao.usuario.nome).to.equal('Fulano de Tal');
    expect(revisao.usuario.id).to.be.undefined;
    expect(revisao.usuario.sigla).to.be.undefined;
  });

  it('marca só com o cursor do Quill vira texto comum, sem revisão', () => {
    const html = `<p>a${marca('ins', ID, '﻿')}b</p>`;
    const { justificacao, revisoes } = montaJustificacao(html);
    expect(revisoes).to.be.empty;
    expect(justificacao.partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content.every((c: any) => typeof c === 'string')).to.be.true;
  });

  it('grava a data com o fuso, e a data inválida como o instante do salvamento', () => {
    const [valida, invalida] = montaJustificacao(`<p>${marca('ins', ID, 'a')}${marca('del', ID2, 'b', { date: 'ontem' })}</p>`).revisoes;
    expect(valida.data).to.match(/^2026-05-11T15:51:00[+-]\d{2}:\d{2}$/);
    expect(Date.parse(invalida.data)).to.be.closeTo(Date.now(), 120000);
    expect(invalida.data).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('justificação sem marcas não tem ins, del nem revisões', () => {
    const { justificacao, revisoes } = montaJustificacao('<p>Texto <strong>sem</strong> marcas.</p>');
    expect(revisoes).to.be.empty;
    expect(JSON.stringify(simplificar(justificacao))).to.not.match(/"(ins|del)"/);
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

describe('Justificação — abrir notas de rodapé (especificação 07)', () => {
  const COM_NOTAS =
    `<p>Parágrafo${nota('x1', '<p>Texto <strong>formatado</strong> &amp; <a href="https://www.congressonacional.leg.br" target="_blank">link</a>.</p>', 7)}.</p>` +
    `<ul><li>item${nota('x2', '<p>Na lista.</p>', 8)}</li></ul>` +
    `<table table_id="t1" border="1"><tbody><tr row_id="r1"><td class="td-q" table_id="t1" row_id="r1" cell_id="c1"><p>2025${nota(
      'x3',
      '<p>Na tabela.</p>',
      9
    )}</p></td></tr></tbody></table>`;

  const notasLidas = (html: string): HTMLElement[] => Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('lexml-eta-nota-rodape'));

  it('lê as notas no formato do editor, numeradas pela ordem do texto', () => {
    const notas = notasLidas(lerJustificacao(salvar({ justificacao: COM_NOTAS })));
    expect(notas.map(n => n.getAttribute('numero'))).to.deep.equal(['1', '2', '3']);
    expect(notas.map(n => n.textContent)).to.deep.equal(['1', '2', '3']);
    expect(notas.map(n => n.closest('p, li')?.tagName)).to.deep.equal(['P', 'LI', 'P']);
    expect(notas[0].getAttribute('class')).to.equal('lexml-eta-nota-rodape');
    expect(notas[0].getAttribute('contenteditable')).to.equal('false');
  });

  it('gera ids distintos, sem reaproveitar os do editor', () => {
    const ids = notasLidas(lerJustificacao(salvar({ justificacao: COM_NOTAS }))).map(n => n.getAttribute('id-lexml-eta-nota-rodape'));
    expect(new Set(ids).size).to.equal(3);
    ids.forEach(id => expect(id).to.match(/^nr\d+$/));
    expect(ids).to.not.include('x1');
  });

  it('lê o texto da nota como o HTML do modal, com a formatação', () => {
    const [primeira] = notasLidas(lerJustificacao(salvar({ justificacao: COM_NOTAS })));
    expect(decodeHtml(primeira.getAttribute('texto')!)).to.equal('<p>Texto <b>formatado</b> &amp; <a href="https://www.congressonacional.leg.br" target="_blank">link</a>.</p>');
  });

  it('salvar o HTML lido gera a mesma Justificacao, com as notas', () => {
    const salvo = salvar({ justificacao: COM_NOTAS });
    const resalvo = salvar({ justificacao: lerJustificacao(salvo) });
    expect(resalvo.value.projetoNorma.justificacao).to.deep.equal(salvo.value.projetoNorma.justificacao);
  });
});
