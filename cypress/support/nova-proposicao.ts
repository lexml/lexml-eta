/**
 * Apoio aos E2E do componente de nova proposição (controles Shoelace).
 * O sl-select é preenchido por valor + sl-change (padrão do docs/guia-cypress.md); o texto digitado vai pelo input interno.
 */

// Escolhe, pelo texto exibido, um item do sl-select.
export const escolherItemSl = (seletor: string, texto: string): Cypress.Chainable => {
  return cy.get(seletor).then($select => {
    const select = $select[0] as HTMLElement & { value: string };
    const item = Array.from(select.querySelectorAll('sl-menu-item')).find(i => (i.textContent ?? '').trim().startsWith(texto));
    expect(item, `item "${texto}" em ${seletor}`).to.exist;
    select.value = item!.getAttribute('value')!;
    select.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
  });
};

export const digitarEmSl = (seletor: string, texto: string): Cypress.Chainable => cy.get(seletor).shadow().find('input').clear().type(texto);

export const marcarRadioSl = (nome: string, valor: string): Cypress.Chainable => cy.get(`sl-radio[name="${nome}"][value="${valor}"]`).click();

export const deveEstarDesabilitado = (seletor: string): Cypress.Chainable => cy.get(seletor).should('have.attr', 'disabled');

export const deveEstarHabilitado = (seletor: string): Cypress.Chainable => cy.get(seletor).should('not.have.attr', 'disabled');
