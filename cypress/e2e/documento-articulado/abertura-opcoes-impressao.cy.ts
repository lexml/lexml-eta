/**
 * Abertura de documento articulado salvo com opções de impressão.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-09-22-c01-salvar-abrir-opcoes-impressao.
 * Fixture: demo/doc/teste_opcoes_impressao.json, gerado por criarDocumentoArticulado() (mesmo código
 * de produção usado ao salvar), não escrito à mão.
 */

const SEL_FORM_OPCOES_IMPRESSAO = 'lexml-eta-opcoes-impressao';

const verificarOpcoesImpressao = (esperado: { imprimirBrasao: boolean; textoCabecalho: string; reduzirEspacoEntreLinhas: boolean; tamanhoFonte: number }): void => {
  cy.get(SEL_FORM_OPCOES_IMPRESSAO)
    .shadow()
    .find('#chk-imprimir-brasao')
    .should(esperado.imprimirBrasao ? 'be.checked' : 'not.be.checked');
  cy.get(SEL_FORM_OPCOES_IMPRESSAO).shadow().find('#input-cabecalho').should('have.prop', 'value', esperado.textoCabecalho);
  cy.get(SEL_FORM_OPCOES_IMPRESSAO)
    .shadow()
    .find('#select-tamanho-fonte')
    .should($select => expect(String(($select[0] as any).value)).to.equal(String(esperado.tamanhoFonte)));
  cy.get(SEL_FORM_OPCOES_IMPRESSAO)
    .shadow()
    .find('#chk-reduzir-espaco')
    .should(esperado.reduzirEspacoEntreLinhas ? 'be.checked' : 'not.be.checked');
};

describe('Abertura de opções de impressão persistidas', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('exibe no formulário as opções de impressão do arquivo aberto', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_opcoes_impressao.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');

    verificarOpcoesImpressao({ imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 });
  });

  it('volta aos valores padrão ao abrir em seguida um arquivo sem opções de impressão', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_opcoes_impressao.json', { force: true });
    cy.getContainerArtigoByNumero(1).should('exist');
    verificarOpcoesImpressao({ imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 });

    // Arquivo com MetadadoProprietario, mas sem o grupo de opções de impressão.
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });
    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida');

    verificarOpcoesImpressao({ imprimirBrasao: true, textoCabecalho: '', reduzirEspacoEntreLinhas: false, tamanhoFonte: 14 });
  });
});
