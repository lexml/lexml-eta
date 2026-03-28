/**
 * Grupo F — Invalidação e Restauração de Remissão + Mensagem de Erro
 *
 * CT-F-01: excluir dispositivo referenciado → link recebe classe lexml-remissao-invalida
 * CT-F-02: undo da exclusão → link volta a lexml-remissao-interna; Art. 2 restaurado
 * CT-F-03: mensagem de erro aparece no painel do dispositivo de origem
 * CT-F-04: remover o link inválido via botão → link e mensagem desaparecem
 * CT-F-05: undo da exclusão → mensagem de erro desaparece
 * CT-F-06: excluir dispositivo não referenciado → nenhuma mensagem; link permanece válido
 *
 * Setup compartilhado (CT-F-01 a CT-F-05):
 *   Art. 1 e Art. 2. Art. 2 tem link para Art. 1 via detecção automática.
 *   Art. 1 é excluído → ex-Art. 2 se torna Art. 1 com link inválido.
 *
 * Nota sobre mensagem DOM:
 *   EtaBlotMensagem cria div.mensagem.mensagem--danger dentro de td.container__texto--mensagem.
 *   Após ElementoValidado com mensagens=[], o tr inteiro é removido — find() retorna 0 elementos.
 *
 * Nota sobre o botão Desfazer:
 *   Seletor: .lx-eta-btn-desfazer. Dispatcha UndoAction() via quill.undo() → undoRedoEstrutura.
 */

const SEL_LINK = 'a.lexml-remissao-interna';
const SEL_LINK_INVALIDO = 'a.lexml-remissao-interna.lexml-remissao-invalida';
const SEL_MENSAGEM_INVALIDA = '.container__texto--mensagem .mensagem--danger';
const SEL_BTN_REMOVER = '.btn-remover-remissao';
const SEL_BTN_DESFAZER = '.lx-eta-btn-desfazer';

/**
 * Cria 3 artigos, insere referência "art. 1º" no Art. 2, detecta remissão e
 * exclui o Art. 1. Ao final: existem 2 artigos — ex-Art. 2 vira Art. 1 (com
 * link inválido) e ex-Art. 3 vira Art. 2.
 *
 * Por que 3 artigos e não 2:
 *   Com apenas 2 artigos, após remover o Art. 1 o artigo restante é
 *   renomeado para "Artigo único." — a regex de getContainerArtigoByNumero(1)
 *   não casa com "Artigo único." e o comando retorna jQuery vazio.
 *   Com 3 artigos, após remover o Art. 1 sobram 2 artigos normalmente
 *   numerados ("Art. 1." e "Art. 2.").
 */
function configurarEstadoComRemissaoInvalida(): void {
  cy.visit('/');
  cy.novaProposicao();
  cy.getContainerArtigoByNumero(1).should('exist');

  cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
  cy.getContainerArtigoByNumero(2).should('exist');

  cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
  cy.getContainerArtigoByNumero(3).should('exist');

  // Art. 2 referencia Art. 1
  cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
  cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

  cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
  cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

  // Exclui Art. 1 (referenciado); ex-Art. 2 → Art. 1 com link inválido; ex-Art. 3 → Art. 2
  cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Remover');

  // Âncora: 2 artigos remanescentes numerados normalmente
  cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-01 a CT-F-05 — Setup: estado com remissão inválida (Art. 1 excluído)
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação e restauração de remissão', () => {
  beforeEach(() => {
    configurarEstadoComRemissaoInvalida();
  });

  it('CT-F-01: link recebe classe lexml-remissao-invalida após exclusão do dispositivo destino', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_LINK_INVALIDO).should('have.length', 1);
  });

  it('CT-F-03: mensagem de erro aparece no painel do dispositivo de origem', () => {
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'excluído');
  });

  it('CT-F-04: remover link inválido via botão apaga link e mensagem simultaneamente', () => {
    cy.getContainerArtigoByNumero(1).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        // O link tem ambas as classes; basta localizar pelo seletor lexml-remissao-interna
        const link = $container[0].querySelector('a.lexml-remissao-interna');
        if (!link) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(link);
        if (!blot) return;

        // Seleciona o link inteiro — range.length > 0 ativa branch de seleção em temRemissaoNaCursorOuSelecao
        const linkIndex = blot.offset(quill.scroll);
        const blotLength = blot.length();
        quill.setSelection(linkIndex, blotLength, 'user');

        // Click nativo: não despacha mousedown, preserva seleção ativa
        const btnRemover = win.document.querySelector(SEL_BTN_REMOVER) as HTMLElement;
        btnRemover?.click();
      });
    });

    cy.getContainerArtigoByNumero(1).find(SEL_LINK).should('not.exist');
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });

  it('CT-F-02: undo restaura Art. 1 e link no Art. 2 volta a ser lexml-remissao-interna', () => {
    cy.get(SEL_BTN_DESFAZER).click();

    // Art. 1 restaurado — 3 artigos novamente; âncora de sync
    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);

    // O link estava em Art. 2 (que após remoção/undo volta a ser Art. 2)
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('not.exist');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
  });

  it('CT-F-05: undo da exclusão remove a mensagem de erro do dispositivo de origem', () => {
    cy.get(SEL_BTN_DESFAZER).click();

    cy.get('div.container__elemento.elemento-tipo-artigo').should('have.length', 3);
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CT-F-06 — Excluir dispositivo não referenciado não invalida remissões existentes
// ─────────────────────────────────────────────────────────────────────────────
describe('Invalidação: excluir dispositivo não referenciado não afeta remissões válidas', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    // Art. 2 referencia Art. 1 (não Art. 3)
    cy.getContainerArtigoByNumero(2).digitarTextoRemissao('Conforme o art. 1º, aplica-se o seguinte.');
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').should('contain.text', 'art. 1');

    cy.getContainerArtigoByNumero(2).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);

    // Exclui Art. 3 — não referenciado por nenhuma remissão
    cy.getContainerArtigoByNumero(3).selecionarOpcaoDeMenuDoDispositivo('Remover');
    cy.getContainerArtigoByNumero(3).should('not.exist');
  });

  it('CT-F-06: link no Art. 2 permanece válido; nenhuma mensagem de remissão inválida', () => {
    cy.getContainerArtigoByNumero(2).find(SEL_LINK_INVALIDO).should('not.exist');
    cy.getContainerArtigoByNumero(2).find(SEL_LINK).should('have.length', 1);
    cy.getContainerArtigoByNumero(2).find(SEL_MENSAGEM_INVALIDA).should('not.exist');
  });
});
