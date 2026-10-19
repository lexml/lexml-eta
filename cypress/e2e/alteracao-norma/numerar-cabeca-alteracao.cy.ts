/**
 * Numeração da cabeça do bloco de alteração (change 2026-10-14-c02, #266385)
 *
 * A cabeça nasce sem número e com o alerta "Numere o dispositivo": o "Corrigir agora" precisa abrir o
 * diálogo e numerar. Depois de numerada (e existente na norma alterada), a renumeração continua permitida.
 */

const quillDe = (win: any): any => (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
const cabeca = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('div.container__elemento.elemento-tipo-artigo').eq(1);
const rotuloDaCabeca = (): Cypress.Chainable<string> => cabeca().find('.texto__rotulo').invoke('text');

// O clique em "Corrigir agora" e o menu agem na linha do cursor.
const irParaCabeca = (): void => {
  cy.window().then(win => {
    const quill = quillDe(win);
    const p = win.document.querySelectorAll('div.container__elemento.elemento-tipo-artigo')[1].querySelector('p.texto__dispositivo') as HTMLElement;
    quill.setSelection(quill.constructor.find(p).offset(quill.scroll), 0, 'user');
  });
  cy.wait(500);
};

describe('Numeração da cabeça do bloco de alteração', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1500);
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
    cy.wait(1500);
  });

  it('"Corrigir agora" no alerta de numeração abre o diálogo e numera a cabeça', () => {
    cabeca().find('.mensagem--danger, .mensagem--warning, .mensagem').should('contain.text', 'Numere o dispositivo');
    irParaCabeca();
    cabeca().find('.mensagem__fix').last().click();

    cy.get('sl-dialog[label="Informar numeração"]').should('exist');
    cy.get('sl-dialog[label="Informar numeração"] sl-input').then($i => (($i[0] as any).value = '5'));
    cy.get('sl-dialog[label="Informar numeração"] sl-button[variant="primary"]').then($b => ($b[0] as any).onclick());
    cy.wait(500);

    rotuloDaCabeca().should('contain', '5');
    cabeca().should('not.contain.text', 'Numere o dispositivo');
    cy.contains('Nessa situação, não é possível renumerar').should('not.exist');
  });

  it('cabeça já numerada pode ser renumerada pelo menu', () => {
    irParaCabeca();
    cabeca().find('.mensagem__fix').last().click();
    cy.get('sl-dialog[label="Informar numeração"] sl-input').then($i => (($i[0] as any).value = '5'));
    cy.get('sl-dialog[label="Informar numeração"] sl-button[variant="primary"]').then($b => ($b[0] as any).onclick());
    cy.wait(500);
    rotuloDaCabeca().should('contain', '5');

    irParaCabeca();
    cabeca().selecionarOpcaoDeMenuDoDispositivo('Numerar dispositivo');
    cy.get('sl-dialog[label="Informar numeração"] sl-input').then($i => (($i[0] as any).value = '7'));
    cy.get('sl-dialog[label="Informar numeração"] sl-button[variant="primary"]').then($b => ($b[0] as any).onclick());
    cy.wait(500);

    rotuloDaCabeca().should('contain', '7');
    cy.contains('Nessa situação, não é possível renumerar').should('not.exist');
  });
});

export {};
