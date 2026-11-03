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

test('rota desconhecida da demo devolve 404', () => {
  assert.equal(tratarRequisicaoDemo('/demo-api/outra').status, 404);
});

test('identificação por URN: tipo define a sigla, número sem zeros', () => {
  assert.deepEqual(identificarPorUrn('urn:lex:br:senado.federal:projeto.lei;pl:2023;05008'), { sigla: 'PL', numero: '5008', ano: '2023' });
  assert.deepEqual(identificarPorUrn('urn:lex:br:federal:medida.provisoria:2021-12-29;1089'), { sigla: 'MPV', numero: '1089', ano: '2021' });
  assert.deepEqual(identificarPorUrn('urn:lex:br:senado.federal:projeto.lei.complementar;plp:2024-04-25;68'), { sigla: 'PLP', numero: '68', ano: '2024' });
  assert.equal(identificarPorUrn('urn:lex:br:federal:medida.provisoria:LEXML_URN_ID'), undefined);
  assert.equal(identificarPorUrn('urn:lex:br:senado.federal:proposta.emenda.constitucional;pec:2023;00048'), undefined);
});
