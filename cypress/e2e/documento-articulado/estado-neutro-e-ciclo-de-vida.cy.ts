/**
 * Estado neutro, nova proposição e abertura de documento pela interface do componente.
 *
 * Cobre, pela UI real da demo, a change 2026-10-27-c01-rever-interface-lexml-eta (#1016).
 * Sem fixture nova: o documento aberto é demo/doc/teste_opcoes_impressao.json. A viabilidade do E2E segue
 * docs/guia-cypress.md: a demo chama novaProposicao/abrirDocumentoArticulado pelo botão "Ok" e pelo upload,
 * e fecharDocumento() é chamado direto no componente (a demo só o expõe ao escolher um documento vazio).
 */
export {};

const SEL_ABAS_ESQUERDA = '#tabs-esquerda sl-tab';
const SEL_ABAS_DIREITA = '#tabs-direita sl-tab';
const SEL_AGUARDANDO = '.aguardando-inicializacao';
const ARQUIVO = 'demo/doc/teste_opcoes_impressao.json';

const verificarEstadoNeutro = (): void => {
  cy.get(SEL_AGUARDANDO).should('exist').and('contain.text', 'aguardando inicialização');
  cy.get(SEL_ABAS_ESQUERDA)
    .should('have.length.greaterThan', 0)
    .each($aba => expect($aba[0].hasAttribute('inert'), 'aba da esquerda desabilitada').to.equal(true));
  cy.get(SEL_ABAS_DIREITA)
    .should('have.length.greaterThan', 0)
    .each($aba => expect($aba[0].hasAttribute('inert'), 'aba da direita desabilitada').to.equal(true));
};

const verificarDocumentoEmEdicao = (): void => {
  cy.get(SEL_AGUARDANDO).should('not.exist');
  cy.get(SEL_ABAS_ESQUERDA).each($aba => expect($aba[0].hasAttribute('inert'), 'aba da esquerda habilitada').to.equal(false));
  cy.get(SEL_ABAS_DIREITA).each($aba => expect($aba[0].hasAttribute('inert'), 'aba da direita habilitada').to.equal(false));
};

describe('Estado neutro e ciclo de vida do documento', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('inicia em estado neutro, com a mensagem de espera e as abas desabilitadas', () => {
    verificarEstadoNeutro();
  });

  it('sai do estado neutro ao criar uma nova proposição', () => {
    cy.get('input[type="button"][value="Ok"]').click();

    verificarDocumentoEmEdicao();
  });

  it('sai do estado neutro ao abrir um documento', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    verificarDocumentoEmEdicao();
  });

  it('volta ao estado neutro com fecharDocumento() e retorna ao abrir outro documento', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.get('lexml-eta').then($el => ($el[0] as any).fecharDocumento());
    verificarEstadoNeutro();

    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    verificarDocumentoEmEdicao();
  });

  it('descarta o documento anterior ao abrir um segundo documento', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.get('lexml-eta-opcoes-impressao').shadow().find('#input-cabecalho').should('have.prop', 'value', 'Gabinete do Senador');

    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');

    cy.get('lexml-eta-opcoes-impressao').shadow().find('#input-cabecalho').should('have.prop', 'value', '');
  });
});
