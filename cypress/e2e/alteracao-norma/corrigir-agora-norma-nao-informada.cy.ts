/**
 * "Corrigir agora" do erro "informar a norma" com remissões externas no artigo (change 2026-10-14-c01, #266385)
 *
 * Com duas citações a norma não é inferida: o diálogo abre e, ao informá-la, as remissões externas
 * continuam sendo remissões externas (link e popup de ações), sem virar link comum.
 */

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const TEXTO = 'A Lei nº 14.133, de 1º de abril de 2021, e a Lei nº 8.666, de 21 de junho de 1993, passam a vigorar com as seguintes alterações:';

const quillDe = (win: any): any => (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
const pDoArtigo = (win: any): HTMLElement => win.document.querySelectorAll('div.container__elemento.elemento-tipo-artigo')[0].querySelector('p.texto__dispositivo') as HTMLElement;
const artigo = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('div.container__elemento.elemento-tipo-artigo').first();
// should() repete até estabilizar; then() devolveria a janela quando o valor é undefined.
const esperarBase = (esperado: string | undefined): Cypress.Chainable<any> =>
  cy.window().should(win => expect((win as any).__rootStore.getState().elementoReducer.articulacao.filhos[0].alteracoes?.base).to.equal(esperado));

const irParaArtigo = (): void => {
  cy.window().then(win => {
    const quill = quillDe(win);
    quill.setSelection(quill.constructor.find(pDoArtigo(win)).offset(quill.scroll), 0, 'user');
  });
  cy.wait(500);
};

// Sair da linha dispara a detecção assíncrona (Worker real); a espera cobre detecção, criação e desenho dos links.
const irParaProximaLinha = (): void => {
  cy.window().then(win => {
    const quill = quillDe(win);
    quill.setSelection(quill.linhaAtual.next.blotConteudo.offset(quill.scroll), 0, 'user');
  });
  cy.wait(3000);
};

const substituirTexto = (texto: string): void => {
  cy.window().then(win => {
    const quill = quillDe(win);
    const blot = quill.constructor.find(pDoArtigo(win));
    const inicio = blot.offset(quill.scroll);
    quill.deleteText(inicio, blot.length() - 1, 'user');
    quill.insertText(inicio, texto, 'user');
  });
};

describe('Corrigir agora: norma alterada não informada', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1500);
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
    cy.wait(1000);
    irParaArtigo();
    substituirTexto(TEXTO);
    irParaProximaLinha();
  });

  it('com duas remissões não preenche o base e o diálogo informa a norma sem destruir as remissões', () => {
    artigo().find('a.lexml-remissao-externa').should('have.length', 2);
    esperarBase(undefined);
    artigo().find('.mensagem--danger').should('contain.text', 'informar a norma');

    // O clique age na linha do cursor: o cursor volta ao artigo, como no uso real.
    irParaArtigo();
    artigo().find('.mensagem__fix').click();

    cy.get('sl-dialog[label="Dados da norma vigente"]').should('exist');
    cy.get('lexml-eta-autocomplete-norma').then($auto => ($auto[0] as any).onSelect({ urn: URN_LEI_14133 }));
    cy.get('sl-dialog[label="Dados da norma vigente"] sl-button[variant="primary"]').then($btn => ($btn[0] as any).onclick());
    cy.wait(500);

    esperarBase(URN_LEI_14133);
    artigo().find('a.lexml-remissao-externa').should('have.length', 2);
    artigo().find('.mensagem--danger').should('not.exist');

    // O popup de ações da remissão externa continua funcionando ao posicionar o cursor sobre o link.
    cy.window().then(win => {
      const quill = quillDe(win);
      const link = pDoArtigo(win).querySelector('a.lexml-remissao-externa') as HTMLElement;
      quill.setSelection(quill.constructor.find(link).offset(quill.scroll) + 1, 0, 'user');
    });
    cy.get('#remissao-popup').should('be.visible');
  });
});

export {};
