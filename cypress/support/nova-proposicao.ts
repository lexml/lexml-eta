/**
 * Apoio aos E2E do componente de nova proposição (Shoelace e autocomplete genérico).
 * O texto digitado vai pelo input interno do sl-input; as listas (siglas e comissão) abrem pelo clique no campo.
 */

// Abre a lista do autocomplete (`seletor` é o do host `lexml-eta-autocomplete-lista`).
export const abrirLista = (seletor: string): Cypress.Chainable => cy.get(`${seletor} sl-input`).shadow().find('input').click();

// Escolhe, pelo texto exibido (rótulo igual ou iniciado por "<texto> - "), um item do autocomplete.
export const escolherItemLista = (seletor: string, texto: string): Cypress.Chainable => {
  abrirLista(seletor);
  return cy.get(`${seletor} .ac-lista li`).then($itens => {
    const item = Array.from($itens).find(li => {
      const rotulo = (li.textContent ?? '').trim();
      return rotulo === texto || rotulo.startsWith(`${texto} - `);
    });
    expect(item, `item "${texto}" em ${seletor}`).to.exist;
    cy.wrap(item).click();
  });
};

export const digitarEmSl = (seletor: string, texto: string): Cypress.Chainable => cy.get(seletor).shadow().find('input').clear().type(texto);

export const marcarRadioSl = (nome: string, valor: string): Cypress.Chainable => cy.get(`sl-radio[name="${nome}"][value="${valor}"]`).click();

export const deveEstarDesabilitado = (seletor: string): Cypress.Chainable => cy.get(seletor).should('have.attr', 'disabled');

export const deveEstarHabilitado = (seletor: string): Cypress.Chainable => cy.get(seletor).should('not.have.attr', 'disabled');

export const escolherComissao = (sigla: string): Cypress.Chainable => escolherItemLista('#np-comissao', sigla);
