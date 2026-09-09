/**
 * Grupo A — Detecção Automática: Referências Absolutas
 *
 * Trigger de detecção: dispararDeteccaoRemissao() chama emitirEventoOnChange
 * no editor, que executa atualizarTextoElemento + adicionarRemissaoInternaAction.
 *
 * IMPORTANTE: usar digitarTextoRemissao (insere no modelo Quill via insertText),
 * nunca alterarTextoDoDispositivo, pois este bypassa o Quill e não atualiza
 * o delta interno — renderizarRemissoesDoState usa quill.getText() que leria vazio.
 *
 * Links são criados APENAS quando dispositivoDestino existe na articulação.
 * Por isso CT-A-02 e CT-A-03 precisam criar a estrutura completa antes de detectar.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CT-A-01 e CT-A-04 — Setup: 3 artigos simples (sem parágrafos)
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção absoluta: artigo simples e negativo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições previstas aplicam-se à administração pública direta e indireta.');
  });

  it('Referência a artigo cria link e permite navegação por clique', () => {
    // Insere texto com referência ao art. 1 no Art. 3
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 1. aplica-se o seguinte.');

    // Verifica que o texto foi inserido no Quill
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    // Dispara detecção via API do editor
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();

    // Verifica que exatamente 1 link foi criado com o texto correto
    cy.getContainerArtigoByNumero(3).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 1');

    // Posiciona cursor DENTRO do link → selection-change → popup aparece
    // Clica no rótulo navegável do popup → redirecionarRemissaoAction → destaque
    cy.getContainerArtigoByNumero(3).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;
        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;
        // linkIndex + 1 evita fronteira de Parchment (quill.getLeaf(linkIndex) retorna nó anterior)
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');
        // selection-change é síncrono → popup já está visível; click no rótulo navega
        const rotulo = win.document.querySelector('.remissao-popup__rotulo--navegavel') as HTMLElement;
        rotulo?.click();
      });
    });
    cy.getDestinoRemissaoDestacado().should('exist');
  });

  it('Parágrafo sem âncora absoluta não cria link', () => {
    // "§ 2º" isolado sem "art. N" e sem qualificador contextual → não deve criar remissão
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o § 2º acima mencionado.');

    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', '§ 2º');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    // Nenhum link deve ser criado — "acima mencionado" não é qualificador reconhecido
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-A-02 — Setup: 3 artigos + 2 parágrafos no Art. 3
// Verifica que "§ 2º do art. 3." gera exatamente 1 link (anti double-match 2 níveis)
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção absoluta: referência composta 2 níveis sem duplicação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Adiciona § 1 ao Art. 3 — artigo usa adicionarParagrafoFilho ("Adicionar parágrafo")
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona § 2 — parágrafo usa adicionarParagrafoDepois ("Adicionar parágrafo depois")
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições previstas aplicam-se à administração pública direta e indireta.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
  });

  it('"§ 2º do art. 3." cria exatamente 1 link, não 2', () => {
    // Se houvesse double-match, "§ 2º" e "art. 3" seriam detectados separadamente (2 links).
    // Com a regex composta, o match completo "§ 2º do art. 3" gera exatamente 1 link.
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o § 2º do art. 3.');

    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', '§ 2º do art. 3');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-A-03 — Setup: 3 artigos + 2 parágrafos no Art. 3 + 1 inciso no § 2
// Verifica que "inciso I do § 2º do art. 3." gera exatamente 1 link (anti double-match 3 níveis)
// ─────────────────────────────────────────────────────────────────────────────
describe('Detecção absoluta: referência composta 3 níveis sem duplicação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Adiciona § 1 ao Art. 3 — artigo usa adicionarParagrafoFilho ("Adicionar parágrafo")
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 1);

    // Adiciona § 2 — parágrafo usa adicionarParagrafoDepois ("Adicionar parágrafo depois")
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo depois');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length.gte', 2);

    // Adiciona inciso I ao § 2 — parágrafo usa adicionarIncisoFilho ("Adicionar inciso")
    cy.get('div.container__elemento.elemento-tipo-paragrafo').eq(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');
    cy.get('div.container__elemento.elemento-tipo-inciso').should('have.length.gte', 1);

    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições previstas aplicam-se à administração pública direta e indireta.');
    cy.get('div.container__elemento.elemento-tipo-paragrafo').first().alterarTextoDoDispositivo('O disposto no caput aplica-se igualmente às autarquias e fundações.');
  });

  it('"inciso I do § 2º do art. 3." cria exatamente 1 link, não 3', () => {
    // Se houvesse double-match, "inciso I", "§ 2º" e "art. 3" seriam detectados separadamente (3 links).
    // Com a regex composta, o match completo gera exatamente 1 link.
    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o inciso I do § 2º do art. 3.');

    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'inciso I do § 2º do art. 3');

    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 1);
  });
});
