// #1091: dicas dos controles da barra da justificação. A dica nativa não é visível ao Cypress; o critério é o atributo title.
export {};

const BARRA = '#lexml-eta-editor-texto-rico-justificativa .ql-toolbar';

describe('Dicas da barra de ferramentas da justificação (#1091)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get(BARRA).should('be.visible');
  });

  it('inserir link, inserir tabela e formatar tabela têm dica', () => {
    cy.get(`${BARRA} button.ql-link`).should('have.attr', 'title', 'Inserir link');
    cy.get(`${BARRA} .ql-picker.ql-table .ql-picker-label`).eq(0).should('have.attr', 'title', 'Inserir tabela');
    cy.get(`${BARRA} .ql-picker.ql-table .ql-picker-label`).eq(1).should('have.attr', 'title', 'Formatar tabela');
  });

  it('todo botão e rótulo de menu da barra tem dica', () => {
    cy.get(`${BARRA} button:visible, ${BARRA} .ql-picker-label:visible`).each($el => {
      expect($el.attr('title') ?? '', `dica de ${$el.attr('class')}`).to.match(/\S/);
    });
  });
});
