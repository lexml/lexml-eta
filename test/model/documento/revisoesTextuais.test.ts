import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerJustificacao } from '../../../src/model/lexml/documento/conversor/justificacao';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado, RevisoesLexEdit } from '../../../src/model/lexml/documento/documentoArticulado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { formatDateTimeToIso } from '../../../src/util/date-util';
import { decodeHtml, encodeHtml } from '../../../src/util/string-util';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const JUSTIFICACAO = 'Não foi informado um texto de justificação.';
const REMISSAO = 'Corrigir remissões internas inválidas.';
const TEXTO = 'Resolver marcas de revisão de texto.';
const ARTICULACAO = 'Resolver marcas de revisão na articulação.';

const ID = 'a1b2c3d4-0000-4000-8000-000000000001';
const ID2 = 'a1b2c3d4-0000-4000-8000-000000000002';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const salvar = (dados: DadosLexEdit, remissoes?: Record<number, any[]>, modelo = novoModelo()): any => criarDocumentoArticulado(modelo, modelo.urn, remissoes, undefined, dados);

const remissaoInvalidaNoCaput = (modelo: any): Record<number, any[]> => {
  const caput = (modelo.articulacao.filhos[0] as Artigo).caput!;
  const textoRef = 'educação';
  return { [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }] };
};

// Marca de revisão no formato de `texto` do editor.
const marca = (tag: 'ins' | 'del', idRevisao: string, conteudo: string, autor: { nome?: string; idUsuario?: string; sigla?: string } = {}): string =>
  `<${tag} usuario="${autor.nome ?? 'Fulano de Tal'}" date="2026-05-11 15:51:00 " id-revisao="${idRevisao}"` +
  (autor.idUsuario ? ` id-usuario="${autor.idUsuario}"` : '') +
  (autor.sigla ? ` sigla-usuario="${autor.sigla}"` : '') +
  `>${conteudo}</${tag}>`;

const FULANO = { idUsuario: 'sf:fulano', sigla: 'FT' };

// Nota de rodapé no formato de `texto` do editor.
const notaRodape = (textoHtml: string): string =>
  `<lexml-eta-nota-rodape class="lexml-eta-nota-rodape" contenteditable="false" id-lexml-eta-nota-rodape="nr1" numero="1" texto="${encodeHtml(
    textoHtml
  )}">1</lexml-eta-nota-rodape>`;

// Revisão da hierarquia já montada, como `montaRevisoesArticulacao` entrega ao montador.
const revisoesDaHierarquia = (usuario: { idUsuario: string; nome: string; sigla?: string }): RevisoesLexEdit => ({
  revisoesArticulacao: {
    TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisoesArticulacao',
    revisaoArticulacao: [
      {
        TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisaoArticulacao',
        refIdDispositivo: 'art1',
        revisao: 'alterado',
        refIdUsuario: usuario.idUsuario,
        data: '2026-05-11T10:00:00-03:00',
      },
    ],
  },
  usuarios: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuarios', usuario: [{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', ...usuario }] },
});

