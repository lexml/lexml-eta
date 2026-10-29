/**
 * Data e fecho no modo anexo de parecer e padrão do campo "Data".
 *
 * Cobre, pela UI real, a change 2026-10-19-c01-anexo-parecer-fecho-data-assinatura (issue #1022).
 * Fixture: demo/doc/teste_fecho_com_data.json (data do fecho 2026-04-24), gerada por
 * criarDocumentoArticulado(); o modo anexo vem do arquivo (demo/doc/teste_fecho_com_data_anexo_parecer.json, com anexoParecer).
 *
 * O salvar via download real do navegador não é coberto aqui (o projeto não tem infraestrutura de
 * download em E2E). Esse lado fica nos testes de componente de documentoArticulado.component.test.ts
 * e lexml-eta-anexo-parecer.test.ts, que conferem local, data, autoria e assinaturas do arquivo salvo.
 */

const SEL_CAMPO_DATA_ANEXO = 'lexml-eta-data';
const ARQUIVO_ANEXO_PARECER = 'demo/doc/teste_fecho_com_data_anexo_parecer.json';

describe('Campo "Data" e modo anexo de parecer', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('documento novo exibe "Não informar" selecionado e antes da opção de data', () => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get(SEL_CAMPO_DATA_ANEXO).shadow().find('sl-radio').first().should('have.attr', 'id', 'no-date');
    cy.get(SEL_CAMPO_DATA_ANEXO).shadow().find('#no-date').should('have.prop', 'checked', true);
    cy.get(SEL_CAMPO_DATA_ANEXO).should('have.prop', 'data', '');
  });

  it('no modo anexo de parecer, abre arquivo com data e exibe a data no campo', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO_ANEXO_PARECER, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get(SEL_CAMPO_DATA_ANEXO).should('have.prop', 'data', '2026-04-24');
    cy.get(SEL_CAMPO_DATA_ANEXO).shadow().find('#no-date').should('have.prop', 'checked', false);
    cy.get(SEL_CAMPO_DATA_ANEXO).shadow().find('#input-data').should('have.prop', 'value', '2026-04-24');
  });

  it('no modo anexo de parecer, oculta justificação e notas e exibe data e autoria', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO_ANEXO_PARECER, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get('sl-tab[panel="justificativa"]').should('not.exist');
    cy.get('sl-tab[panel="notas"]').should('not.exist');
    cy.get('sl-tab[panel="autoria"]').should('contain.text', 'Destino, Data, Autoria e Impressão');
    cy.get(SEL_CAMPO_DATA_ANEXO).parent().should('not.have.css', 'display', 'none');
    cy.get('lexml-eta-autoria').parent().should('not.have.css', 'display', 'none');
  });
});
