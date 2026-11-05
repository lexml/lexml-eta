import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerComentarios, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { lerJustificacao } from '../../../src/model/lexml/documento/conversor/justificacao';
import { criarDocumentoArticulado, DadosLexEdit, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { SequenciaComentario } from '../../../src/model/comentario/comentario';
import { Usuario } from '../../../src/model/revisao/usuario';
import { metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const ID = 'a1b2c3d4000040008000000000000001';
const DATA = '2026-05-11T15:51:00-03:00';
const p = (texto: string): any => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] });
const comentario = (refIdUsuario: string, data: string, ...linhas: string[]): any => ({ TYPE_NAME: 'x', refIdUsuario, data, p: linhas.map(l => p(l)) });
const sequenciaJson = (ref: string | undefined, ...comentarios: any[]): any => ({ TYPE_NAME: 'x', refIdElementoComentado: ref, comentario: comentarios });
const lexeditCom = (...sequencias: any[]): any => ({
  comentarios: { sequenciaComentario: sequencias },
  usuarios: { usuario: [{ idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }] },
});

describe('Abrir comentários da justificação — metadados (task 3.1)', () => {
  it('lê a sequência por id, com autor registrado, data como gravada e os p unidos por quebra de linha', () => {
    const lidas = lerComentarios(lexeditCom(sequenciaJson(`_tc${ID}_1`, comentario('sf:fulano', DATA, 'Linha 1', '', 'Linha 3'))));

    expect(Object.keys(lidas)).to.deep.equal([ID]);
    expect(lidas[ID].id).to.equal(ID);
    expect(lidas[ID].comentarios).to.have.length(1);
    expect(lidas[ID].comentarios[0]).to.deep.include({ data: DATA, texto: 'Linha 1\n\nLinha 3' });
    expect(lidas[ID].comentarios[0].usuario).to.deep.include({ nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' });
  });

  it('aceita o ref sem sufixo e mantém a ordem dos comentários', () => {
    const lidas = lerComentarios(lexeditCom(sequenciaJson('_tc1777387565991', comentario('sf:fulano', DATA, 'um'), comentario('sf:fulano', '2026-05-12T16:10:00-03:00', 'dois'))));

    expect(lidas['1777387565991'].comentarios.map(c => c.texto)).to.deep.equal(['um', 'dois']);
  });

  it('autor sem registro vira usuário com o próprio id', () => {
    const lidas = lerComentarios(lexeditCom(sequenciaJson(`_tc${ID}_1`, comentario('sf:ciclano', DATA, 'x'))));

    expect(lidas[ID].comentarios[0].usuario).to.deep.include({ nome: 'sf:ciclano', id: 'sf:ciclano' });
  });

  it('data inválida ou ausente vira o instante da abertura, em ISO com fuso', () => {
    const lidas = lerComentarios(lexeditCom(sequenciaJson(`_tc${ID}_1`, comentario('sf:fulano', 'ontem', 'x'), comentario('sf:fulano', '', 'y'))));

    lidas[ID].comentarios.forEach(c => expect(c.data).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/));
  });

  it('descarta a sequência sem ref _tc, sem comentário ou sem ref, e mantém a primeira de ids repetidos', () => {
    const lidas = lerComentarios(
      lexeditCom(
        sequenciaJson('art1', comentario('sf:fulano', DATA, 'dispositivo')),
        sequenciaJson('art2_cpt', comentario('sf:fulano', DATA, 'caput')),
        sequenciaJson(`_tc${ID}_1`),
        sequenciaJson(undefined, comentario('sf:fulano', DATA, 'sem ref')),
        sequenciaJson('_tcdup_1', comentario('sf:fulano', DATA, 'primeira')),
        sequenciaJson('_tcdup_2', comentario('sf:fulano', DATA, 'segunda'))
      )
    );

    expect(Object.keys(lidas)).to.deep.equal(['dup']);
    expect(lidas['dup'].comentarios[0].texto).to.equal('primeira');
  });

  it('tolera lista de um só elemento como objeto e ausência do grupo', () => {
    const lidas = lerComentarios({ comentarios: { sequenciaComentario: sequenciaJson(`_tc${ID}_1`, comentario('sf:fulano', DATA, 'x')) } });

    expect(Object.keys(lidas)).to.deep.equal([ID]);
    expect(lerComentarios(undefined)).to.deep.equal({});
    expect(lerComentarios({})).to.deep.equal({});
  });

  it('lerMetadadoLexEdit devolve comentariosLidos só quando há sequência', () => {
    const documento = novoDocumentoArticulado();
    expect(lerMetadadoLexEdit(documento)).to.not.have.property('comentariosLidos');
    documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit(lexeditCom(sequenciaJson(`_tc${ID}_1`, comentario('sf:fulano', DATA, 'x'))))];

    expect(Object.keys(lerMetadadoLexEdit(documento).comentariosLidos!)).to.deep.equal([ID]);
  });
});

