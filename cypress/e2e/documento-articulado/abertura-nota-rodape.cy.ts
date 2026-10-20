/**
 * Abertura de documento articulado com notas de rodapé na justificação.
 *
 * Cobre, pela UI real, a change 2026-10-19-c02-salvar-abrir-notas-rodape (issue #993).
 * Fixture: demo/doc/teste_nota_rodape.json, gerado por getDocumentoArticulado() (mesmo código de produção
 * usado ao salvar), não escrito à mão. Sem download (sem precedente no projeto).
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_nota_rodape.json';

const SEL_EDITOR_JUSTIFICACAO = '#lexml-eta-editor-texto-rico-justificativa-inner > .ql-editor';
const SEL_NOTA_NO_EDITOR = `${SEL_EDITOR_JUSTIFICACAO} lexml-eta-nota-rodape`;
const SEL_NOTAS_DA_ABA = '.notas-rodape .notas-texto';

const abrirFixture = (): void => {
  cy.get('#fileUpload').selectFile(FIXTURE, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
  cy.get(SEL_EDITOR_JUSTIFICACAO).should('contain.text', 'O conceito é definido em regulamento');
};

describe('Abertura de notas de rodapé persistidas', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe as referências numeradas na ordem e lista as notas na aba Notas', () => {
    abrirFixture();
    cy.get('sl-tab[panel="justificativa"]').click();

    cy.get(SEL_NOTA_NO_EDITOR).should('have.length', 2);
    cy.get(SEL_NOTA_NO_EDITOR).then($notas => {
      expect($notas.toArray().map(n => n.getAttribute('numero'))).to.deep.equal(['1', '2']);
    });

    cy.get('sl-tab[panel="notas"]').click();
    cy.get(SEL_NOTAS_DA_ABA).should('have.length', 2);
    cy.get(SEL_NOTAS_DA_ABA).eq(0).find('b').should('have.text', 'formatado');
    cy.get(SEL_NOTAS_DA_ABA).eq(0).should('contain.text', 'Texto formatado da primeira nota.');
    cy.get(SEL_NOTAS_DA_ABA).eq(1).should('contain.text', 'Segunda nota de rodapé.');
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

  it('abrir em seguida um arquivo sem notas deixa o editor e a aba Notas sem notas', () => {
    abrirFixture();
    cy.get(SEL_NOTA_NO_EDITOR).should('have.length', 2);

    cy.get('#fileUpload').selectFile('demo/doc/teste_justificacao.json', { force: true });
    cy.get(SEL_EDITOR_JUSTIFICACAO).should('contain.text', 'Ciência & Tecnologia');

    cy.get(SEL_NOTA_NO_EDITOR).should('not.exist');
    cy.get('sl-tab[panel="notas"]').click();
    cy.get(SEL_NOTAS_DA_ABA).should('not.exist');
    cy.get('.notas-texto-vazio').should('have.text', 'Não há notas de rodapé registradas.');
  });
});
