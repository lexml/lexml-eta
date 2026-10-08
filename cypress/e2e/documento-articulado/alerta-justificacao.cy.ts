/**
 * Alerta de justificação não informada na aba Avisos.
 *
 * Cobre, pela UI real, a change 2026-10-08-c01-alerta-justificacao-inexistente (issue #1011).
 */

const MENSAGEM_JUSTIFICACAO = 'Não foi informado um texto de justificação.';

// Lê o shadow root inteiro: sem alertas não há nenhum sl-alert para o find.
const textoDosAlertas = ($el: JQuery<HTMLElement>): string => $el[0].shadowRoot?.textContent || '';

const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';

// Não usa inserirTextoNaJustificacao: o id da aba (#sl-tab-N) depende da ordem de criação das abas.
const digitarNaJustificacao = (texto: string): void => {
  cy.get('sl-tab[panel="justificativa"]').click();
  cy.get(SEL_EDITOR_JUSTIFICACAO).should('be.visible').focus();
  cy.get(SEL_EDITOR_JUSTIFICACAO).type(texto, { force: true, delay: 0 });
};

describe('Alerta de justificação não informada — abertura', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe o alerta ao iniciar uma proposição nova, sem editar nada', () => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get('lexml-eta-alertas').shadow().find('sl-alert').contains(MENSAGEM_JUSTIFICACAO).should('exist');
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').contains(MENSAGEM_JUSTIFICACAO).find('.alert__close-button').should('not.exist');
  });

  it('exibe o alerta ao abrir um arquivo, junto com os alertas produzidos na abertura', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });

    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', MENSAGEM_JUSTIFICACAO);
  });
});

describe('Alerta de justificação não informada — edição da justificação', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).to.include(MENSAGEM_JUSTIFICACAO));
  });

  it('remove o alerta ao preencher a justificação, sem editar a articulação', () => {
    digitarNaJustificacao('Texto da justificação.');

    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).not.to.include(MENSAGEM_JUSTIFICACAO));
  });

  it('exibe de novo o alerta ao apagar todo o texto da justificação', () => {
    digitarNaJustificacao('Texto da justificação.');
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).not.to.include(MENSAGEM_JUSTIFICACAO));

    digitarNaJustificacao('{selectall}{backspace}');

    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).to.include(MENSAGEM_JUSTIFICACAO));
  });
});
