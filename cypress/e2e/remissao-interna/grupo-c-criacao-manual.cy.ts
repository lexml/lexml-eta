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
 * Nota sobre o botão "Confirmar" (sl-button):
 *   cy.click() despacha mousedown → browser limpa document.getSelection() → quill.getSelection()
 *   em criarRemissao() lê estado errado (posição de Art. 2 em vez de Art. 1). O link é criado
 *   no dispositivo errado.
 *   Solução: usar sl-button.click() nativo via cy.window().then(), que não despacha mousedown
 *   e preserva o savedRange capturado em abrirDialogoRemissaoInterna().
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
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('Abrir diálogo, buscar dispositivo, clicar item e confirmar cria 1 link', () => {
    // Posiciona cursor e abre o diálogo no mesmo bloco síncrono para evitar race conditions:
    // um setTimeout(..., 100) de StateType.ElementoMarcado pode alterar quill.getSelection()
    // entre posicionarCursorNoDispositivo() e o click() do botão. Ao combinar os dois em um
    // único cy.window().then(), nenhuma tarefa assíncrona pode interferir.
    cy.getContainerArtigoByNumero(1).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const p = $container[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
        if (!p) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(p);
        if (!blot) return;

        const blotStart = blot.offset(quill.scroll);
        quill.setSelection(blotStart, 0, 'user');

        // Abre o diálogo imediatamente após setSelection, no mesmo tick síncrono.
        // Click nativo: não despacha mousedown, não interfere com document.getSelection().
        const btn = win.document.querySelector('.btn-remissao-interna') as HTMLElement;
        btn?.click();
      });
    });

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

    // Click nativo: cy.click() despacha mousedown que limpa document.getSelection(), fazendo
    // quill.getSelection() retornar estado errado (Art. 2 em vez de Art. 1) ao chamar criarRemissao.
    // sl-button.click() → this.button.click() (shadow) → click sem mousedown → savedRange preservado.
    cy.window().then(win => {
      (win.document.querySelector(SEL_BTN_CONFIRMAR) as any)?.click();
    });

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
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
  });

  it('Duplo clique no item confirma sem precisar clicar no botão "Confirmar"', () => {
    // Posiciona cursor e abre o diálogo via click nativo (mesmo padrão de CT-C-01).
    // cy.click() despacha mousedown que limpa selection — click nativo preserva savedRange.
    cy.getContainerArtigoByNumero(1).then($container => {
      return cy.window().then(win => {
        const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
        const quill = editorEl?.quill;
        if (!quill) return;

        const p = $container[0]?.querySelector('div.container__texto p.texto__dispositivo') as HTMLElement;
        if (!p) return;

        const EtaQuillClass = quill.constructor as any;
        const blot = EtaQuillClass.find(p);
        if (!blot) return;

        const blotStart = blot.offset(quill.scroll);
        quill.setSelection(blotStart, 0, 'user');

        const btn = win.document.querySelector('.btn-remissao-interna') as HTMLElement;
        btn?.click();
      });
    });

    cy.get(SEL_DIALOG).should('exist');

    // Busca o dispositivo
    cy.get(SEL_INPUT_BUSCA).shadow().find('input').type('Art. 2');
    cy.get(SEL_ITEM).should('have.length.gte', 1);

    // Clique simples para habilitar o botão Confirmar
    cy.get(SEL_ITEM).first().click();

    // Aguardar o shadow button ficar habilitado
    cy.get(SEL_BTN_CONFIRMAR).shadow().find('button').should('not.have.attr', 'disabled');

    // Duplo clique nativo no item: aciona listener dblclick → btnConfirmar.click()
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
