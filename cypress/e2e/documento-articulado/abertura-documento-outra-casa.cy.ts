/**
 * Recusa de documento de outra casa legislativa ao abrir arquivo.
 *
 * Cobre, pela UI real, a change 2026-10-22-c01-vocabulario-visao-completa-e-da-casa. Sem fixture nova:
 * demo/doc/teste_opcoes_impressao.json é aberto como está e, depois, com a URN trocada em memória para a Câmara.
 */
export {};

const ARQUIVO = 'demo/doc/teste_opcoes_impressao.json';
const SEL_TEXTO_PREAMBULO = '.elemento-tipo-preambulo p.texto__dispositivo';

describe('Abertura de documento de outra casa', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.get(SEL_TEXTO_PREAMBULO).should('contain.text', 'Segundo parágrafo do preâmbulo.');
  });

  it('no editor do Senado, recusa o arquivo da Câmara e mantém o documento aberto', () => {
    cy.window().then(win => cy.stub(win, 'alert').as('alerta'));
    cy.readFile(ARQUIVO).then(documento => {
      documento.value.metadado.identificacao.urn = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1';
      cy.get('#fileUpload').selectFile({ contents: Cypress.Buffer.from(JSON.stringify(documento)), fileName: 'outra_casa.json' }, { force: true });
    });

    cy.get('@alerta').should('have.been.calledOnceWith', "Documento de outra casa legislativa não é suportado neste editor (autoridade 'camara.deputados').");
    cy.get(SEL_TEXTO_PREAMBULO).should('contain.text', 'Segundo parágrafo do preâmbulo.');
    cy.getContainerArtigoByNumero(1).should('exist');
  });
});