describe('Revisões de texto — metadados ao salvar (especificações 09, 12 e 13)', () => {
  it('grava um RevisaoTextual para cada ins/del, com o id, o usuário e a data', () => {
    const lexedit = lexeditSalvo(salvar({ justificacao: `<p>${marca('del', ID, 'velho', FULANO)}${marca('ins', ID, 'novo', FULANO)}</p>` }));
    expect(lexedit.revisoesTextuais).to.deep.equal({
      TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisoesTextuais',
      revisaoTextual: [`_rt${ID}_1`, `_rt${ID}_2`].map(refIdRevisao => ({
        TYPE_NAME: 'br_gov_lexml_lexedit__1.RevisaoTextual',
        refIdRevisao,
        refIdUsuario: 'sf:fulano',
        data: formatDateTimeToIso('2026-05-11 15:51:00'),
      })),
    });
  });

  it('o refIdRevisao de cada RevisaoTextual é o id do ins/del gravado na justificação', () => {
    const documento = salvar({ justificacao: `<p>a ${marca('ins', ID, 'b')} ${marca('del', ID2, 'c')}</p>` });
    const ids = documento.value.projetoNorma.justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content
      .filter((c: any) => typeof c !== 'string')
      .map((c: any) => c.value.id);
    expect(lexeditSalvo(documento).revisoesTextuais.revisaoTextual.map((r: any) => r.refIdRevisao)).to.deep.equal(ids);
  });

  it('só revisões de texto: grava Usuarios com o autor da marca e não grava RevisoesArticulacao', () => {
    const lexedit = lexeditSalvo(salvar({ justificacao: `<p>${marca('ins', ID, 'novo', FULANO)}</p>` }));
    expect(lexedit.usuarios).to.deep.equal({
      TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuarios',
      usuario: [{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }],
    });
    expect(lexedit).to.not.have.property('revisoesArticulacao');
  });

  it('marca sem identificador do usuário usa o nome em Usuarios e no refIdUsuario', () => {
    const lexedit = lexeditSalvo(salvar({ justificacao: `<p>${marca('ins', ID, 'novo')}</p>` }));
    expect(lexedit.usuarios.usuario).to.deep.equal([{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', idUsuario: 'Fulano de Tal', nome: 'Fulano de Tal' }]);
    expect(lexedit.revisoesTextuais.revisaoTextual[0].refIdUsuario).to.equal('Fulano de Tal');
  });

  it('mesmo usuário nos dois tipos de revisão é registrado uma vez, com a sigla', () => {
    const lexedit = lexeditSalvo(
      salvar({ justificacao: `<p>${marca('ins', ID, 'novo', FULANO)}</p>`, revisoes: revisoesDaHierarquia({ idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }) })
    );
    expect(lexedit.usuarios.usuario).to.deep.equal([{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }]);
    expect(lexedit.revisoesArticulacao.revisaoArticulacao[0].refIdUsuario).to.equal('sf:fulano');
    expect(lexedit.revisoesTextuais.revisaoTextual[0].refIdUsuario).to.equal('sf:fulano');
  });

  it('usuários distintos: primeiro os da hierarquia, depois os das marcas, sem repetir', () => {
    const justificacao = `<p>${marca('ins', ID, 'a', { nome: 'Ciclana', idUsuario: 'sf:ciclana' })}${marca('del', ID2, 'b', FULANO)}${marca('ins', ID2, 'c', {
      nome: 'Ciclana',
      idUsuario: 'sf:ciclana',
    })}</p>`;
    const lexedit = lexeditSalvo(salvar({ justificacao, revisoes: revisoesDaHierarquia({ idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }) }));
    expect(lexedit.usuarios.usuario.map((u: any) => u.idUsuario)).to.deep.equal(['sf:fulano', 'sf:ciclana']);
  });

  it('grava as quatro pendências na ordem da especificação 13', () => {
    const modelo = novoModelo();
    const lexedit = lexeditSalvo(
      salvar(
        {
          pendencias: [JUSTIFICACAO],
          justificacao: `<p>${marca('ins', ID, 'novo', FULANO)}</p>`,
          revisoes: revisoesDaHierarquia({ idUsuario: 'sf:fulano', nome: 'Fulano de Tal' }),
        },
        remissaoInvalidaNoCaput(modelo),
        modelo
      )
    );
    expect(lexedit.pendencias.pendencia).to.deep.equal([JUSTIFICACAO, REMISSAO, TEXTO, ARTICULACAO]);
  });

  it('sem marcas não grava RevisoesTextuais nem a pendência', () => {
    const documento = salvar({ justificacao: '<p>Texto sem marcas.</p>' });
    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('marca só com o cursor não grava RevisoesTextuais nem a pendência', () => {
    const documento = salvar({ justificacao: `<p>a${marca('ins', ID, '﻿')}b</p>` });
    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('sem justificação nos dados (anexo de parecer) não grava o grupo', () => {
    const lexedit = lexeditSalvo(salvar({ pendencias: [JUSTIFICACAO] }));
    expect(lexedit).to.not.have.property('revisoesTextuais');
    expect(lexedit).to.not.have.property('usuarios');
    expect(lexedit.pendencias.pendencia).to.not.include(TEXTO);
  });
});

const lerMarcas = (html: string): Element[] => Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('ins, del'));

// Lê a justificação do documento salvo como o editor faz ao abrir.
const abrir = (documento: any): string => lerJustificacao(documento, lerMetadadoLexEdit(documento).revisoesTextuais);

describe('Revisões de texto — abrir (especificações 09 e 12)', () => {
  it('lê o mapa de RevisaoTextual com o autor de Usuarios e a data local', () => {
    const documento = salvar({ justificacao: `<p>${marca('ins', ID, 'novo', FULANO)}</p>` });
    const lidas = lerMetadadoLexEdit(documento).revisoesTextuais!;
    expect(Object.keys(lidas)).to.deep.equal([`_rt${ID}_1`]);
    expect(lidas[`_rt${ID}_1`].usuario).to.include({ nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' });
    expect(lidas[`_rt${ID}_1`].dataHora).to.equal('2026-05-11 15:51:00');
  });

  it('documento sem RevisoesTextuais não tem revisoesTextuais nos dados lidos', () => {
    expect(lerMetadadoLexEdit(salvar({ justificacao: '<p>Sem marcas.</p>' }))).to.not.have.property('revisoesTextuais');
  });

  it('recria ins e del com os atributos do editor', () => {
    const [ins, del] = lerMarcas(abrir(salvar({ justificacao: `<p>a ${marca('ins', ID, 'novo', FULANO)}${marca('del', ID2, 'velho', FULANO)} b</p>` })));
    expect(ins.tagName).to.equal('INS');
    expect(del.tagName).to.equal('DEL');
    expect(ins.textContent).to.equal('novo');
    expect(del.textContent).to.equal('velho');
    expect(Object.fromEntries(Array.from(ins.attributes).map(a => [a.name, a.value]))).to.deep.equal({
      usuario: 'Fulano de Tal',
      date: '2026-05-11 15:51:00 ',
      'id-revisao': ID,
      'id-usuario': 'sf:fulano',
      'sigla-usuario': 'FT',
    });
    expect(del.getAttribute('id-revisao')).to.equal(ID2);
  });

  it('recompõe o grupo de uma exclusão gravada em dois del', () => {
    const marcas = lerMarcas(abrir(salvar({ justificacao: `<p>${marca('del', ID, 'texto ')}<strong>${marca('del', ID, 'negrito')}</strong></p>` })));
    expect(marcas.map(m => m.getAttribute('id-revisao'))).to.deep.equal([ID, ID]);
    expect(marcas[1].parentElement!.tagName).to.equal('B');
  });

  it('usuário não registrado em Usuarios usa o refIdUsuario como autor', () => {
    const documento = salvar({ justificacao: `<p>${marca('ins', ID, 'novo', FULANO)}</p>` });
    delete lexeditSalvo(documento).usuarios;
    const [ins] = lerMarcas(abrir(documento));
    expect(ins.getAttribute('usuario')).to.equal('sf:fulano');
    expect(ins.getAttribute('id-usuario')).to.equal('sf:fulano');
  });

  it('ins/del sem RevisaoTextual vira marca de "Anônimo" com a data da abertura', () => {
    const documento = salvar({ justificacao: `<p>${marca('del', ID, 'velho', FULANO)}</p>` });
    delete lexeditSalvo(documento).revisoesTextuais;
    const [del] = lerMarcas(abrir(documento));
    expect(del.getAttribute('usuario')).to.equal('Anônimo');
    expect(del.hasAttribute('id-usuario')).to.be.false;
    expect(Date.parse(del.getAttribute('date')!.trim().replace(' ', 'T'))).to.be.closeTo(Date.now(), 120000);
    expect(del.getAttribute('id-revisao')).to.not.be.empty;
  });

  it('ins/del sem id ganha um id-revisao novo', () => {
    const p = { name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'p' }, value: { content: [{ name: { localPart: 'del' }, value: { content: ['x'] } }] } };
    const [del] = lerMarcas(lerJustificacao({ value: { projetoNorma: { justificacao: [{ partePrincipal: { agrupamentoHierarquicoOrDivOrAgrupamento: [p] } }] } } }));
    expect(del.getAttribute('id-revisao')).to.match(/^[0-9a-f-]{36}$/);
    expect(del.getAttribute('usuario')).to.equal('Anônimo');
  });

  it('id _rt sem sufixo usa o resto como id-revisao (exemplo da especificação 09)', () => {
    const documento = salvar({ justificacao: `<p>${marca('ins', 'r1', 'novo', FULANO)}</p>` });
    const ins = documento.value.projetoNorma.justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content[0];
    ins.value.id = '_rt1';
    lexeditSalvo(documento).revisoesTextuais.revisaoTextual[0].refIdRevisao = '_rt1';
    const [lida] = lerMarcas(abrir(documento));
    expect(lida.getAttribute('id-revisao')).to.equal('1');
    expect(lida.getAttribute('usuario')).to.equal('Fulano de Tal');
  });

  it('ins/del dentro do texto da nota de rodapé fica só com o conteúdo', () => {
    const nota = { name: { localPart: 'NotaDeRodape' }, value: { content: ['a ', { name: { localPart: 'ins' }, value: { id: '_rtx_1', content: ['b'] } }] } };
    const p = { name: { localPart: 'p' }, value: { content: ['t', nota] } };
    const html = lerJustificacao({ value: { projetoNorma: { justificacao: [{ partePrincipal: { agrupamentoHierarquicoOrDivOrAgrupamento: [p] } }] } } });
    const el = new DOMParser().parseFromString(html, 'text/html').querySelector('lexml-eta-nota-rodape')!;
    expect(decodeHtml(el.getAttribute('texto')!)).to.equal('<p>a b</p>');
    expect(lerMarcas(html)).to.be.empty;
  });

  it('ida e volta no modelo: salvar o HTML lido gera a mesma Justificacao e as mesmas revisões', () => {
    const justificacao =
      `<p>Texto ${marca('ins', ID, 'novo', FULANO)} e ${marca('del', ID2, 'velho', { nome: 'Ciclana', idUsuario: 'sf:ciclana' })}${marca('ins', ID2, 'outro', {
        nome: 'Ciclana',
        idUsuario: 'sf:ciclana',
      })}.</p>` + `<p>${marca('del', ID, 'a ')}<strong>${marca('del', ID, 'b')}</strong>${marca('del', ID, `c${notaRodape('<p>Da exclusão.</p>')}`)}</p>`;
    const salvo = salvar({ justificacao });
    const resalvo = salvar({ justificacao: abrir(salvo) });
    expect(resalvo.value.projetoNorma.justificacao).to.deep.equal(salvo.value.projetoNorma.justificacao);
    expect(lexeditSalvo(resalvo)).to.deep.equal(lexeditSalvo(salvo));
    expect(lexeditSalvo(salvo).revisoesTextuais.revisaoTextual).to.have.length(6);
  });
});
