describe('Emenda para MPV 905', () => {
  it('Emenda "artigo onde couber"', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emendaArtigoOndeCouber',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaOndeCouber({ nomeProposicao: 'MPV 905/2019', totalElementos: 2 });

    // cy.get('#texto__dispositivo3').then($el => {
    //   // $el[0].textContent = 'AAA BBB CCC DDD EEE FFF GGG HHH';

    //   // cy.get('lexml-eta-editor').then($eta => {
    //   //   const eta = $eta[0];
    //   //   (eta as any).emitirEventoOnChange('cypress');
    //   // });

    //   const $el0 = cy.wrap($el[0]);
    //   $el0.type('PPP QQQ RRR SSS TTT UUU WWW XXX YYY ZZZ.', { force: true });
    // });

    const dispositivoAdicionado = cy.get('div.container__elemento.dispositivo--adicionado');

    const texto = 'Texto do artigo onde couber.';
    cy.inserirTextoNoDispositivo(dispositivoAdicionado, texto);

    dispositivoAdicionado.should('have.length', 1).contains(texto);
    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });

  it('Emenda padrão - inclusão de dispositivo', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaPadrao({ nomeProposicao: 'MPV 905/2019', totalElementos: 563 });

    const art2 = cy.getContainerArtigoByNumero(2);
    art2.click();
    cy.selecionarOpcaoDeMenuDoDispositivo(art2, 'Adicionar artigo depois');

    const dispositivoAdicionado = cy.get('div.container__elemento.dispositivo--adicionado');
    const texto = 'Texto do novo artigo.';
    cy.inserirTextoNoDispositivo(dispositivoAdicionado, texto);

    dispositivoAdicionado.should('have.length', 1).contains(texto);

    cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });

  it('Emenda padrão - alteração de dispositivo', () => {
    cy.novaEmenda({
      projetoNormaSelectValue: 'mpv_905_2019',
      modoEmendaSelectValue: 'emenda',
    });

    cy.checarEstadoInicialAoCriarNovaEmendaPadrao({ nomeProposicao: 'MPV 905/2019', totalElementos: 563 });

    const art2_par1 = cy.getContainerArtigoByNumero(2).next();
    art2_par1.click();

    const texto = 'Novo texto do parágrafo 1º do artigo 2º.';
    cy.inserirTextoNoDispositivo(art2_par1, texto);

    art2_par1.should('have.length', 1).contains(texto);

    // cy.checarComandoEmenda();
    cy.checarTextoPresenteEmComandoEmenda(texto);
  });
});
