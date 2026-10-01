/**
 * Abertura de documento articulado salvo com local e data do fecho.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-09-22-c02-salvar-abrir-local-data-fecho.
 * Fixtures: demo/doc/teste_fecho_com_data.json e demo/doc/teste_fecho_sem_data.json, geradas por
 * criarDocumentoArticulado() (mesmo código de produção usado ao salvar), não escritas à mão.
 * O local não aparece na UI; ele é coberto pelos testes de componente.
 */

const SEL_CAMPO_DATA_FECHO = 'lexml-eta-data';

const verificarDataFecho = (data: string | undefined): void => {
  cy.get(SEL_CAMPO_DATA_FECHO).shadow().find('#no-date').should('have.prop', 'checked', !data);
  if (data) cy.get(SEL_CAMPO_DATA_FECHO).shadow().find('#input-data').should('have.prop', 'value', data);
};

describe('Abertura de local e data do fecho persistidos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe no campo "Data" a data do fecho do arquivo aberto', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_fecho_com_data.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    verificarDataFecho('2026-04-24');
  });

  it('seleciona "Não informar" ao abrir em seguida um arquivo sem data', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_fecho_com_data.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    verificarDataFecho('2026-04-24');

    cy.get('#fileUpload').selectFile('demo/doc/teste_fecho_sem_data.json', { force: true });
    cy.get(SEL_CAMPO_DATA_FECHO).should('have.prop', 'data', '');

    verificarDataFecho(undefined);
  });
});
