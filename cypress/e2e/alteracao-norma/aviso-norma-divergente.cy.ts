/**
 * Aviso de norma alterada divergente da norma citada (change 2026-10-14-c01, #266385)
 *
 * Cobre a ligação do aviso com a tela: ele nasce da remissão criada ao vivo (o texto do estado
 * ainda não tem o link), permanece ao navegar, e "Corrigir agora" alinha o base e pode ser desfeito.
 */

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const quillDe = (win: any): any => (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
const pDoArtigo = (win: any): HTMLElement => win.document.querySelectorAll('div.container__elemento.elemento-tipo-artigo')[0].querySelector('p.texto__dispositivo') as HTMLElement;
const aviso = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('div.container__elemento.elemento-tipo-artigo').first().find('.mensagem--warning');
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

// Sair da linha dispara a detecção assíncrona (Worker real); a espera cobre detecção, criação e desenho do link.
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

describe('Aviso de norma alterada divergente', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.wait(1500);
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
    cy.wait(1000);
    irParaArtigo();
    substituirTexto('A Lei nº 14.133, de 1º de abril de 2021, passa a vigorar com as seguintes alterações:');
    irParaProximaLinha();
  });

  it('a norma citada preenche o base e não há aviso', () => {
    esperarBase(URN_LEI_14133);
    aviso().should('not.exist');
  });

  it('trocar a lei citada mostra o aviso com as duas normas e ele permanece ao navegar', () => {
    irParaArtigo();
    substituirTexto('A Lei nº 8.666, de 21 de junho de 1993, passa a vigorar com as seguintes alterações:');
    irParaProximaLinha();

    aviso().should('have.length', 1).and('contain.text', '14.133').and('contain.text', '8.666');
    esperarBase(URN_LEI_14133);

    irParaArtigo();
    aviso().should('have.length', 1);
    irParaProximaLinha();
    aviso().should('have.length', 1);
  });

  it('"Corrigir agora" alinha o base, o aviso some e a correção pode ser desfeita', () => {
    irParaArtigo();
    substituirTexto('A Lei nº 8.666, de 21 de junho de 1993, passa a vigorar com as seguintes alterações:');
    irParaProximaLinha();
    aviso().should('have.length', 1);

    // O cursor está em outra linha: o autofix deve agir no artigo da mensagem, não na linha atual.
    aviso().find('.mensagem__fix').click();
    cy.wait(500);
    aviso().should('not.exist');
    esperarBase(URN_LEI_8666);

    cy.window().then(win => (win as any).__rootStore.dispatch({ type: 'UNDO' }));
    cy.wait(500);
    esperarBase(URN_LEI_14133);
  });
});

export {};
