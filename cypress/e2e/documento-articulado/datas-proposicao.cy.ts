/**
 * Datas da proposição obtida pelo host: `data` (campo "Data", impressão) e `dataUltimaModificacao` (instante da obtenção).
 *
 * Cobre, pela UI real, a change 2026-11-04-c01-corrigir-datas-proposicao (issue #1034).
 * Fixture: demo/doc/teste_fecho_com_data.json (data do fecho 2026-04-24), gerada por criarDocumentoArticulado().
 * O valor exato do instante fica no teste de componente, com o relógio congelado.
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_fecho_com_data.json';
const SEL_CAMPO_DATA = 'lexml-eta-data';
const XSD_DATE_TIME_COM_FUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

const abrir = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get(SEL_CAMPO_DATA).should('have.prop', 'data', '2026-04-24');
};

describe('Datas da proposição obtida', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('traz a data do fecho em data e o instante da obtenção em dataUltimaModificacao', () => {
    abrir();

    cy.get('lexml-eta').should($el => {
      const proposicao = ($el[0] as any).getProposicao();
      expect(proposicao.data).to.equal('2026-04-24');
      expect(proposicao.dataUltimaModificacao).to.match(XSD_DATE_TIME_COM_FUSO);
      expect(Math.abs(Date.now() - Date.parse(proposicao.dataUltimaModificacao))).to.be.lessThan(60_000);
    });
  });

  it('com "Não informar" selecionado, traz data vazia', () => {
    abrir();

    // O handler fica no próprio sl-radio: o clique é disparado no host.
    cy.get(SEL_CAMPO_DATA)
      .shadow()
      .find('#no-date')
      .then($radio => $radio[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    cy.get(SEL_CAMPO_DATA).should('have.prop', 'data', '');

    cy.get('lexml-eta').should($el => {
      const proposicao = ($el[0] as any).getProposicao();
      expect(proposicao.data).to.equal('');
      expect(proposicao.dataUltimaModificacao).to.match(XSD_DATE_TIME_COM_FUSO);
    });
  });
});
