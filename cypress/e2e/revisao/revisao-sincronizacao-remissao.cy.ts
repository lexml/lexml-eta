/**
 * Revisão: sincronizar só a marcação das remissões não gera revisão (#1108).
 *
 * O link de remissão externa é desenhado em silêncio no Quill; ao sincronizar o texto, o Redux
 * recebe o HTML com o link, que difere do que ele guarda só na marcação. Isso não é edição do
 * usuário e não pode criar marca de revisão (nem lançar erro, o que o Cypress detecta como
 * exceção não tratada da aplicação).
 *
 * dispararDeteccaoRemissao despacha a mesma sincronização que a saída da linha e o debounce.
 */
export {};

const CITACAO_DE_NORMA = 'Nos termos do art. 5º da Lei nº 8.069, de 13 de julho de 1990, aplica-se a norma.';

describe('Revisão: sincronizar a marcação de remissão não gera revisão', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // Mesmo assentamento do documento recém-criado que a suíte de remissão externa aguarda.
    cy.wait(1500);

    cy.getContainerArtigoByNumero(1).digitarTextoRemissao(CITACAO_DE_NORMA);
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-externa').should('have.length', 1);

    cy.ativarRevisaoDispositivo();
    cy.getSwitchRevisaoDispositivo().getContadorRevisao().as('contadorRevisao').contains('0');
  });

  it('sair da linha sem digitar não cria marca de revisão', () => {
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.get('@contadorRevisao').contains('0');
    cy.getContainerArtigoByNumero(1).find('.blot__revisao').should('not.exist');
  });

  it('depois de adicionar um artigo, só o artigo adicionado tem marca de revisão', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.get('@contadorRevisao').contains('1');

    // Volta ao artigo que tem o link e sincroniza de novo, sem digitar.
    cy.getContainerArtigoByNumero(1).getOpcoesDeMenuDoDispositivo();
    cy.getContainerArtigoByNumero(1).dispararDeteccaoRemissao();

    cy.get('@contadorRevisao').contains('1');
    cy.getContainerArtigoByNumero(1).find('.blot__revisao').should('not.exist');
    cy.getContainerArtigoByNumero(2).find('.blot__revisao').should('exist');
  });
});
