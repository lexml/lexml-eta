/**
 * Abertura de documento articulado salvo com remissão interna inválida.
 *
 * Cobre, pela UI real, o lado "abrir" da change 2026-09-16-c01-persistir-remissao-interna-invalida:
 * abrir um arquivo já salvo com uma remissão interna inválida (destino excluído antes de salvar,
 * com `MetadadoProprietario`/`RemissoesInternasInvalidas` populados) deve reconstruir o alerta
 * global e a mensagem de erro no dispositivo de origem — sem depender de nenhuma edição ao vivo.
 *
 * Fixture: demo/doc/teste_remissao_invalida.json, gerado por criarDocumentoArticulado() (mesmo
 * código de produção usado ao salvar) — não escrito à mão, para garantir fidelidade estrutural.
 */

const SEL_MENSAGEM_INVALIDA = '.container__texto--mensagem .mensagem--danger';

describe('Abertura de remissão interna inválida persistida', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('reconstrói o alerta global e a mensagem de erro no dispositivo ao abrir o arquivo', () => {
    cy.get('#fileUpload').selectFile('demo/doc/teste_remissao_invalida.json', { force: true });

    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(1).find(SEL_MENSAGEM_INVALIDA).should('exist').and('contain.text', 'excluído');

    cy.get('lexml-eta-alertas').shadow().find('sl-alert').should('contain.text', 'contém remissão inválida para dispositivo excluído');
  });
});
