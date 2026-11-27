/**
 * Remoção impedida em modo de revisão (#1106).
 *
 * Na MPV 885, o Art. 1º da proposição tem um bloco de alteração. Removido em revisão um artigo
 * do bloco, o Art. 1º da proposição não pode mais ser removido: a opção "Remover" some do menu e
 * o Ctrl+D é recusado com a mensagem, senão recusar a revisão do filho deixava um filho sem pai.
 */
export {};

const TEXTO_ARTIGO_DO_BLOCO = 'Fica instituído, no âmbito do Ministério';
const MENSAGEM_IMPEDIMENTO = 'Não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.';
const SEL_RECUSAR = '.blot__revisao_recusar';

const linhaDoArtigoDoBloco = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.contains('div.container__elemento', TEXTO_ARTIGO_DO_BLOCO);

describe('Revisão: não remover dispositivo que tem subordinado removido em revisão', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_885_2019', { naoMostrarExplicacaoSufixo: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.ativarRevisaoDispositivo();

    linhaDoArtigoDoBloco().selecionarOpcaoDeMenuDoDispositivo('Remover');
    linhaDoArtigoDoBloco().find(SEL_RECUSAR).should('exist');
  });

  it('o menu do Art. 1º não oferece "Remover" e volta a oferecer depois de recusar a revisão do filho', () => {
    cy.getContainerArtigoByNumero(1).getOpcoesDeMenuDoDispositivo().click({ force: true });
    cy.get('sl-menu-item').should('exist');
    cy.contains('sl-menu-item', 'Remover').should('not.exist');

    linhaDoArtigoDoBloco().find(SEL_RECUSAR).click({ force: true });
    linhaDoArtigoDoBloco().find(SEL_RECUSAR).should('not.exist');

    cy.getContainerArtigoByNumero(1).getOpcoesDeMenuDoDispositivo().click({ force: true });
    cy.contains('sl-menu-item', 'Remover').should('exist');
  });

  it('Ctrl+D no Art. 1º não remove o artigo e mostra a mensagem', () => {
    cy.getContainerArtigoByNumero(1).getOpcoesDeMenuDoDispositivo();
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').type('{ctrl}d', { force: true });

    cy.get('.sl-toast-stack sl-alert').should('contain.text', MENSAGEM_IMPEDIMENTO);
    cy.getContainerArtigoByNumero(1).find('p.texto__dispositivo').should('contain.text', 'passa a vigorar');
    cy.getContainerArtigoByNumero(1).find(SEL_RECUSAR).should('not.exist');
  });
});
