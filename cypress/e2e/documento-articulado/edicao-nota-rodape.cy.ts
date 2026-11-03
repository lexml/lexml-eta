/**
 * Edição de nota de rodapé com um só parágrafo.
 *
 * Cobre, pela UI real, a change 2026-10-29-c02-nota-rodape-paragrafo-unico (issue #1030).
 * Colar e a nota antiga com vários parágrafos ficam no teste de componente (nota-rodape-modal.test.ts):
 * colar depende do clipboard nativo, e o fixture só tem notas de um parágrafo.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_nota_rodape.json';
const AVISO = 'A nota de rodapé admite um só parágrafo.';

const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';
const SEL_NOTA_NO_EDITOR = `${SEL_EDITOR_JUSTIFICACAO} lexml-eta-nota-rodape`;
const SEL_MODAL = '.modal-lexml-eta-nota-rodape';
const SEL_EDITOR_MODAL = `${SEL_MODAL} .ql-editor`;

const abrirFixture = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get(SEL_EDITOR_JUSTIFICACAO).should('contain.text', 'O conceito é definido em regulamento');
};

// O handler lê o id da nota no próprio sl-button (event.target): o clique é disparado no host.
const editarPrimeiraNota = (): void => {
  cy.get('sl-tab[panel="notas"]').click();
  cy.get('.notas-rodape sl-button[title="Editar nota de rodapé"]')
    .first()
    .then($botao => $botao[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  cy.get(SEL_EDITOR_MODAL).should('contain.text', 'Texto formatado da primeira nota.');
};

describe('Edição de nota de rodapé com um só parágrafo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Enter e Shift+Enter no editor da nota não criam parágrafo e exibem o aviso', () => {
    abrirFixture();
    editarPrimeiraNota();

    cy.get(SEL_EDITOR_MODAL).type('{end}{enter}');
    cy.get(`${SEL_MODAL} .modal-aviso`).should('be.visible').and('have.text', AVISO);
    cy.get(`${SEL_EDITOR_MODAL} p`).should('have.length', 1);

    cy.get(SEL_EDITOR_MODAL).type('{shift}{enter}');
    cy.get(`${SEL_EDITOR_MODAL} p`).should('have.length', 1);
    cy.get(`${SEL_EDITOR_MODAL} br`).should('not.exist');
  });

  it('salvar grava a nota com um só parágrafo', () => {
    abrirFixture();
    editarPrimeiraNota();

    cy.get(SEL_EDITOR_MODAL).type('{end}{enter}');
    cy.get(`${SEL_MODAL} .modal-save-button`).click();

    cy.get(SEL_MODAL).should('not.exist');
    cy.get(SEL_NOTA_NO_EDITOR)
      .first()
      .should($nota => {
        const texto = ($nota[0] as any).notaRodape?.texto ?? '';
        expect(texto.match(/<p>/g) ?? []).to.have.length(1);
        expect(texto.replace(/<[^>]+>/g, '')).to.equal('Texto formatado da primeira nota.');
      });
  });
});
