describe('Revisão', () => {
  beforeEach(() => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });
  });

  it('Ativa e desativa revisão', () => {
    cy.ativarRevisaoDispositivo();
    cy.desativarRevisaoDispositivo();
  });

  it('Revisão de dispositivo', () => {
    cy.ativarRevisaoDispositivo();
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().as('contadorRevisaoDispositivo').contains('0');

    cy.getContainerArtigoByNumero(1).click().alterarTextoDoDispositivo('Novo texto do artigo. Teste de contador.');
    cy.get('@contadorRevisaoDispositivo').contains('1');

    cy.getContainerArtigoByNumero(2).next().click().alterarTextoDoDispositivo('Novo texto do § 1º do Art. 2º.');
    cy.get('@contadorRevisaoDispositivo').contains('2');
  });
});
