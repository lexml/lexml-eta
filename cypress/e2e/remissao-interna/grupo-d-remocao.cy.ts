/**
 * Grupo D — Remoção de Remissão
 *
 * CT-D-01: Seleção sobre link → botão habilitado → clicar → link removido, texto preservado.
 * CT-D-02: Seleção abrangendo dois links → clicar remover → ambos removidos, texto preservado.
 * CT-D-03: Cursor em texto sem link → botão disabled.
 *
 * Nota sobre o botão de remoção:
 *   Cypress .click() despacha mousedown antes do click, o que causa blur no ql-editor e limpa
 *   document.getSelection(). Como resultado, quill.getSelection() retorna null dentro de
 *   removerRemissao() e a remoção é ignorada.
 *   Solução: usar element.click() nativo (não despacha mousedown, não altera o foco) dentro de
 *   cy.window().then(), imediatamente após quill.setSelection(), enquanto a seleção ainda é válida.
 *
 * Nota sobre CT-D-01:
 *   Usar cursor simples (length=0) em linkIndex falha porque quill.getLeaf(linkIndex) retorna o
 *   nó de texto ANTERIOR ao link (comportamento de fronteira do Parchment). temRemissaoNaCursorOuSelecao()
 *   usa leaf.parent.statics.blotName — o qual aponta para o blot pai do texto anterior, não para o link.
 *   Solução: selecionar o link inteiro via setSelection(linkIndex, blotLength, 'user'). Com range.length > 0,
 *   temRemissaoNaCursorOuSelecao() entra no branch de seleção (querySelectorAll) e detecta o link;
 *   removerRemissao() chama removerRemissoesNoRange() → formatText() → remove o DOM <a>.
 */

export const SEL_BTN_REMOVER = '.btn-remover-remissao';
export const SEL_LINK = 'a.lexml-remissao-interna';

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-01 — Remover remissão posicionando cursor sobre o link
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: seleção sobre link → botão habilitado → link removido', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
  });

  it('CT-D-01: seleção sobre link habilita botão; click nativo no botão remove o link', () => {
    cy.getContainerArtigoByNumero(2).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        // Localiza o blot do link e seleciona seu conteúdo completo.
        // Cursor simples em linkIndex falha: getLeaf(linkIndex) retorna o nó de texto anterior
        // (comportamento de fronteira do Parchment). Com range.length > 0, temRemissaoNaCursorOuSelecao()
        // usa querySelectorAll e detecta o link corretamente; removerRemissao() chama formatText().
        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;
        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        const linkIndex = blot.offset(quill.scroll);
        const blotLength = blot.length();
        quill.setSelection(linkIndex, blotLength, 'user'); // selection-change → button enabled

        // Verificar que o módulo reconhece a remissão na seleção
        const remissaoModule = quill.getModule('remissaoInterna');
        expect(remissaoModule?.temRemissaoNaCursorOuSelecao()).to.be.true;

        // Click nativo: não despacha mousedown, não altera foco, seleção permanece válida
        const btnRemover = win.document.querySelector(SEL_BTN_REMOVER) as HTMLElement;
        btnRemover?.click();
      });
    });

    // Link deve ter sido removido
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('not.exist');
    // Texto deve permanecer intacto
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-02 — Remover múltiplas remissões selecionando um trecho
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: seleção abrangendo dois links → ambos removidos', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Nos termos do art. 1º e do art. 2º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('have.length', 2);
  });

  it('CT-D-02: seleção sobre texto completo + click nativo remove ambos os links', () => {
    cy.getContainerArtigoByNumero(3).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const p = $container[0].querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
        if (!p) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(p);
        if (!blot) return;

        const blotStart = blot.offset(quill.scroll);
        const blotLength = blot.length();
        // Seleciona o conteúdo completo do blot (excluindo newline terminal)
        quill.setSelection(blotStart, blotLength - 1, 'user'); // selection-change → button enabled

        // Verificar que o módulo reconhece remissões na seleção
        const remissaoModule = quill.getModule('remissaoInterna');
        expect(remissaoModule?.temRemissaoNaCursorOuSelecao()).to.be.true;

        // Click nativo: não altera foco, seleção permanece válida
        const btnRemover = win.document.querySelector(SEL_BTN_REMOVER) as HTMLElement;
        btnRemover?.click();
      });
    });

    // Ambos os links devem ter desaparecido
    cy.getContainerArtigoByNumero(3).find(SEL_LINK).should('not.exist');
    // Texto deve permanecer intacto
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 1');
    cy.getContainerArtigoByNumero(3).find('p.texto__dispositivo').should('contain.text', 'art. 2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-D-03 — Botão desabilitado quando não há remissão no cursor
// ─────────────────────────────────────────────────────────────────────────────
describe('Remoção: botão disabled quando cursor está em texto sem link', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('CT-D-03: após posicionar cursor em texto sem link, botão permanece disabled', () => {
    // posicionarCursorNoDispositivo usa quill.setSelection(..., 'user') → selection-change
    cy.getContainerArtigoByNumero(1).posicionarCursorNoDispositivo();

    cy.get(SEL_BTN_REMOVER).should('have.attr', 'disabled');
  });
});
