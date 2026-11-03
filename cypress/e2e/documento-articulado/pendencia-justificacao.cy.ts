/**
 * Pendência de justificação não informada gravada ao salvar.
 *
 * Cobre, pela UI real, a change 2026-10-08-c02-salvar-pendencia-justificacao (issue #992).
 * Sem download (sem precedente no projeto): chama getDocumentoArticulado() no elemento lexml-eta,
 * o mesmo método usado pelo botão Salvar do demo.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const JUSTIFICACAO = 'Não foi informado um texto de justificação.';
const REMISSAO = 'Corrigir remissões internas inválidas.';

const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';

const pendenciasSalvas = (): Cypress.Chainable<string[]> =>
  cy.get('lexml-eta').then($el => {
    const documento = ($el[0] as any).getDocumentoArticulado();
    const lexedit = documento.value.metadado.metadadoProprietario?.[0]?.any?.[0]?.value;
    return lexedit?.pendencias?.pendencia ?? [];
  });

describe('Pendência de justificação não informada — salvar', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('grava a pendência ao salvar uma proposição nova sem justificação', () => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    pendenciasSalvas().should('deep.equal', [JUSTIFICACAO]);
  });

  it('não grava a pendência depois de digitar a justificação', () => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get('sl-tab[panel="justificativa"]').click();
    cy.get(SEL_EDITOR_JUSTIFICACAO).should('be.visible').focus();
    cy.get(SEL_EDITOR_JUSTIFICACAO).type('Texto da justificação.', { force: true, delay: 0 });

    pendenciasSalvas().should('deep.equal', []);
  });

  it('grava a pendência de justificação antes da de remissões ao salvar um arquivo aberto', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');

    pendenciasSalvas().should('deep.equal', [JUSTIFICACAO, REMISSAO]);
  });
});
