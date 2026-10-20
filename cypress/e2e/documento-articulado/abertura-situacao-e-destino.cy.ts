/**
 * Abertura de documento articulado salvo com situação na norma vigente e colegiado apreciador.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-10-19-c01-metadados-lexedit-situacao-colegiado.
 * Fixture: demo/doc/teste_situacao_e_destino.json, gerada por criarDocumentoArticulado() (mesmo código
 * de produção usado ao salvar), não escrita à mão: bloco de alteração com o art. 5º existente e o
 * art. 6º novo, e destino Comissão (CCJ).
 */

const SEL_DESTINO = 'lexml-eta-destino';

describe('Abertura de situação na norma vigente e destino persistidos', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#fileUpload').selectFile('demo/doc/teste_situacao_e_destino.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
  });

  it('restaura "Existente" e "Novo" nos dispositivos do bloco de alteração', () => {
    cy.getContainerArtigoNormaByNumero(5).should('have.attr', 'existenanormaalterada', 'true');
    cy.getContainerArtigoNormaByNumero(6).should('have.attr', 'existenanormaalterada', 'false');
  });

  it('seleciona Comissão e exibe a comissão do arquivo no destino', () => {
    cy.get(SEL_DESTINO).shadow().find('sl-radio[value="Comissão"]').should('have.prop', 'checked', true);
    cy.get(SEL_DESTINO).shadow().find('sl-radio[value="Plenário"]').should('have.prop', 'checked', false);
    cy.get(SEL_DESTINO).shadow().find('#auto-complete-async').should('have.prop', 'value').and('match', /CCJ/);
  });
});
