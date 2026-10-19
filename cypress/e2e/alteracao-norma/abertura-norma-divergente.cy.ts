/**
 * Abertura de documento com norma alterada divergente da norma citada (change 2026-10-14-c01, #266385)
 *
 * O documento é gerado pela própria UI e serializado por getDocumentoArticulado() (mesmo código de
 * produção do botão Salvar), não escrito à mão. Depois a norma alterada do arquivo é trocada e o
 * documento é aberto numa página nova.
 */

const URN_LEI_14133 = 'urn:lex:br:federal:lei:2021-04-01;14133';
const URN_LEI_8666 = 'urn:lex:br:federal:lei:1993-06-21;8666';

const quillDe = (win: any): any => (win.document.querySelector('lexml-eta-proposicao-editor') as any).quill;
const pDoArtigo = (win: any): HTMLElement => win.document.querySelectorAll('div.container__elemento.elemento-tipo-artigo')[0].querySelector('p.texto__dispositivo') as HTMLElement;
const artigo = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('div.container__elemento.elemento-tipo-artigo').first();
// should() repete até estabilizar; then() devolveria a janela quando o valor é undefined.
const esperarBase = (esperado: string | undefined): Cypress.Chainable<any> =>
  cy.window().should(win => expect((win as any).__rootStore.getState().elementoReducer.articulacao.filhos[0].alteracoes?.base).to.equal(esperado));

// O componente raiz pode estar dentro de shadow roots da demo.
const acharComponente = (raiz: ParentNode): any => {
  const direto = raiz.querySelector('lexml-eta');
  if (direto) return direto;
  for (const el of Array.from(raiz.querySelectorAll('*'))) {
    const achado = (el as any).shadowRoot && acharComponente((el as any).shadowRoot);
    if (achado) return achado;
  }
  return undefined;
};

const trocarBase = (no: any, de: string, para: string): void => {
  if (Array.isArray(no)) no.forEach(n => trocarBase(n, de, para));
  else if (no && typeof no === 'object') {
    if (no.base === de) no.base = para;
    Object.values(no).forEach(v => trocarBase(v, de, para));
  }
};

const gerarDocumentoSalvo = (): Cypress.Chainable<any> => {
  cy.visit('/');
  cy.novaProposicao();
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.wait(1500);
  cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar alteração de norma');
  cy.wait(1000);
  cy.window().then(win => {
    const quill = quillDe(win);
    const blot = quill.constructor.find(pDoArtigo(win));
    const inicio = blot.offset(quill.scroll);
    quill.setSelection(inicio, 0, 'user');
  });
  cy.wait(500);
  cy.window().then(win => {
    const quill = quillDe(win);
    const blot = quill.constructor.find(pDoArtigo(win));
    const inicio = blot.offset(quill.scroll);
    quill.deleteText(inicio, blot.length() - 1, 'user');
    quill.insertText(inicio, 'A Lei nº 14.133, de 1º de abril de 2021, passa a vigorar com as seguintes alterações:', 'user');
  });
  cy.wait(500);
  cy.window().then(win => {
    const quill = quillDe(win);
    quill.setSelection(quill.linhaAtual.next.blotConteudo.offset(quill.scroll), 0, 'user');
  });
  cy.wait(3000);
  esperarBase(URN_LEI_14133);

  return cy.window().then(win => JSON.parse(JSON.stringify(acharComponente(win.document).getDocumentoArticulado())));
};

describe('Abertura de documento com norma alterada divergente', () => {
  it('exibe o aviso com as duas normas e não altera a norma alterada do arquivo', () => {
    gerarDocumentoSalvo().then(documento => {
      trocarBase(documento, URN_LEI_14133, URN_LEI_8666);

      cy.visit('/');
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'divergente.json', mimeType: 'application/json' }, { force: true });
    });

    cy.getContainerArtigoByNumero(1).should('exist');
    artigo().find('a.lexml-remissao-externa').should('have.length', 1);
    artigo().find('.mensagem--warning').should('have.length', 1).and('contain.text', '14.133').and('contain.text', '8.666');
    esperarBase(URN_LEI_8666);
  });

  it('documento coerente abre sem aviso', () => {
    gerarDocumentoSalvo().then(documento => {
      cy.visit('/');
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'coerente.json', mimeType: 'application/json' }, { force: true });
    });

    cy.getContainerArtigoByNumero(1).should('exist');
    artigo().find('a.lexml-remissao-externa').should('have.length', 1);
    artigo().find('.mensagem--warning').should('not.exist');
    esperarBase(URN_LEI_14133);
  });
});

export {};
