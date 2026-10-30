/**
 * Estado neutro, nova proposição e abertura de documento pela interface do componente.
 *
 * Cobre, pela UI real da demo, a change 2026-10-27-c01-rever-interface-lexml-eta (#1016).
 * Sem fixture nova: o documento aberto é demo/doc/teste_opcoes_impressao.json. A viabilidade do E2E segue
 * docs/guia-cypress.md: a demo chama novaProposicao/abrirDocumentoArticulado pelos botões "Nova proposição" e
 * pelo upload, e fecharDocumento() pelo botão "Resetar".
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

  it('ajusta a altura do componente já no estado neutro', () => {
    cy.get('lexml-eta').should($el => {
      expect(($el[0] as HTMLElement).style.getPropertyValue('--height')).to.match(/^\d+(\.\d+)?px$/);
    });
    cy.get(SEL_AGUARDANDO).should($el => expect($el[0].getBoundingClientRect().height).to.be.greaterThan(300));
  });

  it('não exibe barra de rolagem na área do texto no estado neutro', () => {
    cy.get('sl-tab-panel[name="lexml-eta-proposicao"]').should($painel => {
      const base = $painel[0].shadowRoot!.querySelector('[part="base"]') as HTMLElement;
      expect(base.scrollHeight, 'conteúdo não excede a área visível').to.be.lte(base.clientHeight);
    });
  });

  it('sai do estado neutro ao criar uma nova proposição', () => {
    cy.novaProposicao();

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

    cy.get('input[type="button"][value="Resetar"]').click();
    verificarEstadoNeutro();

    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    verificarDocumentoEmEdicao();
  });

  it('filtra a lista de documentos pelo vocabulário da casa do editor', () => {
    cy.get('#projetoNorma option[value="pl_5008_2023"]').should('exist');
    cy.get('#projetoNorma option[value="cd_pl_5008_2023"]').should('not.exist');
    cy.get('#projetoNorma option[value="mpv_905_2019"]').should('exist');

    cy.get('#casaEditor').select('CD');
    cy.get('#projetoNorma option[value="cd_pl_5008_2023"]').should('exist');
    cy.get('#projetoNorma option[value="pl_5008_2023"]').should('not.exist');
    cy.get('#projetoNorma option[value="mpv_905_2019"]').should('exist');
  });

  it('cria nova proposição da casa selecionada e volta ao estado neutro ao trocar a casa', () => {
    cy.get('#casaEditor').select('CD');
    cy.novaProposicao();
    verificarDocumentoEmEdicao();

    cy.get('#casaEditor').select('SF');
    verificarEstadoNeutro();
  });

  it('descarta o documento anterior ao abrir um segundo documento', () => {
    cy.get('#fileUpload').selectFile(ARQUIVO, { force: true });
    cy.get('lexml-eta-opcoes-impressao').shadow().find('#input-cabecalho').should('have.prop', 'value', 'Gabinete do Senador');

    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');

    cy.get('lexml-eta-opcoes-impressao').shadow().find('#input-cabecalho').should('have.prop', 'value', '');
  });
});
