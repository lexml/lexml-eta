/**
 * Abertura de documento articulado com justificação.
 *
 * Cobre, pela UI real, a change 2026-10-19-c01-salvar-abrir-justificacao (issue #991).
 * Fixture: demo/doc/teste_justificacao.json, gerado por getDocumentoArticulado() (mesmo código de produção
 * usado ao salvar), não escrito à mão. Sem download (sem precedente no projeto).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const MENSAGEM_JUSTIFICACAO = 'Não foi informado um texto de justificação.';
const FIXTURE = 'demo/doc/teste_justificacao.json';

const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';

// Lê o shadow root inteiro: sem alertas não há nenhum sl-alert para o find.
const textoDosAlertas = ($el: JQuery<HTMLElement>): string => $el[0].shadowRoot?.textContent || '';

const abrirJustificacao = (): void => {
  cy.get('sl-tab[panel="justificativa"]').click();
  cy.get(SEL_EDITOR_JUSTIFICACAO).should('be.visible');
};

const abrirFixture = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get(SEL_EDITOR_JUSTIFICACAO).should('contain.text', 'Ciência & Tecnologia');
};

describe('Abertura de justificação persistida', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe o texto e a tabela no editor da justificação e não exibe o alerta', () => {
    abrirFixture();
    abrirJustificacao();

    cy.get(SEL_EDITOR_JUSTIFICACAO).find('p.ql-align-justify b').should('have.text', 'Ciência & Tecnologia');
    cy.get(SEL_EDITOR_JUSTIFICACAO).find('a[href="https://www.congressonacional.leg.br"]').should('have.text', 'portal do Congresso Nacional');
    cy.get(SEL_EDITOR_JUSTIFICACAO).find('ul > li').should('have.length', 2);
    cy.get(SEL_EDITOR_JUSTIFICACAO).find('table tr').should('have.length', 2);
    cy.get(SEL_EDITOR_JUSTIFICACAO).find('table td').first().find('p.ql-align-center').should('have.text', 'Ano');
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).not.to.include(MENSAGEM_JUSTIFICACAO));
  });

  it('salvar o documento aberto devolve a mesma Justificacao do arquivo', () => {
    abrirFixture();

    cy.readFile(FIXTURE).then(arquivo => {
      cy.get('lexml-eta').should($el => {
        const documento = ($el[0] as any).getDocumentoArticulado();
        expect(documento.value.projetoNorma.justificacao).to.deep.equal(arquivo.value.projetoNorma.justificacao);
      });
    });
  });

  it('abrir um arquivo sem justificação esvazia o editor e exibe o alerta', () => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');
    abrirJustificacao();
    cy.get(SEL_EDITOR_JUSTIFICACAO).focus();
    cy.get(SEL_EDITOR_JUSTIFICACAO).type('Texto digitado antes de abrir.', { force: true, delay: 0 });
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).not.to.include(MENSAGEM_JUSTIFICACAO));

    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');

    cy.get(SEL_EDITOR_JUSTIFICACAO).should('not.contain.text', 'Texto digitado antes de abrir.');
    cy.get(SEL_EDITOR_JUSTIFICACAO).should($editor => expect($editor.text().trim()).to.equal(''));
    cy.get('lexml-eta-alertas').should($el => expect(textoDosAlertas($el)).to.include(MENSAGEM_JUSTIFICACAO));
  });
});
