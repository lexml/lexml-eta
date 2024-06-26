describe('Emenda para MPV 905', () => {
  it('Emenda padrão - inclusão de dispositivo', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaPadrao({ nomeProposicao: 'MPV 905/2019', totalElementos: 563 });

    cy.getContainerArtigoByNumero(2).click().selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');

    const texto = 'Texto do novo artigo.';
    cy.get('div.container__elemento.dispositivo--adicionado').should('have.length', 1).alterarTextoDoDispositivo(texto).contains(texto);
    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });

  it('Emenda padrão - alteração de dispositivo', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaPadrao({ nomeProposicao: 'MPV 905/2019', totalElementos: 563 });

    const texto = 'Novo texto do parágrafo 1º do artigo 2º.';
    cy.getContainerArtigoByNumero(2).next().click().should('have.length', 1).alterarTextoDoDispositivo(texto).contains(texto);
    // cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });

  it('Emenda "artigo onde couber"', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emendaArtigoOndeCouber',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaOndeCouber({ nomeProposicao: 'MPV 905/2019', totalElementos: 2 });

    const texto = 'Texto do artigo onde couber.';
    cy.get('div.container__elemento.dispositivo--adicionado').should('have.length', 1).alterarTextoDoDispositivo(texto).contains(texto);
    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });
});
