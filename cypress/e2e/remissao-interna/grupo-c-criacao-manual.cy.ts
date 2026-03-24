/**
 * Grupo C — Criação Manual: Remissão via Diálogo
 *
 * O botão ".btn-remissao-interna" abre um sl-dialog (appendado a document.body —
 * light DOM). O diálogo permite buscar dispositivos por rótulo/tipo/texto e criar
 * um link de remissão com texto fixo (textoFixo: true).
 *
 * Pré-condição para abrir o diálogo: quill.getSelection() != null.
 * Usamos posicionarCursorNoDispositivo() para definir a seleção antes do clique.
 *
 * O <input> real do sl-input Shoelace está no shadow DOM → acessado via .shadow().find('input').
 * Os itens da lista (.dispositivo-item) e os botões (sl-button) estão no light DOM do sl-dialog.
 */

// Seletores estáveis do diálogo de remissão
const SEL_DIALOG = 'sl-dialog[label="Adicionar Remissão Interna"]';
const SEL_INPUT_BUSCA = '#busca-dispositivo';
const SEL_ITEM = '.dispositivo-item';
const SEL_BTN_CONFIRMAR = '#btn-confirmar';

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 + Art. 2
// ─────────────────────────────────────────────────────────────────────────────
describe('Criação manual: fluxo completo via botão "Confirmar"', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('Abrir diálogo, buscar dispositivo, clicar item e confirmar cria 1 link', () => {
    // Posiciona cursor no Quill do art. 1 (pré-condição para quill.getSelection())
    cy.getContainerArtigoByNumero(1).posicionarCursorNoDispositivo();

    // Clica no botão "Adicionar remissão interna" da toolbar
    cy.get('.btn-remissao-interna').click();

    // Diálogo deve abrir
    cy.get(SEL_DIALOG).should('exist');

    // Digita no campo de busca (o <input> está no shadow DOM do sl-input Shoelace)
    cy.get(SEL_INPUT_BUSCA).shadow().find('input').type('Art. 2');

    // Pelo menos 1 item deve aparecer na lista filtrada
    cy.get(SEL_ITEM).should('have.length.gte', 1);

    // Clica no item que contém "Art. 2" (seleção simples — habilita o botão Confirmar)
    cy.get(SEL_ITEM).contains('Art. 2').click();

    // Aguarda o Lit propagar disabled=false ao shadow button antes de clicar.
    // Sem este wait, sl-button.click() pode delegar a um shadow button ainda disabled.
    cy.get(SEL_BTN_CONFIRMAR).shadow().find('button').should('not.have.attr', 'disabled');

    // Confirma via botão (cria o link e fecha o diálogo)
    cy.get(SEL_BTN_CONFIRMAR).click();

    // Diálogo deve fechar
    cy.get(SEL_DIALOG).should('not.exist');

    // Link de remissão deve ter sido criado no art. 1
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: Art. 1 + Art. 2
// ─────────────────────────────────────────────────────────────────────────────
describe('Criação manual: confirmação via duplo clique no item do diálogo', () => {
  beforeEach(() => {
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('Duplo clique no item confirma sem precisar clicar no botão "Confirmar"', () => {
    // Posiciona cursor no Quill do art. 1
    cy.getContainerArtigoByNumero(1).posicionarCursorNoDispositivo();

    // Abre o diálogo
    cy.get('.btn-remissao-interna').click();
    cy.get(SEL_DIALOG).should('exist');

    // Busca o dispositivo
    cy.get(SEL_INPUT_BUSCA).shadow().find('input').type('Art. 2');
    cy.get(SEL_ITEM).should('have.length.gte', 1);

    // Clique simples para habilitar o botão Confirmar (define disabled=false na prop do sl-button).
    cy.get(SEL_ITEM).first().click();

    // Aguardar o LitElement aplicar a atualização ao shadow button.
    // O sl-button sobrescreve click() para chamar this.button.click() (shadow <button>).
    // Browsers ignoram .click() em elementos com disabled attribute (HTML spec §buttons).
    // Sem este await, o dblclick dispara btnConfirmar.click() antes do Lit remover o disabled.
    cy.get(SEL_BTN_CONFIRMAR).shadow().find('button').should('not.have.attr', 'disabled');

    // Despachar dblclick nativamente: btnConfirmar.click() agora chama o shadow button habilitado
    cy.get(SEL_ITEM)
      .first()
      .then($item => {
        $item[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
      });

    // Diálogo deve fechar e link criado sem precisar do botão Confirmar
    cy.get(SEL_DIALOG).should('not.exist');
    cy.getContainerArtigoByNumero(1).find('a.lexml-remissao-interna').should('have.length', 1);
  });
});
