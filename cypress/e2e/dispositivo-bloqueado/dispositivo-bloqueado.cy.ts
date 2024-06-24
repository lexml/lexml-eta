describe('MPV 905 - com dispositivos bloqueados', () => {
  it('Testando opções de menu - Art. 1º e filhos bloqueados', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: '_mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.getContainerArtigoByNumero(1)
      .click()
      .getOpcoesDeMenuDoDispositivo()
      .should('not.contain', 'Adicionar parágrafo')
      .should('not.contain', 'Adicionar inciso')
      .should('not.contain', 'Linha pontilhada')
      .should('not.contain', 'Suprimir');

    cy.getContainerArtigoByNumero(1).next().next().click().getOpcoesDeMenuDoDispositivo().should('have.length', 0);
  });
});
