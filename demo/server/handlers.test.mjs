import assert from 'node:assert/strict';
import { test } from 'node:test';
import { identificarPorUrn } from './identificacaoDocumento.mjs';
import { tratarRequisicaoDemo } from './handlers.mjs';

const corpo = r => JSON.parse(r.corpo);

test('URL fora do prefixo da demo não é tratada', () => {
  assert.equal(tratarRequisicaoDemo('/parlamentares'), undefined);
});

test('comissões: 10 por casa, só da casa pedida', () => {
  for (const casa of ['SF', 'CD', 'CN']) {
    const r = tratarRequisicaoDemo(`/demo-api/comissoes/${casa}`);
    assert.equal(r.status, 200);
    const lista = corpo(r);
    assert.equal(lista.length, 10, casa);
    assert.ok(lista.every(c => c.siglaCasaLegislativa === casa && c.sigla && c.nome));
  }
});

test('verificação: proposição existente devolve ementa e indicador de texto', () => {
  const r = tratarRequisicaoDemo('/demo-api/proposicoes/PL/5008/2023');
  assert.equal(r.status, 200);
  const dados = corpo(r);
  assert.ok(dados.ementa.length > 10);
  assert.equal(dados.textoEstruturadoDisponivel, true);
});

test('verificação: número com zeros à esquerda e sigla em minúsculas', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/pl/05008/2023').status, 200);
});

test('verificação: PLP e MPV existentes', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/PLP/197/2023').status, 200);
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/MPV/1089/2021').status, 200);
});

test('verificação: inexistente devolve 404', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/PL/1/1999').status, 404);
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/PEC/48/2023').status, 404);
});

test('texto estruturado: devolve o JSONIX do documento', () => {
  const r = tratarRequisicaoDemo('/demo-api/proposicoes/PLP/197/2023/texto');
  assert.equal(r.status, 200);
  assert.equal(corpo(r).value.metadado.identificacao.urn.includes('plp:2023;00197'), true);
});

test('PL 3/2023 existe sem texto: verificação 200 com indicador falso e texto 404', () => {
  const v = tratarRequisicaoDemo('/demo-api/proposicoes/PL/3/2023');
  assert.equal(v.status, 200);
  assert.equal(corpo(v).textoEstruturadoDisponivel, false);
  assert.equal(tratarRequisicaoDemo('/demo-api/proposicoes/PL/3/2023/texto').status, 404);
});

test('PLS: complementar só é informado quando verdadeiro', () => {
  assert.equal(corpo(tratarRequisicaoDemo('/demo-api/proposicoes/PLS/7/2015')).complementar, true);
  assert.equal('complementar' in corpo(tratarRequisicaoDemo('/demo-api/proposicoes/PLS/8/2015')), false);
});

test('importação: XML devolve 200 com um documento articulado da demo', () => {
  for (const tipo of ['application/xml', 'text/xml; charset=utf-8']) {
    const r = tratarRequisicaoDemo('/demo-api/importacao', 'POST', tipo);
    assert.equal(r.status, 200, tipo);
    assert.equal(r.tipo, 'application/json');
    assert.ok(corpo(r).value.metadado.identificacao.urn.startsWith('urn:lex:br:'));
  }
});

test('importação: PDF devolve 500 com falha interna em texto puro', () => {
  const r = tratarRequisicaoDemo('/demo-api/importacao', 'POST', 'application/pdf');
  assert.equal(r.status, 500);
  assert.match(r.tipo, /^text\/plain/);
  assert.equal(r.corpo, 'Falha interna.');
});

test('importação: DOCX e TXT devolvem 400 de conversão não implementada', () => {
  for (const tipo of ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']) {
    const r = tratarRequisicaoDemo('/demo-api/importacao', 'POST', tipo);
    assert.equal(r.status, 400, tipo);
    assert.equal(r.corpo, 'Conversão de DOCX ou TXT não implementada.');
  }
});

test('importação: outro tipo devolve 400 e GET não é tratado como importação', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/importacao', 'POST', 'image/png').corpo, 'Tipo de arquivo não suportado.');
  assert.equal(tratarRequisicaoDemo('/demo-api/importacao').status, 404);
});

test('importação: a query string com o contexto não altera a decisão pelo Content-Type', () => {
  const query = '?casa=SF&especie=substitutivo&urn=urn%3Alex%3Abr%3Asenado.federal%3Aprojeto.lei%3Bpl%3A2026%3B12%40apresentacao.substitutivo&siglaReferenciada=';
  assert.equal(tratarRequisicaoDemo(`/demo-api/importacao${query}`, 'POST', 'application/xml').status, 200);
  assert.equal(tratarRequisicaoDemo(`/demo-api/importacao${query}`, 'POST', 'application/pdf').status, 500);
});

