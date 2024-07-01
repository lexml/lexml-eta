describe('Testando paginação com PLP 68/2024', () => {
  beforeEach(() => {
    cy.novaEmenda({
      projetoNormaSelectValue: '_plp_68_2024',
      modoEmendaSelectValue: 'emenda',
    });
  });

  it('Verificando configuração inicial', () => {
    cy.get('div.nome-proposicao').contains('PLP 68/2024').should('exist');
    cy.get('#selectPaginaArticulacao').should('exist');
  });

  it('Navegação simples entre as páginas', () => {
    cy.get('#selectPaginaArticulacao').select('1');
    cy.get('div.ementa.container__elemento--ativo').should('exist');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(160).should('exist');
    cy.getContainerArtigoByNumero(161).should('not.exist');

    cy.get('#selectPaginaArticulacao').select('2');
    cy.get('div.ementa').should('not.exist');
    cy.getContainerArtigoByNumero(1).should('not.exist');
    cy.getContainerArtigoByNumero(160).should('not.exist');
    cy.getContainerArtigoByNumero(161).should('exist');
    cy.getContainerArtigoByNumero(392).should('exist');

    cy.get('#selectPaginaArticulacao').select('3');
    cy.get('div.ementa').should('not.exist');
    cy.getContainerArtigoByNumero(1).should('not.exist');
    cy.getContainerArtigoByNumero(160).should('not.exist');
    cy.getContainerArtigoByNumero(161).should('not.exist');
    cy.getContainerArtigoByNumero(392).should('not.exist');
    cy.getContainerArtigoByNumero(393).should('exist');
    cy.getContainerArtigoByNumero(499).should('exist');
  });

  it('Adiciona dispositivo, liga revisão, remove dispositivo muda de página e retorna para página da remoção', () => {
    cy.irParaPagina(1);
    cy.getContainerArtigoByNumero(3).next().next().selecionarOpcaoDeMenuDoDispositivo('Adicionar inciso depois');

    cy.get('div.container__elemento.dispositivo--adicionado').as('dispositivoAdicionado').alterarTextoDoDispositivo('texto do novo inciso;');

    cy.ativarRevisaoDispositivo();

    cy.get('@dispositivoAdicionado').selecionarOpcaoDeMenuDoDispositivo('Remover');

    cy.irParaPagina(2);
    cy.get('div.container__elemento.elemento-tipo-artigo label').contains('Art. 161').should('exist');

    cy.irParaPagina(1);
    cy.get('[excluido="true"]').should('have.length', 1).click();
  });

  it('Suprime dispositivo, navega para outra página, volta e verifica se dispositivo suprimido está sendo exibido', () => {
    cy.irParaPagina(1);
    cy.getContainerArtigoByNumero(1).next().click().selecionarOpcaoDeMenuDoDispositivo('Suprimir');

    cy.irParaPagina(2);
    cy.get('div.container__elemento.elemento-tipo-artigo label').contains('Art. 161').should('exist');

    cy.irParaPagina(1);
    cy.getContainerArtigoByNumero(1).next().should('have.class', 'dispositivo--suprimido').click();
  });
});
