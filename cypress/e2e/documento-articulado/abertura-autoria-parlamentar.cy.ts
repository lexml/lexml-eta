/**
 * Abertura de documento articulado salvo com autoria de parlamentares.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-09-25-c01-salvar-abrir-autoria-parlamentar.
 * Fixture: demo/doc/teste_autoria_parlamentares.json, gerada por criarDocumentoArticulado() (mesmo código
 * de produção usado ao salvar), não escrita à mão: dois senadores, o primeiro com cargo, e
 * "Imprimir partido e UF" desmarcado.
 */

const SEL_AUTORIA = 'lexml-eta-autoria';

describe('Abertura de autoria de parlamentares persistida', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe na aba de autoria os parlamentares, o cargo e a opção de partido e UF do arquivo', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_autoria_parlamentares.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get(SEL_AUTORIA)
      .shadow()
      .find('lexml-eta-autocomplete')
      .should('have.length', 2)
      .then($autocompletes => {
        expect(($autocompletes[0] as any).value).to.equal('Davi Alcolumbre');
        expect(($autocompletes[1] as any).value).to.equal('Soraya Thronicke');
      });
    cy.get(SEL_AUTORIA)
      .shadow()
      .find('sl-input#tex-cargo')
      .then($cargos => {
        expect(($cargos[0] as any).value).to.equal('Presidente do Senado Federal');
        expect(($cargos[1] as any).value).to.equal('');
      });
    cy.get(SEL_AUTORIA).shadow().find('#chk-exibir-partido-uf').should('not.be.checked');
  });

  it('volta à autoria padrão ao abrir em seguida um arquivo sem autoria', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_autoria_parlamentares.json', { force: true });
    cy.get(SEL_AUTORIA).shadow().find('lexml-eta-autocomplete').should('have.length', 2);

    cy.get('#fileUpload').selectFile('demo/doc/teste_fecho_com_data.json', { force: true });

    cy.get(SEL_AUTORIA)
      .shadow()
      .find('lexml-eta-autocomplete')
      .should('have.length', 1)
      .should($autocompletes => expect(($autocompletes[0] as any).value ?? '').to.equal(''));
    cy.get(SEL_AUTORIA).shadow().find('#chk-exibir-partido-uf').should('be.checked');
  });
});
