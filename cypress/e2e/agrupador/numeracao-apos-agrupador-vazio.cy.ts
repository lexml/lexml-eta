// #1076: com dois capítulos seguidos e o primeiro vazio, o artigo do segundo voltava a "Art. 1º".
export {};

const OPCAO_AGRUPADOR = 'Adicionar Título, Capítulo, Seção e outros';

const rotulosDosArtigos = (): Cypress.Chainable<string[]> =>
  cy.get('div.container__elemento.elemento-tipo-artigo label.texto__rotulo').then($labels => Cypress._.map($labels, l => l.textContent!.trim()));

// O diálogo fica no body; o tipo vem marcado pelo editor (Capítulo) e a posição, "Depois".
const confirmarDialogoAgrupador = (): void => {
  cy.get('#slDialogAdicionarAgrupadorArtigo sl-radio#Capitulo').should('have.attr', 'aria-checked', 'true');
  cy.get('#slDialogAdicionarAgrupadorArtigo sl-button[variant="primary"]').then($ok => $ok[0].dispatchEvent(new MouseEvent('click', { bubbles: true })));
  cy.get('#slDialogAdicionarAgrupadorArtigo').should('not.exist');
};

describe('Numeração de artigo depois de agrupador vazio (#1076)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    rotulosDosArtigos().should('deep.equal', ['Art. 1º', 'Art. 2º']);
  });

  it('capítulo criado a partir de outro capítulo mantém o artigo seguinte como Art. 2º', () => {
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo(OPCAO_AGRUPADOR);
    confirmarDialogoAgrupador();
    cy.get('div.container__elemento.elemento-tipo-capitulo').should('have.length', 1);

    cy.get('div.container__elemento.elemento-tipo-capitulo').first().selecionarOpcaoDeMenuDoDispositivo(OPCAO_AGRUPADOR);
    confirmarDialogoAgrupador();

    cy.get('div.container__elemento.elemento-tipo-capitulo label.texto__rotulo').then($labels => {
      expect(Cypress._.map($labels, l => l.textContent!.trim())).to.deep.equal(['CAPÍTULO I', 'CAPÍTULO II']);
    });
    rotulosDosArtigos().should('deep.equal', ['Art. 1º', 'Art. 2º']);
  });
});