test('rota desconhecida da demo devolve 404', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/outra').status, 404);
});

test('documentos da matéria: PL 4/2025 devolve a lista no contrato, sem expor o arquivo interno', () => {
  const r = tratarRequisicaoDemo('/demo-api/materias/PL/4/2025/documentos');
  assert.equal(r.status, 200);
  const lista = corpo(r);
  assert.equal(lista.length, 6);
  for (const d of lista) {
    assert.ok(d.id && d.titulo && d.sigla && d.numero && d.nomeAutor && d.papelAutor && d.indSexoAutor);
    assert.match(d.dataApresentacao, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal('arquivo' in d, false);
    assert.equal('urlInteiroTeor' in d, false);
  }
  assert.equal(lista.filter(d => d.textoEstruturadoDisponivel === false).length, 1);
});

test('documentos da matéria: PL 4/2025 exercita os campos opcionais (urlDocumento, ementa e tooltipDocumento)', () => {
  const lista = corpo(tratarRequisicaoDemo('/demo-api/materias/PL/4/2025/documentos'));
  assert.equal(lista.filter(d => !d.urlDocumento).length, 1, 'um documento sem urlDocumento');
  assert.equal(lista.filter(d => !d.ementa).length, 1, 'um documento sem ementa');
  assert.equal(lista.filter(d => d.tooltipDocumento).length, 1, 'um documento com tooltipDocumento');
  assert.ok(lista.filter(d => d.urlDocumento).every(d => /^https:\/\//.test(d.urlDocumento)));
});

test('documentos da matéria: sigla em minúsculas e zeros à esquerda; lista vazia; matéria sem mock devolve 404', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/materias/pl/0004/2025/documentos').status, 200);
  const vazia = tratarRequisicaoDemo('/demo-api/materias/PL/4687/2023/documentos');
  assert.equal(vazia.status, 200);
  assert.deepEqual(corpo(vazia), []);
  assert.equal(tratarRequisicaoDemo('/demo-api/materias/PL/1/1999/documentos').status, 404);
});

test('documentos da matéria: a subemenda substitutiva omite os documentos PL; substitutivo e sem parâmetro trazem a lista completa', () => {
  const siglas = url => corpo(tratarRequisicaoDemo(url)).map(d => d.sigla);
  const base = '/demo-api/materias/PL/4/2025/documentos';
  assert.equal(siglas(`${base}?especie=substitutivo`).length, 6);
  assert.equal(siglas(base).length, 6);
  const subemenda = siglas(`${base}?especie=subemenda`);
  assert.equal(subemenda.length, 3);
  assert.equal(subemenda.includes('PL'), false);
  assert.equal(tratarRequisicaoDemo('/demo-api/materias/PL/1/1999/documentos?especie=subemenda').status, 404);
});

test('texto do documento: devolve o JSONIX; documento sem texto ou inexistente devolve 404', () => {
  const r = tratarRequisicaoDemo('/demo-api/documentos/prl-1-csaude-substitutivo/texto');
  assert.equal(r.status, 200);
  assert.ok(corpo(r).value.metadado.identificacao.urn.startsWith('urn:lex:br:'));
  assert.equal(tratarRequisicaoDemo('/demo-api/documentos/pl-480-2025-apensado/texto').status, 404);
  assert.equal(tratarRequisicaoDemo('/demo-api/documentos/nao-existe/texto').status, 404);
});

test('identificação por URN: tipo define a sigla, número sem zeros', () => {
  assert.deepEqual(identificarPorUrn('urn:lex:br:senado.federal:projeto.lei;pl:2023;05008'), { sigla: 'PL', numero: '5008', ano: '2023' });
  assert.deepEqual(identificarPorUrn('urn:lex:br:federal:medida.provisoria:2021-12-29;1089'), { sigla: 'MPV', numero: '1089', ano: '2021' });
  assert.deepEqual(identificarPorUrn('urn:lex:br:senado.federal:projeto.lei.complementar;plp:2024-04-25;68'), { sigla: 'PLP', numero: '68', ano: '2024' });
  assert.equal(identificarPorUrn('urn:lex:br:federal:medida.provisoria:LEXML_URN_ID'), undefined);
  assert.equal(identificarPorUrn('urn:lex:br:senado.federal:proposta.emenda.constitucional;pec:2023;00048'), undefined);
});
