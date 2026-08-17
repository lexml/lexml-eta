import { expect } from '@open-wc/testing';
import { LexmlLinkerClient } from '../../../src/util/lexml-linker/lexmlLinkerClient';

// Testes de integração reais: rodam o WASM de verdade dentro de um Web Worker no Chromium do
// web-test-runner (Playwright) — não mockam o lexml-linker. Casos reaproveitados da bateria de
// testes da Fase 0 (docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md §3.6/§3.6a).

describe('LexmlLinkerClient (integração real com o WASM)', () => {
  let client: LexmlLinkerClient;

  beforeEach(() => {
    client = new LexmlLinkerClient();
  });

  afterEach(() => {
    client.encerrar();
  });

  it('detecta remissão externa com citação completa (data por extenso)', async () => {
    const texto = 'Nos termos do art. 5º da Lei nº 8.069, de 13 de julho de 1990.';
    const resultado = await client.detectarRemissoesExternas(texto);

    expect(resultado).to.not.be.null;
    expect(resultado).to.have.lengthOf(1);
    const [match] = resultado!;
    expect(texto.slice(match.inicio, match.fim)).to.equal(match.textoRef);
    expect(match.targetUrn).to.equal('urn:lex:br:federal:lei:1990-07-13;8069');
    expect(match.targetFragmento).to.equal('art5');
  });

  it('detecta citação abreviada (número/ano, sem dia/mês) — resolve com URN de ano-apenas', async () => {
    const texto = 'Nos termos do art. 5º da Lei nº 8.069/1990.';
    const resultado = await client.detectarRemissoesExternas(texto);

    expect(resultado).to.have.lengthOf(1);
    expect(resultado![0].targetUrn).to.equal('urn:lex:br:federal:lei:1990;8069');
  });

  it('não detecta nada em texto sem citação de norma (remissão puramente interna não é reconhecida)', async () => {
    const resultado = await client.detectarRemissoesExternas('Vide o inciso I do § 2º deste artigo.');
    expect(resultado).to.deep.equal([]);
  });

  it('reproduz o bug conhecido de "CF/88" (URN com ano de 2 dígitos) — achado #6a do plano', async () => {
    const texto = 'Nos termos do art. 5º da CF/88.';
    const resultado = await client.detectarRemissoesExternas(texto);

    expect(resultado).to.have.lengthOf(1);
    // Bug confirmado no parser upstream (Regras2.hs, casosEspeciais.constituicaoAbrev) — documentado, não corrigido aqui.
    expect(resultado![0].targetUrn).to.equal('urn:lex:br:federal:constituicao:88;88');
    expect(resultado![0].targetFragmento).to.equal('art5');
  });

  it('descarta a resposta de uma chamada superada por outra mais recente (retorna null)', async () => {
    const chamadaAntiga = client.detectarRemissoesExternas('art. 5º da Lei nº 8.069, de 13 de julho de 1990.');
    const chamadaNova = client.detectarRemissoesExternas('art. 10 do Decreto nº 7.663, de 20 de dezembro de 2011.');

    const [resultadoAntigo, resultadoNovo] = await Promise.all([chamadaAntiga, chamadaNova]);

    expect(resultadoAntigo).to.be.null;
    expect(resultadoNovo).to.not.be.null;
    expect(resultadoNovo![0].targetFragmento).to.equal('art10');
  });
});
