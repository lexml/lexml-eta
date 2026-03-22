/**
 * Grupo B — Detecção Contextual: Referências Relativas
 *
 * Referências como "deste artigo", "deste parágrafo", "do presente artigo"
 * são resolvidas via buscarAncestralPorTipo() no dispositivo de origem.
 *
 * Links são criados APENAS quando dispositivoDestino existe na articulação.
 * Por isso cada describe cria a estrutura completa antes de detectar.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com § 1 e § 2
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referências relativas ao artigo corrente', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // § 1 do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // § 2 do Art. 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);
  });

  it('"§ 2º deste artigo" detectado a partir do § 1 cria 1 link', () => {
    // Origem: § 1 → referência ao § 2 do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o § 2º deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', '§ 2º deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });

  it('"caput deste artigo" detectado a partir do § 1 cria 1 link', () => {
    // Origem: § 1 → referência ao caput do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Conforme o caput deste artigo, aplica-se o seguinte.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', 'caput deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });

  it('"§ 2º do presente artigo" é reconhecido como variante e cria 1 link', () => {
    // Variante: "do presente artigo" equivale a "deste artigo"
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o § 2º do presente artigo.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', '§ 2º do presente artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com § 1 com inciso I, e § 2
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referência ao parágrafo a partir de inciso no caput', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Inciso I no caput do Art. 1 — via menu do artigo (mais confiável que via parágrafo)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // § 1 do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // § 2 do Art. 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);
  });

  it('"§ 2º deste artigo" detectado a partir de inciso do caput cria 1 link', () => {
    // Origem: inciso I do caput → buscarAncestralPorTipo → artigo → resolves § 2
    cy.get('div.container__elemento.elemento-tipo-inciso').first().digitarTextoRemissao('Aplica-se o § 2º deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('p.texto__dispositivo').should('contain.text', '§ 2º deste artigo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com inciso I no caput e § 1 (parágrafo único)
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referências a inciso e parágrafo único do artigo', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Inciso I no caput do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // § 1 do Art. 1 (parágrafo único pois é o único)
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);
  });

  it('"inciso I deste artigo" detectado no § 1 cria 1 link', () => {
    // Origem: § 1 → referência ao inciso I do caput do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o inciso I deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', 'inciso I deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });

  it('"parágrafo único deste artigo" detectado no inciso I cria 1 link', () => {
    // Origem: inciso I → referência ao parágrafo único do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-inciso').first().digitarTextoRemissao('Conforme o parágrafo único deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('p.texto__dispositivo').should('contain.text', 'parágrafo único deste artigo');

    cy.get('div.container__elemento.elemento-tipo-inciso').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-inciso').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com § 1 com inciso I com alínea a
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referência a inciso do parágrafo corrente', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // § 1 do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Inciso I no § 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // Alínea a no inciso I
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea');
    cy.get('div.container__elemento.elemento-tipo-alinea').should('have.length.gte', 1);
  });

  it('"inciso I deste parágrafo" detectado na alínea a cria 1 link', () => {
    // Origem: alínea a → referência ao inciso I do § 1
    cy.get('div.container__elemento.elemento-tipo-alinea').first().digitarTextoRemissao('Aplica-se o inciso I deste parágrafo.');

    cy.get('div.container__elemento.elemento-tipo-alinea').first().find('p.texto__dispositivo').should('contain.text', 'inciso I deste parágrafo');

    cy.get('div.container__elemento.elemento-tipo-alinea').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-alinea').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com § 1 e § 2 com inciso I
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: cadeia composta inciso + parágrafo do artigo', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // § 1 do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // § 2 do Art. 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    // Inciso I no § 2
    cy.get('div.container__elemento.elemento-tipo-paragrafo').eq(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);
  });

  it('"inciso I do § 2º deste artigo" detectado no § 1 cria 1 link', () => {
    // Origem: § 1 → cadeia: inciso I do § 2 do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o inciso I do § 2º deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', 'inciso I do § 2º deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 com incisos I e II no caput e § 1 com inciso I
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referência a inciso do caput deste artigo', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Inciso I no caput do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    // Inciso II no caput
    cy.get('div.container__elemento.elemento-tipo-inciso').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 2);

    // § 1 do Art. 1
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Inciso I no § 1
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
  });

  it('"inciso II do caput deste artigo" detectado no § 1 cria 1 link', () => {
    // Origem: § 1 → inciso II do caput do mesmo artigo
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().digitarTextoRemissao('Aplica-se o inciso II do caput deste artigo.');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('p.texto__dispositivo').should('contain.text', 'inciso II do caput deste artigo');

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().dispararDeteccaoRemissao();

    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 sem parágrafos (caput simples)
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção contextual: referência contextual sem dispositivo destino', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('"§ 1º deste artigo" sem parágrafo existente não cria link', () => {
    // Art. 1 não tem parágrafos → referência contextual não pode ser resolvida
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o § 1º deste artigo.');

    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', '§ 1º deste artigo');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('not.exist');
  });
});
