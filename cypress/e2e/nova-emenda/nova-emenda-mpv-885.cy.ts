describe('Emenda para MPV 885', () => {
  it('Emenda padrão - inclusão e numeração de dispositivo', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_885_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaPadrao({ nomeProposicao: 'MPV 885/2019', totalElementos: 66 });

    // adicionando e numerando artigo de alteração de norma
    cy.getContainerArtigoNormaByNumero(1).click().selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');

    cy.get('#lxEtaId87 > .container__linha > .container__texto > .texto__rotulo').click();
    cy.get('sl-input').shadow().find('div.form-control.form-control--medium.form-control--has-label.form-control--has-help-text').find('div.form-control-input').type('1-A');
    cy.get('sl-dialog > [variant="primary"]').click();

    const textoArtigo = 'Texto do novo artigo de alteração de norma:';
    cy.get('div.container__elemento.dispositivo--adicionado')
      .as('container')
      .should('have.length', 1)
      .alterarTextoDoDispositivo(textoArtigo)
      .wait(Cypress.config('isInteractive') ? 1000 : 2000)
      .then(() => cy.get('@container').contains(textoArtigo));

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(textoArtigo);

    // adicionando e numerando parágrafo de alteração de norma
    cy.getContainerArtigoNormaByRotulo('Art. 1º-A').click().selecionarOpcaoDeMenuDoDispositivo('Adicionar parágrafo');

    cy.get('#lxEtaId88 > :nth-child(1) > .container__texto > .texto__rotulo').click();
    cy.get('sl-input').shadow().find('div.form-control.form-control--medium.form-control--has-label.form-control--has-help-text').find('div.form-control-input').type('unico');
    cy.get('sl-dialog > [variant="primary"]').click();

    const textoParagrafo = 'Texto do novo parágrafo de alteração de norma:';
    cy.get('div.container__elemento.dispositivo--adicionado')
      .as('container')
      .should('have.length', 2)
      .alterarTextoDoDispositivo(textoParagrafo)
      .wait(Cypress.config('isInteractive') ? 1000 : 2000)
      .then(() => cy.get('@container').contains(textoParagrafo));

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(textoParagrafo);

    // adicionando e numerando inciso de alteração de norma
    cy.getContainerParagrafoNormaByRotulo('Parágrafo único').click().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso');

    cy.get('#lxEtaId89 > :nth-child(1) > .container__texto > .texto__rotulo').click();
    cy.get('sl-input').shadow().find('div.form-control.form-control--medium.form-control--has-label.form-control--has-help-text').find('div.form-control-input').type('I');
    cy.get('sl-dialog > [variant="primary"]').click();

    const textoInciso = 'texto do novo inciso de alteração de norma:';
    cy.get('div.container__elemento.dispositivo--adicionado')
      .as('container')
      .should('have.length', 3)
      .alterarTextoDoDispositivo(textoInciso)
      .wait(Cypress.config('isInteractive') ? 1000 : 2000)
      .then(() => cy.get('@container').contains(textoInciso));

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(textoInciso);

    // adicionando e numerando alínea de alteração de norma
    cy.getContainerIncisoNormaByRotulo('I').click().selecionarOpcaoDeMenuDoDispositivo('Adicionar alínea');

    cy.get('#lxEtaId90 > :nth-child(1) > .container__texto > .texto__rotulo').click();
    cy.get('sl-input').shadow().find('div.form-control.form-control--medium.form-control--has-label.form-control--has-help-text').find('div.form-control-input').type('a');
    cy.get('sl-dialog > [variant="primary"]').click();

    const textoAlinea = 'texto da nova alínea de alteração de norma:';
    cy.get('div.container__elemento.dispositivo--adicionado')
      .as('container')
      .should('have.length', 4)
      .alterarTextoDoDispositivo(textoAlinea)
      .wait(Cypress.config('isInteractive') ? 1000 : 2000)
      .then(() => cy.get('@container').contains(textoAlinea));

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(textoAlinea);

    // adicionando e numerando alínea de alteração de norma
    cy.getContainerAlineaNormaByRotulo('a').click().selecionarOpcaoDeMenuDoDispositivo('Adicionar item');

    cy.get('#lxEtaId91 > :nth-child(1) > .container__texto > .texto__rotulo').click();
    cy.get('sl-input').shadow().find('div.form-control.form-control--medium.form-control--has-label.form-control--has-help-text').find('div.form-control-input').type('1');
    cy.get('sl-dialog > [variant="primary"]').click();

    const textoItem = 'texto do novo item de alteração de norma.';
    cy.get('div.container__elemento.dispositivo--adicionado')
      .as('container')
      .should('have.length', 5)
      .alterarTextoDoDispositivo(textoItem)
      .wait(Cypress.config('isInteractive') ? 1000 : 2000)
      .then(() => cy.get('@container').contains(textoItem));

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(textoItem);
  });
});
