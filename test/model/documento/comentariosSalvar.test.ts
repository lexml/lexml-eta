import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { SequenciaComentario } from '../../../src/model/comentario/comentario';
import { Usuario } from '../../../src/model/revisao/usuario';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const ID = 'a1b2c3d4000040008000000000000001';
const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
const CICLANO = new Usuario('Ciclano', 'sf:ciclano');

const sequencia = (id = ID, ...textos: Array<[Usuario, string]>): SequenciaComentario => ({
  id,
  comentarios: textos.map(([usuario, texto], i) => ({ usuario, texto, data: `2026-05-1${i + 1}T15:51:00-03:00` })),
});
const com = (conteudo: string, id = ID): string => `<comentario id-sequencia-comentario="${id}">${conteudo}</comentario>`;
const ins = (idRevisao: string, conteudo: string, idUsuario = 'sf:fulano'): string =>
  `<ins usuario="Fulano de Tal" date="2026-05-11 15:51:00 " id-revisao="${idRevisao}" id-usuario="${idUsuario}">${conteudo}</ins>`;

const salvar = (dados: DadosLexEdit): any => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
  return criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, dados);
};
// Sem nenhum grupo, o documento não tem MetadadoProprietario.
const lexeditOuVazio = (doc: any): any => (doc.value.metadado.metadadoProprietario?.[0] ? lexeditSalvo(doc) : {});
const textos = (p: any[]): string[] => p.map(x => x.content?.join('') ?? '');

describe('Salvar comentários da justificação (task 2.2)', () => {
  it('grava a sequência com o ref do fragmento _1, os autores, as datas e uma linha por p', () => {
    const lexedit = lexeditSalvo(salvar({ justificacao: `<p>a ${com('trecho')} b</p>`, comentarios: [sequencia(ID, [FULANO, 'Linha 1\n\nLinha 3'], [CICLANO, 'Resposta'])] }));

    const [seq] = lexedit.comentarios.sequenciaComentario;
    expect(seq.refIdElementoComentado).to.equal(`_tc${ID}_1`);
    expect(seq.comentario.map((c: any) => [c.refIdUsuario, c.data])).to.deep.equal([
      ['sf:fulano', '2026-05-11T15:51:00-03:00'],
      ['sf:ciclano', '2026-05-12T15:51:00-03:00'],
    ]);
    expect(textos(seq.comentario[0].p)).to.deep.equal(['Linha 1', '', 'Linha 3']);
    expect(textos(seq.comentario[1].p)).to.deep.equal(['Resposta']);
  });

  it('escapa o texto puro, que criarDocumentoArticulado decodifica', () => {
    const lexedit = lexeditSalvo(salvar({ justificacao: `<p>${com('t')}</p>`, comentarios: [sequencia(ID, [FULANO, 'A & B <c> &amp;'])] }));

    expect(textos(lexedit.comentarios.sequenciaComentario[0].comentario[0].p)).to.deep.equal(['A & B <c> &amp;']);
  });

  it('trecho em dois parágrafos grava uma sequência, referenciando o primeiro fragmento', () => {
    const doc = salvar({ justificacao: `<p>${com('um')}</p><p>${com('dois')}</p>`, comentarios: [sequencia(ID, [FULANO, 'x'])] });

    expect(lexeditSalvo(doc).comentarios.sequenciaComentario).to.have.length(1);
    expect(lexeditSalvo(doc).comentarios.sequenciaComentario[0].refIdElementoComentado).to.equal(`_tc${ID}_1`);
    const ids = JSON.stringify(doc.value.projetoNorma.justificacao);
    expect(ids).to.include(`"id":"_tc${ID}_1"`).and.to.include(`"id":"_tc${ID}_2"`);
  });

  it('só grava sequências com trecho, na ordem do primeiro fragmento', () => {
    const lexedit = lexeditSalvo(
      salvar({
        justificacao: `<p>${com('b', 'seq-b')}${com('a', 'seq-a')}</p>`,
        comentarios: [sequencia('seq-a', [FULANO, 'a']), sequencia('seq-sem-trecho', [FULANO, 'órfã']), sequencia('seq-b', [FULANO, 'b'])],
      })
    );

    expect(lexedit.comentarios.sequenciaComentario.map((s: any) => s.refIdElementoComentado)).to.deep.equal(['_tcseq-b_1', '_tcseq-a_1']);
  });

  it('trecho sem sequência é gravado só como conteúdo', () => {
    const doc = salvar({ justificacao: `<p>${com('solto')}</p>`, comentarios: [] });

    expect(lexeditOuVazio(doc).comentarios).to.equal(undefined);
    expect(lexeditOuVazio(doc).pendencias).to.equal(undefined);
  });

  it('sem trechos, nem Comentarios nem pendência', () => {
    const lexedit = lexeditOuVazio(salvar({ justificacao: '<p>texto</p>', comentarios: [sequencia(ID, [FULANO, 'x'])] }));

    expect(lexedit.comentarios).to.equal(undefined);
    expect(lexedit.pendencias).to.equal(undefined);
  });

  it('autores entram em Usuarios uma só vez, inclusive o que também é autor de revisão de texto', () => {
    const lexedit = lexeditSalvo(
      salvar({
        justificacao: `<p>${com(`a ${ins('r1', 'novo')}`)}</p>`,
        comentarios: [sequencia(ID, [FULANO, 'a'], [CICLANO, 'b'], [FULANO, 'c'])],
      })
    );

    expect(lexedit.usuarios.usuario.map((u: any) => u.idUsuario)).to.deep.equal(['sf:fulano', 'sf:ciclano']);
    expect(lexedit.usuarios.usuario[1]).to.deep.include({ nome: 'Ciclano' });
  });

  it('a pendência vem depois da de remissões e antes da de revisão de texto', () => {
    const lexedit = lexeditSalvo(
      salvar({ justificacao: `<p>${com(ins('r1', 'x'))}</p>`, comentarios: [sequencia(ID, [FULANO, 'a'])], pendencias: ['Não foi informado um texto de justificação.'] })
    );

    expect(lexedit.pendencias.pendencia).to.deep.equal(['Não foi informado um texto de justificação.', 'Remover comentários.', 'Resolver marcas de revisão de texto.']);
  });

  it('comentário com ins por fora e todos os ids do documento diferentes entre si', () => {
    const doc = salvar({ justificacao: `<p>${ins('r1', com('x'))}</p><p>${com('y')}</p>`, comentarios: [sequencia(ID, [FULANO, 'a'])] });
    const ids = Array.from(JSON.stringify(doc.value.projetoNorma.justificacao).matchAll(/"id":"([^"]+)"/g)).map(m => m[1]);

    expect(ids).to.have.members(['_rtr1_1', `_tc${ID}_1`, `_tc${ID}_2`]);
    expect(new Set(ids).size).to.equal(ids.length);
  });
});
