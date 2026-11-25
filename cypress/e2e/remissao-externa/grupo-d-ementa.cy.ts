/**
 * Grupo D (remissão externa) — ementa (#1085)
 *
 * A ementa fica fora da árvore da articulação: a detecção descartava o resultado do lexml-linker
 * e a gravação não injetava o link no texto da ementa. Mesmos comandos do Grupo A.
 */
export {};

const EMENTA = 'Altera a Lei nº 12.965, de 23 de abril de 2014, para blá blá blá.';
const TEXTO_LINK = 'Lei nº 12.965, de 23 de abril de 2014';
const URN = 'urn:lex:br:federal:lei:2014-04-23;12965';
const SEL_EMENTA = 'div.container__elemento.elemento-tipo-ementa';

describe('Remissão externa na ementa (#1085)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    // Mesmo assentamento do Grupo A (docs/analises/ANALISE_CORRIDA_ASSENTAMENTO_NOVA_PROPOSICAO.md).
    cy.wait(1500);

    cy.get(SEL_EMENTA).digitarTextoRemissao(EMENTA);
    cy.window().should((win: any) => expect(win.document.querySelector('lexml-eta-proposicao-editor').quill.linhaAtual.tipo).to.equal('Ementa'));
    cy.get(SEL_EMENTA).dispararDeteccaoRemissao();
  });

  it('a citação na ementa vira link ao sair da linha', () => {
    cy.get(SEL_EMENTA).find('a.lexml-remissao-externa').should('have.length', 1).and('contain.text', TEXTO_LINK);
  });

  it('o link da ementa é gravado e volta ao reabrir o documento', () => {
    cy.get(SEL_EMENTA).find('a.lexml-remissao-externa').should('have.length', 1);

    cy.window().then((win: any) => {
      const documento = win.document.querySelector('lexml-eta').getDocumentoArticulado();
      const projeto = documento.value.projetoNorma.projeto ?? documento.value.projetoNorma.norma;
      const ementa = JSON.stringify(projeto.parteInicial.ementa);
      expect(ementa, 'Remissao na ementa gravada').to.contain('Remissao').and.contain(URN);

      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'ementa.json' }, { force: true });
    });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get(SEL_EMENTA).find('a.lexml-remissao-externa').should('have.length', 1).and('contain.text', TEXTO_LINK);
  });
});
