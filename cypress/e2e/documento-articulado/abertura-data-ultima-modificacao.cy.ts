/**
 * Abertura de documento articulado com a data da última modificação (lexedit:Metadado@dataUltimaModificacao).
 *
 * Cobre, pela UI real, que o timestamp só sai no documento exportado e não vira estado de edição.
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

describe('Data da última modificação no arquivo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('abrir o arquivo não expõe dataUltimaModificacaoDocumento', () => {
    abrir(FIXTURE);

    cy.get('lexml-eta').should($el => {
      expect($el[0]).not.to.have.property('dataUltimaModificacaoDocumento');
    });
  });

  it('exportar grava o instante novo, com fuso', () => {
    abrir(FIXTURE);

    cy.readFile(FIXTURE).then(arquivo => {
      const dataDoArquivo = lexedit(arquivo).dataUltimaModificacao;
      cy.get('lexml-eta').should($el => {
        const eta = $el[0] as any;
        expect(eta).not.to.have.property('dataUltimaModificacaoDocumento');
        const gravada = lexedit(eta.getDocumentoArticulado()).dataUltimaModificacao;
        expect(gravada).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
        expect(Date.parse(gravada)).to.be.greaterThan(Date.parse(dataDoArquivo));
      });
    });
  });

  it('abrir um arquivo sem a data também não expõe a propriedade', () => {
    abrir(FIXTURE);
    cy.get('lexml-eta').should($el => expect($el[0]).not.to.have.property('dataUltimaModificacaoDocumento'));

    abrir(FIXTURE_SEM_DATA);

    cy.get('lexml-eta').should($el => expect($el[0]).not.to.have.property('dataUltimaModificacaoDocumento'));
  });
});
