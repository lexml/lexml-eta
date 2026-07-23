import { expect } from '@open-wc/testing';
import { foiEditadoManualmente } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 3 do plano de simplificação: substitui a heurística de canonicidade (isTextoCanonico/
// isTextoCanonicoPorTipo, que tentava adivinhar por regex se o texto "parece" válido) por
// comparação de igualdade contra o último texto que o sistema gravou (textoRef).
describe('foiEditadoManualmente', () => {
  it('nunca observado (textoRef undefined) → trata como editado, não sobrescreve às cegas', () => {
    expect(foiEditadoManualmente('art. 2º', undefined)).to.be.true;
  });

  it('texto atual igual ao textoRef gravado → seguro regenerar (não foi editado)', () => {
    expect(foiEditadoManualmente('art. 2º', 'art. 2º')).to.be.false;
  });

  it('espaços em branco extras não causam falso positivo', () => {
    expect(foiEditadoManualmente('  art. 2º  ', 'art. 2º')).to.be.false;
  });

  it('replica o caso "preservados": texto canônico apagado e trocado por texto arbitrário → diverge', () => {
    expect(foiEditadoManualmente('o artigo', 'art. 2º')).to.be.true;
  });

  it('texto arbitrário que nunca mudou desde a criação → não diverge (isTextoReconhecivel, fora desta função, é quem decide se chega a este ponto)', () => {
    expect(foiEditadoManualmente('o artigo', 'o artigo')).to.be.false;
  });

  // Caso em que a heurística antiga (isTextoCanonico/isTextoCanonicoPorTipo) vacilava: ambos os
  // textos "parecem" uma referência válida do mesmo tipo, mas são numerações diferentes — a
  // varredura de 1 a 150 aceitaria qualquer uma; a comparação de igualdade pega a divergência.
  it('divergência sutil entre duas numerações que "parecem" canônicas (§ 2º vs § 5º)', () => {
    expect(foiEditadoManualmente('§ 5º', '§ 2º')).to.be.true;
  });

  it('variante "Artigo 5" (por extenso) editada à mão sobre um textoRef gerado como "art. 5º" → diverge', () => {
    expect(foiEditadoManualmente('Artigo 5', 'art. 5º')).to.be.true;
  });

  it('variante "Art.5" (sem espaço/ordinal) editada à mão sobre "art. 5º" → diverge', () => {
    expect(foiEditadoManualmente('Art.5', 'art. 5º')).to.be.true;
  });

  it('sufixo contextual alterado à mão ("deste artigo" → "do presente artigo") → diverge', () => {
    expect(foiEditadoManualmente('inciso II do presente artigo', 'inciso II deste artigo')).to.be.true;
  });

  it('texto e textoRef idênticos com sufixo contextual → não diverge', () => {
    expect(foiEditadoManualmente('inciso II deste artigo', 'inciso II deste artigo')).to.be.false;
  });
});