describe('Abrir comentários da justificação — texto (task 3.2)', () => {
  const FULANO = new Usuario('Fulano de Tal', 'sf:fulano', 'FT');
  const sequencia = (id = ID): SequenciaComentario => ({ id, comentarios: [{ usuario: FULANO, texto: 'x', data: DATA }] });
  const com = (conteudo: string, id = ID): string => `<comentario id-sequencia-comentario="${id}">${conteudo}</comentario>`;

  const salvar = (justificacao: string, comentarios: SequenciaComentario[] = [sequencia()]): any => {
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
    const dados: DadosLexEdit = { justificacao, comentarios };
    return criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, dados);
  };
  const ler = (documento: any, ...ids: string[]): string => {
    const dados = lerMetadadoLexEdit(documento);
    return lerJustificacao(documento, dados.revisoesTextuais, ids.length ? Object.fromEntries(ids.map(i => [i, sequencia(i)])) : dados.comentariosLidos);
  };

  it('recria o comentario no mesmo ponto, com a formatação', () => {
    const html = ler(salvar(`<p>Antes ${com('trecho <strong>forte</strong>')} depois.</p>`));

    expect(html).to.equal(`<p>Antes ${com('trecho <b>forte</b>')} depois.</p>`);
  });

  it('os fragmentos _1 e _2 voltam com o mesmo id de sequência', () => {
    const html = ler(salvar(`<p>${com('um')}</p><p>${com('dois')}</p>`));

    expect(html).to.equal(`<p>${com('um')}</p><p>${com('dois')}</p>`);
  });

  it('lê o ref sem sufixo como um trecho de um só fragmento', () => {
    const documento = salvar(`<p>${com('x')}</p>`);
    const content = documento.value.projetoNorma.justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content;
    content[0].value.id = `_tc${ID}`;

    expect(ler(documento, ID)).to.equal(`<p>${com('x')}</p>`);
  });

  it('span _tc sem sequência vira só conteúdo', () => {
    const documento = salvar(`<p>a ${com('solto')} b</p>`, []);

    expect(ler(documento, 'outra')).to.equal('<p>a solto b</p>');
  });

  it('mantém ins por dentro e por fora do comentário', () => {
    const marca = (tag: string, c: string): string => `<${tag} usuario="Fulano de Tal" date="2026-05-11 15:51:00 " id-revisao="r1">${c}</${tag}>`;
    const html = ler(salvar(`<p>${com(`a ${marca('ins', 'novo')}`)}</p><p>${marca('del', com('b'))}</p>`));

    expect(html).to.match(/<comentario id-sequencia-comentario="[^"]+">a <ins [^>]*>novo<\/ins><\/comentario>/);
    expect(html).to.match(/<del [^>]*><comentario id-sequencia-comentario="[^"]+">b<\/comentario><\/del>/);
  });

  it('comentário dentro de célula de tabela volta dentro do parágrafo da célula', () => {
    const tabela = `<table table_id="t" border="1"><tbody><tr row_id="r"><td class="td-q" table_id="t" row_id="r" cell_id="c"><p>${com('na célula')}</p></td></tr></tbody></table>`;
    const html = ler(salvar(tabela));

    expect(html).to.include(`<td class="td-q"><p>${com('na célula')}</p></td>`);
  });

  it('ida e volta: salvar o HTML lido gera a mesma Justificacao', () => {
    const documento = salvar(`<p>a ${com('um')}</p><p>${com('dois')} b</p>`);
    const lido = ler(documento);

    expect(salvar(lido).value.projetoNorma.justificacao).to.deep.equal(documento.value.projetoNorma.justificacao);
  });
});
