// #1104: a proposição iniciada com texto vazio mostrava "Art. 1º" até incluir e excluir um segundo artigo.
export {};

const ROTULOS = 'div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0 label';

const rotulosDosArtigos = (esperados: string[]): void => {
  cy.get(ROTULOS).should($labels => expect($labels.toArray().map(label => label.textContent?.trim())).to.deep.equal(esperados));
};

describe('Artigo único na proposição iniciada com texto vazio (#1104)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('o único artigo aparece como "Artigo único."', () => {
    rotulosDosArtigos(['Artigo único.']);
  });

  it('incluir um artigo numera os dois, e excluir o segundo volta a "Artigo único."', () => {
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    rotulosDosArtigos(['Art. 1º', 'Art. 2º']);

    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Remover');
    rotulosDosArtigos(['Artigo único.']);
  });
});
