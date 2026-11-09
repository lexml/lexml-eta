/**
 * Grupo C (remissão externa) — Detecção automática desligada por identificarRemissaoExterna: false
 *
 * A ausência do link sozinha não prova nada: a detecção é assíncrona e o teste passaria antes da
 * resposta do Worker. Por isso a prova é o espião de Worker, que é criado de forma síncrona na
 * chamada ao cliente; o caso de controle mostra que o espião enxerga a criação quando a detecção está ligada.
 */
export {};

const CITACAO_COMPLETA = 'Nos termos do art. 5º da Lei nº 8.069, de 13 de julho de 1990, aplica-se a norma.';

const abrirNovaProposicao = (identificarRemissaoExterna?: boolean): void => {
  cy.visit('/', {
    onBeforeLoad(win) {
      cy.spy(win as any, 'Worker').as('worker');
    },
  });
  if (identificarRemissaoExterna !== undefined) {
    cy.window().then(win => {
      (win.document.querySelector('lexml-eta') as any).lexmlEtaConfig.identificarRemissaoExterna = identificarRemissaoExterna;
    });
  }
  cy.novaProposicao();
  cy.getContainerArtigoByNumero(1).should('exist');
  // Mesma espera do Grupo A: o documento ainda assenta depois de existir.
  cy.wait(1500);
};

describe('Detecção automática de remissão externa desligada pela configuração', () => {
  it('com false, não cria o Worker nem o link ao sair da linha', () => {
    abrirNovaProposicao(false);

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(CITACAO_COMPLETA);
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'Lei nº 8.069');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.get('@worker').should('not.have.been.called');
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 0);
  });

  it('com false, a remissão interna continua automática', () => {
    abrirNovaProposicao(false);
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao('Conforme o art. 2º.');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 2º');
    cy.get('@worker').should('not.have.been.called');
  });

  it('controle: sem o campo alterado, o Worker é criado e o link aparece', () => {
    abrirNovaProposicao();

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(CITACAO_COMPLETA);
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'Lei nº 8.069');
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.get('@worker').should('have.been.called');
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 1);
  });
});
