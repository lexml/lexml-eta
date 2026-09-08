/**
 * Grupo D — Remoção de Remissão
 *
 * CT-D-01: Cursor dentro do link → popup aparece → clicar "Excluir" → link removido, texto preservado.
 * CT-D-03: Cursor em texto sem link → popup permanece oculto.
 *
 * Nota sobre mecanismo de remoção (nova implementação):
 *   O botão "Remover remissão" da toolbar foi removido (decisão 1.3-B do plano).
 *   A remoção agora ocorre pelo botão "Excluir" no popup inline que aparece quando o cursor
 *   está dentro de um link de remissão (via selection-change → atualizarPopupRemissao).
 *
 * Nota sobre posicionamento do cursor:
 *   Usar linkIndex + 1 evita fronteira de Parchment: quill.getLeaf(linkIndex) retorna o nó de
 *   texto ANTERIOR ao link. Com linkIndex + 1, quill.getFormat() detecta corretamente o formato
 *   remissao-interna e getRemissaoNoCursor() retorna o valor do link.
 *
 * Nota sobre selection-change síncrono:
 *   quill.setSelection('user') dispara selection-change síncronamente → onSelectionChange →
 *   atualizarPopupRemissao() → mostrarPopup(). O popup já está visível quando cy.window().then()
 *   retorna, permitindo clicar no botão no mesmo bloco.
 *
 * Remoção em lote (CT-D-02) foi eliminada com o botão da toolbar (decisão 1.3-B).
 */

const SEL_LINK = 'a.lexml-remissao-interna';

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-01 — Remover remissão via popup
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: cursor dentro do link → popup → excluir → link removido', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
  });

  it('CT-D-01: cursor dentro do link exibe popup; clicar Excluir remove o link', () => {
    cy.getContainerArtigoByNumero(2).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        // linkIndex + 1 evita fronteira de Parchment; selection-change → popup
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');

        // selection-change é síncrono → popup já visível; click nativo preserva foco no Quill
        const btnExcluir = win.document.querySelector('.remissao-popup__btn--excluir') as HTMLElement;
        btnExcluir?.click();
      });
    });

    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('not.exist');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-03 — Popup oculto quando cursor não está sobre um link
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: popup oculto quando cursor está em texto sem link', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('CT-D-03: após posicionar cursor em texto sem link, popup permanece oculto', () => {
    // posicionarCursorNoDispositivo usa quill.setSelection('user') → selection-change →
    // getRemissaoNoCursor() retorna null → esconderPopup() → display: none
    cy.getContainerArtigoByNumero(1).posicionarCursorNoDispositivo();

    cy.get('#remissao-popup').should('have.css', 'display', 'none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-04 — Dois links no mesmo dispositivo; remover um preserva o outro
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: dispositivo com dois links; remover um via popup preserva o outro', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 3 referencia Art. 1 e Art. 2 no mesmo texto
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 1º e o art. 2º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 2);
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art1"]').should('exist');
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art2"]').should('exist');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Esta lei estabelece as normas gerais aplicáveis à matéria.');
    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('As disposições previstas aplicam-se à administração pública direta e indireta.');
  });

  it('CT-D-04: remover link "art. 1º" via popup → link "art. 2º" permanece intacto', () => {
    // Posiciona cursor especificamente dentro do link art1 e aciona Excluir
    cy.getContainerArtigoByNumero(3).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const link = $container[0].querySelector('a[data-lexml-ref="art1"]') as HTMLElement;
        if (!link) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        // linkIndex + 1 evita fronteira de Parchment; selection-change → popup
        quill.setSelection(blot.offset(quill.scroll) + 1, 0, 'user');

        const btnExcluir = win.document.querySelector('.remissao-popup__btn--excluir') as HTMLElement;
        btnExcluir?.click();
      });
    });

    // Link art1 removido; link art2 intacto
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art1"]').should('not.exist');
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 1);
    cy.getContainerArtigoByNumero(3).find('a[data-lexml-ref="art2"]').should('exist');

    // Texto "art. 2" permanece visível como texto simples no trecho não-linkado e no link restante
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 2');
  });
});

export {};
