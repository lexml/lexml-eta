/**
 * Abas de apoio do painel da direita e botões da barra em telas estreitas, sem "Comando" nem "Dicas".
 *
 * Cobre, pela UI real, a change 2026-11-04-c03-remover-abas-comando-dicas (issue #1049).
 * Sem fixture: a proposição nova (PL) basta. O modo anexo de parecer fica no teste de componente.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

describe('Abas de apoio e botões de telas estreitas', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('o painel da direita tem só as abas Notas e Atalhos', () => {
    cy.get('#tabs-direita sl-tab').should($abas => {
      expect(Array.from($abas).map(aba => aba.getAttribute('panel'))).to.deep.equal(['notas', 'atalhos']);
    });
    cy.get('lexml-eta-ajuda').should('not.exist');
  });

  // Até 640 px o CSS já ocultava o Atalhos (:last-child); a barra só tem botões entre 641 e 768 px.
  it('em tela estreita, a barra do editor tem só o botão Atalhos', () => {
    cy.viewport(700, 800);

    cy.get('.mobile-buttons').should('be.visible');
    cy.get('.mobile-buttons .mobile-button').should('have.length', 1).and('have.attr', 'title', 'Atalhos').and('be.visible');
    cy.get('lexml-eta-ajuda-modal').should('not.exist');
  });
});
