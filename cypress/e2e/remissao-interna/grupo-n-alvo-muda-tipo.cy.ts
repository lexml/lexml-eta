/**
 * Grupo N — issue lexml-eta#1032: destino que muda de tipo recebe a cadeia completa.
 *
 * "art. 2º" não tem qualificador, então caía na regra enxuta (D4); quando o TAB transformava o
 * art. 2º em parágrafo único do art. 1º, o texto virava só "parágrafo único". Corrigido em
 * sincronizarRemissoes.ts (mudouTipoDoDestino). Matriz unitária em
 * test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts.
 */
const SEL_LINK_N = 'a.lexml-remissao-interna';
const SEL_BTN_DESFAZER_N = '.lx-eta-btn-desfazer';

describe('Grupo N: remissão cujo destino muda de tipo', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao();
    cy.getContainerArtigoByNumero(1).should('exist');

    // Menus antes das edições de texto: ver CT-H-02 (IndexSizeError após alterarTextoDoDispositivo).
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(2).should('exist');
    cy.getContainerArtigoByNumero(2).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
    cy.getContainerArtigoByNumero(3).should('exist');

    cy.getContainerArtigoByNumero(1).alterarTextoDoDispositivo('Texto do artigo primeiro.');
    cy.getContainerArtigoByNumero(2).alterarTextoDoDispositivo('Texto do artigo segundo.');
  });

  it('CT-N-01: TAB no art. 2º atualiza "art. 2º" para "parágrafo único do art. 1º"; desfazer volta para "art. 2º"', () => {
    cy.getContainerArtigoByNumero(3).digitarTextoRemissao('Conforme o art. 2º, aplica-se o disposto.');
    cy.getContainerArtigoByNumero(3).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(3).find(SEL_LINK_N).should('have.length', 1).and('have.attr', 'data-lexml-ref', 'art2').and('have.text', 'art. 2º');

    // O TAB age sobre linhaAtual, que ficou no art. 3º; marcar a linha direto no Quill evita clicar (sair da linha
    // dispara ações assíncronas de detecção, que podem entrar no histórico depois do TAB e ser desfeitas no lugar dele).
    cy.getContainerArtigoByNumero(2).then($art2 => {
      cy.window().then((win: any) => {
        const quill = win.document.querySelector('lexml-eta-proposicao-editor').quill;
        const p = $art2[0].querySelector('p.texto__dispositivo') as HTMLElement;
        quill.atualizarLinhaCorrente(quill.getLinha(parseInt(p.id.replace('texto__dispositivo', ''), 10)));
      });
    });
    cy.getContainerArtigoByNumero(2).find('p.texto__dispositivo').trigger('keydown', { key: 'Tab', bubbles: true, cancelable: true, force: true });
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length', 1).and('contain.text', 'Texto do artigo segundo.');

    cy.get(SEL_LINK_N).should('have.length', 1).and('have.text', 'parágrafo único do art. 1º').and('have.attr', 'data-lexml-ref', 'art1_par1u');

    // Com a pilha de texto do Quill ainda cheia (limparHistory a esvazia num setTimeout), desfazer reverteria só o rótulo renumerado.
    cy.window().should((win: any) => {
      expect(win.document.querySelector('lexml-eta-proposicao-editor').quill.history.stack.undo).to.have.length(0);
    });
    cy.get(SEL_BTN_DESFAZER_N).click();
    cy.get('div.container__elemento.elemento-tipo-paragrafo').should('have.length', 0);

    cy.get(SEL_LINK_N).should('have.length', 1).and('have.text', 'art. 2º').and('have.attr', 'data-lexml-ref', 'art2');
  });
});
