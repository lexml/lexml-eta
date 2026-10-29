/**
 * Abertura de documento articulado com a data da última modificação (lexedit:Metadado@dataUltimaModificacao).
 *
 * Cobre, pela UI real, a change 2026-10-29-c01-salvar-abrir-demais-metadados-lexedit (issue #997).
 * Fixture: demo/doc/teste_data_ultima_modificacao.json, gerado por getDocumentoArticulado() com o componente real.
 * Sem download (sem precedente no projeto): o salvamento é conferido pelo retorno de getDocumentoArticulado().
 */

// Módulo, não script: evita colisão de constantes entre specs.
export {};

const FIXTURE = 'demo/doc/teste_data_ultima_modificacao.json';
const FIXTURE_SEM_DATA = 'demo/doc/teste_justificacao.json';

const lexedit = (documento: any): any => documento.value.metadado.metadadoProprietario?.[0].any[0].value ?? {};

const abrir = (arquivo: string): void => {
  cy.get('#fileUpload').selectFile(arquivo, { force: true });
  cy.getContainerArtigoByNumero(1).should('exist');
};

describe('Abertura da data da última modificação', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('abrir o arquivo expõe a data gravada na propriedade dataUltimaModificacaoDocumento', () => {
    abrir(FIXTURE);

    cy.readFile(FIXTURE).then(arquivo => {
      cy.get('lexml-eta').should($el => {
        expect(($el[0] as any).dataUltimaModificacaoDocumento).to.equal(lexedit(arquivo).dataUltimaModificacao);
      });
    });
  });

  it('salvar grava o instante do novo salvamento, com fuso, sem alterar a propriedade', () => {
    abrir(FIXTURE);

    cy.readFile(FIXTURE).then(arquivo => {
      const dataDoArquivo = lexedit(arquivo).dataUltimaModificacao;
      cy.get('lexml-eta').should($el => {
        const eta = $el[0] as any;
        expect(eta.dataUltimaModificacaoDocumento).to.equal(dataDoArquivo);
        const gravada = lexedit(eta.getDocumentoArticulado()).dataUltimaModificacao;
        expect(gravada).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
        expect(Date.parse(gravada)).to.be.greaterThan(Date.parse(dataDoArquivo));
        expect(eta.dataUltimaModificacaoDocumento).to.equal(dataDoArquivo);
      });
    });
  });

  it('abrir em seguida um arquivo sem a data deixa a propriedade indefinida', () => {
    abrir(FIXTURE);
    cy.get('lexml-eta').should($el => expect(($el[0] as any).dataUltimaModificacaoDocumento).to.be.a('string'));

    abrir(FIXTURE_SEM_DATA);

    cy.get('lexml-eta').should($el => expect(($el[0] as any).dataUltimaModificacaoDocumento).to.be.undefined);
  });
});
